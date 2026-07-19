export type Workbook = {
  name: string;
  sheets: Sheet[];
  activeSheetIndx: number;
};

export type Sheet = {
  name: string;
  bookId: string;
  cells: Record<`${string}-${string}`, Grid>;
  dirtyCells: Record<`${string}-${string}`, Grid>;
};

export type Grid = {
  style: Record<string, string>;
  content: string | null;
};
