import { sheet } from "../../generated/prisma/client.js";
import { Grid } from "../../types/book.js";

export type SaveSheetInput = {
  bookId: string;
  name: string;
  dirtyCells: Record<`${string}-${string}`, Grid>;
};

export type GetRangeInput = {
  sheetName: string;
  startRow: number;
  endRow: number;
  startCol: number;
  endCol: number;
};

export interface ISheetService {
  save(userId: string, input: SaveSheetInput): Promise<void>;
  customRangeChunksFetcher(
    userId: string,
    input: GetRangeInput,
  ): Promise<sheet[]>;
  getSheetNames(
    userId: string,
    bookId: string,
  ): Promise<{ sheetNames: string; id: string }[]>;
  removeSheet(userId: string, sheetId: string): Promise<void>;
}
