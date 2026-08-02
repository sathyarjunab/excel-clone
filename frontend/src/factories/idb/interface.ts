import { DBSchema } from "idb";
import { Chunk } from "./service";

export interface ExcelDBSchema extends DBSchema {
  chunks: {
    key: string;
    value: Chunk;
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
  saveChunk(chunk: Chunk): Promise<void>;

  getChunk(range: string): Promise<Chunk | undefined>;

  removeChunk(range: string): Promise<void>;

  clearChunks(): Promise<void>;
}
