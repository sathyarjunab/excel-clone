import { NextFunction, Request, Response } from "express";
import { logger } from "../logger.js";

// Logs one line per request once the response is sent: method, URL, status code
// and how long it took to process. Winston's JSON console transport means each
// line shows up in Render's logs as structured, greppable JSON, e.g.:
//   {"level":"info","message":"request","method":"POST",
//    "url":"/api/sheets/sheet/cellValue","status":200,"durationMs":42.7}
// Paths we don't log: the platform (Render) polls the health check constantly,
// which would otherwise flood the logs with identical lines.
const SKIP_PATHS = new Set(["/api/health"]);

export function requestLogger(req: Request, res: Response, next: NextFunction) {
  if (SKIP_PATHS.has(req.path)) return next();

  const start = process.hrtime.bigint();
  let logged = false;

  const log = (aborted: boolean) => {
    if (logged) return; // never log the same request twice
    logged = true;
    const durationMs = Number(process.hrtime.bigint() - start) / 1_000_000;
    logger.info("request", {
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      durationMs: Math.round(durationMs * 10) / 10,
      // The response never completed (client aborted or the socket dropped), so
      // the status above is not meaningful — flag it so slow/broken requests are
      // visible instead of silently missing.
      ...(aborted ? { aborted: true } : {}),
    });
  };

  // `finish` = the response was fully sent (including the 500 our error handler
  // writes, so thrown errors ARE logged here).
  res.on("finish", () => log(false));
  // `close` = the connection closed. If it closed before the response finished,
  // the request aborted — log it so it isn't lost.
  res.on("close", () => {
    if (!res.writableFinished) log(true);
  });

  next();
}
