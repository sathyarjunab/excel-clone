import { Sheet } from "../../types/book";

export interface IGatherer {
  sheetName: string;

  getCellData({
    endCol,
    endRow,
    startCol,
    topRow,
  }: {
    topRow: number;
    endRow: number;
    startCol: number;
    endCol: number;
  }): Promise<Sheet[] | null>;
}
