export interface Sheet {
  id: number;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface Cell {
  row_index: number;
  col_index: number;
  value: string | null;
  formula: string | null;
}

export interface SheetWithCells extends Sheet {
  cells: Cell[];
}
