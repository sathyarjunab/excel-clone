CREATE TABLE IF NOT EXISTS sheets (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL DEFAULT 'Untitled Sheet',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS cells (
  id SERIAL PRIMARY KEY,
  sheet_id INTEGER NOT NULL REFERENCES sheets(id) ON DELETE CASCADE,
  row_index INTEGER NOT NULL,
  col_index INTEGER NOT NULL,
  value TEXT,
  formula TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (sheet_id, row_index, col_index)
);

CREATE INDEX IF NOT EXISTS idx_cells_sheet_id ON cells(sheet_id);
