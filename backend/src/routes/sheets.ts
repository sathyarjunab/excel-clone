import { Router, Request, Response } from "express";
import { pool } from "../db/pool.js";
import type { Sheet, Cell } from "../types.js";

export const sheetsRouter = Router();

// List all sheets
sheetsRouter.get("/", async (_req: Request, res: Response) => {
  const { rows } = await pool.query<Sheet>(
    "SELECT id, name, created_at, updated_at FROM sheets ORDER BY id"
  );
  res.json(rows);
});

// Create a new sheet
sheetsRouter.post("/", async (req: Request, res: Response) => {
  const { name } = req.body as { name?: string };
  const { rows } = await pool.query<Sheet>(
    "INSERT INTO sheets (name) VALUES ($1) RETURNING *",
    [name || "Untitled Sheet"]
  );
  res.status(201).json(rows[0]);
});

// Get a sheet with all its cells
sheetsRouter.get("/:id", async (req: Request, res: Response) => {
  const { id } = req.params;

  const sheetResult = await pool.query<Sheet>("SELECT * FROM sheets WHERE id = $1", [id]);
  if (sheetResult.rows.length === 0) {
    return res.status(404).json({ error: "Sheet not found" });
  }

  const cellsResult = await pool.query<Cell>(
    "SELECT row_index, col_index, value, formula FROM cells WHERE sheet_id = $1",
    [id]
  );

  res.json({ ...sheetResult.rows[0], cells: cellsResult.rows });
});

// Rename a sheet
sheetsRouter.patch("/:id", async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name } = req.body as { name?: string };
  const { rows } = await pool.query<Sheet>(
    "UPDATE sheets SET name = $1, updated_at = now() WHERE id = $2 RETURNING *",
    [name, id]
  );
  if (rows.length === 0) {
    return res.status(404).json({ error: "Sheet not found" });
  }
  res.json(rows[0]);
});

// Delete a sheet
sheetsRouter.delete("/:id", async (req: Request, res: Response) => {
  const { id } = req.params;
  await pool.query("DELETE FROM sheets WHERE id = $1", [id]);
  res.status(204).send();
});
