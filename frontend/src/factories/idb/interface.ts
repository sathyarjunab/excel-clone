import { DBSchema } from "idb";
import { Grid, Sheet } from "../../types/book";

export interface ExcelDBSchema extends DBSchema {
  chunks: {
    key: string;
    value: Sheet & { timestamp: Date };
    indexes: {
      bookId_index: string;
    };
  };

  appStore: {
    key: "dirtyCells";
    value: Record<`${string}-${string}`, Grid>;
  };
}

export interface Icache {
  saveChunk(chunk: Sheet[]): Promise<void>;

  getChunk(range: string): Promise<Sheet | undefined>;

  removeChunk(range: string): Promise<void>;

  clearChunks(): Promise<void>;

  saveDirtyCell(dirtyCells: Record<`${string}-${string}`, Grid>): Promise<void>;

  getDirtyCells(): Promise<Record<`${string}-${string}`, Grid>>;
}
