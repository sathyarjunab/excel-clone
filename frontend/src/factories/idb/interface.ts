import { DBSchema } from "idb";
import { Grid, Sheet } from "../../types/book";

export interface ExcelDBSchema extends DBSchema {
  chunks: {
    key: [string, string];
    value: Sheet & { timestamp: Date };
    indexes: {
      bookId_index: string;
      sheetName_index: string;
    };
  };

  appStore: {
    key: "dirtyCells";
    value: Record<`${string}-${string}`, Grid>;
  };
}

export interface Icache {
  saveChunk(chunk: Sheet[]): Promise<void>;

  getChunk(range: string, sheetName: String): Promise<Sheet | undefined>;

  removeChunk(range: string, sheetName: String): Promise<void>;

  clearChunks(): Promise<void>;

  saveDirtyCell(dirtyCells: Record<`${string}-${string}`, Grid>): Promise<void>;

  getDirtyCells(): Promise<Record<`${string}-${string}`, Grid>>;
}
