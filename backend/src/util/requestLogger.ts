import { NextFunction, Request, Response } from "express";
import { logger } from "../logger.js";

// Logs one line per request once the response is sent: method, URL, status code
// and how long it took to process. Winston's JSON console transport means each
// line shows up in Render's logs as structured, greppable JSON, e.g.:
//   {"level":"info","message":"request","method":"POST",
//    "url":"/api/sheets/sheet/cellValue","status":200,"durationMs":42.7}
export function requestLogger(req: Request, res: Response, next: NextFunction) {
  const start = process.hrtime.bigint();

  res.on("finish", () => {
    const durationMs = Number(process.hrtime.bigint() - start) / 1_000_000;
    logger.info("request", {
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      durationMs: Math.round(durationMs * 10) / 10,
    });
  });

  next();
}
