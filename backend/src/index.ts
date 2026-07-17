import cors from "cors";
import express, { NextFunction, Request, Response } from "express";
import { sheetsRouter } from "./routes/sheets.js";
import dbPool from "./db/pool.js";
import { validateEnv } from "./env.js";

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors({ origin: process.env.CLIENT_ORIGIN || "http://localhost:5173" }));
app.use(express.json());

app.get("/api/health", (_req: Request, res: Response) =>
  res.json({ status: "ok" }),
);
app.use("/api/sheets", sheetsRouter);

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
