import { DBSchema } from "idb";
import { Sheet } from "../../types/book";

export interface ExcelDBSchema extends DBSchema {
  chunks: {
    key: string;
    value: Sheet & { timestamp: Date };
    indexes: {
      bookId: string;
    };
  };

  range: {
    key: string;
    value: string;
  };
}

export interface Icache {
  saveChunk(chunk: Sheet[]): Promise<void>;

  getChunk(range: string): Promise<Sheet | undefined>;

  removeChunk(range: string): Promise<void>;

  clearChunks(): Promise<void>;
}
