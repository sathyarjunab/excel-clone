import cors from "cors";
import express, { NextFunction, Request, Response } from "express";
import { sheetsRouter } from "./routes/sheets.js";
import dbPool from "./db/pool.js";
import { validateEnv } from "./env.js";
import { userInjector } from "./util/user.js";
import cookieParser from "cookie-parser";
import userRouter from "./routes/user.js";
import bookRouter from "./routes/book.js";

const app = express();
const PORT = process.env.PORT || 4000;

app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN || "http://localhost:5173",
    credentials: true,
  }),
);
app.use(express.json());
app.use(cookieParser());

app.get("/api/health", (_req: Request, res: Response) =>
  res.json({ status: "ok" }),
);

app.use(userInjector);

app.use("/api/user", userRouter);
app.use("/api/sheets", sheetsRouter);
app.use("/api/book", bookRouter);

app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err);
  res.status(500).json({ error: "Internal server error" });
});

app.listen(PORT, async () => {
  const result = validateEnv();
  if (!result) return;
  await dbPool.connect();
  console.log(`Backend listening on http://localhost:${PORT}`);
});
