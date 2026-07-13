import { Router, Request, Response } from "express";
import { pool } from "../db/pool.js";
import type { Cell } from "../types.js";

export const cellsRouter = Router();

interface UpsertCellBody {
  row_index: number;
  col_index: number;
  value?: string | null;
  formula?: string | null;
}

// Upsert a single cell's value/formula
cellsRouter.put("/:sheetId", async (req: Request, res: Response) => {
  const { sheetId } = req.params;
  const { row_index, col_index, value, formula } = req.body as UpsertCellBody;

  if (row_index === undefined || col_index === undefined) {
    return res.status(400).json({ error: "row_index and col_index are required" });
  }

  const { rows } = await pool.query<Cell>(
    `INSERT INTO cells (sheet_id, row_index, col_index, value, formula)
     VALUES ($1, $2, $3, $4, $5)
     ON CONFLICT (sheet_id, row_index, col_index)
     DO UPDATE SET value = $4, formula = $5, updated_at = now()
     RETURNING row_index, col_index, value, formula`,
    [sheetId, row_index, col_index, value ?? null, formula ?? null]
  );

  res.json(rows[0]);
});

// Clear a single cell
cellsRouter.delete("/:sheetId", async (req: Request, res: Response) => {
  const { sheetId } = req.params;
  const { row_index, col_index } = req.body as { row_index: number; col_index: number };

  await pool.query(
    "DELETE FROM cells WHERE sheet_id = $1 AND row_index = $2 AND col_index = $3",
    [sheetId, row_index, col_index]
  );

  res.status(204).send();
});
