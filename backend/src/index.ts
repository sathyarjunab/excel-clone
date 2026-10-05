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

app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err);
  if (err instanceof Error) {
    res.status(500).json({ error: err.message });
    return;
  }
  res.status(500).json({ error: "Unknown error" });
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
