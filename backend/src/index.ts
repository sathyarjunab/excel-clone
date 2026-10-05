import cookieParser from "cookie-parser";
import cors from "cors";
import express, { NextFunction, Request, Response } from "express";
import { DB } from "./db/pool.js";
import { validateEnv } from "./env.js";
import bookRouter from "./routes/book.js";
import { sheetsRouter } from "./routes/sheets.js";
import userRouter from "./routes/user.js";
import { userInjector } from "./util/user.js";
import debugRouter from "./routes/debug.js";
import compression from "compression";
import { requestLogger } from "./util/requestLogger.js";
import { logger } from "./logger.js";

const app = express();
const PORT = process.env.PORT || 4000;

app.use(compression());
app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN || "http://localhost:5173",
    credentials: true,
  }),
);
app.use(express.json());
app.use(cookieParser());

// Logs every request (method, URL, status, duration) — visible in Render logs.
app.use(requestLogger);

app.get("/api/health", (_req: Request, res: Response) =>
  res.json({ status: "ok" }),
);

app.use(userInjector);

app.use("/debug", debugRouter);
app.use("/api/user", userRouter);
app.use("/api/sheets", sheetsRouter);
app.use("/api/book", bookRouter);

// Central error handler. Express 5 auto-forwards rejected async route handlers
// here, so this logs the failure of any request — with the request context — via
// winston, so it lands in Render logs (and error.log) as structured JSON.
app.use((err: unknown, req: Request, res: Response, _next: NextFunction) => {
  const message = err instanceof Error ? err.message : "Unknown error";
  logger.error("request_error", {
    method: req.method,
    url: req.originalUrl,
    message,
    stack: err instanceof Error ? err.stack : undefined,
  });
  res.status(500).json({ error: message });
});

// Safety net for anything that escapes Express (background promises, etc.) so no
// failure goes unlogged.
process.on("unhandledRejection", (reason) => {
  logger.error("unhandledRejection", {
    reason: reason instanceof Error ? reason.stack : String(reason),
  });
});
process.on("uncaughtException", (err) => {
  logger.error("uncaughtException", { message: err.message, stack: err.stack });
  process.exit(1);
});

async function connectDb() {
  const result = validateEnv();
  if (!result) process.exit(1);

  try {
    await DB.$queryRaw`SELECT 1`;
    console.log("DB is connected.....");
    console.log(`You can access the api's in the port ${PORT}`);
  } catch (err) {
    console.error("Failed to connect to PostgreSQL");
    console.error(err);
    process.exit(1);
  }
}

app.listen(PORT, async () => {
  const result = validateEnv();
  if (!result) return;
  connectDb();
});
