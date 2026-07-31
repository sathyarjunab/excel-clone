import { DBSchema, IDBPDatabase, openDB } from "idb";
import { Sheet } from "../types/book";

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

export type Chunk = { range: string; sheets: Sheet[] };

export interface IIDB {
  saveChunk(chunk: Chunk): Promise<void>;

  getChunk(range: string): Promise<Chunk | undefined>;

  removeChunk(range: string): Promise<void>;

  clearChunks(): Promise<void>;
}

export class IDB implements IIDB {
  private db: Promise<IDBPDatabase<ExcelDBSchema>>;
  private DATA_BASE_VERSION = 1;

  constructor() {
    this.db = openDB("excel-clone", this.DATA_BASE_VERSION, {
      upgrade(db) {
        const store = db.createObjectStore("chunks", {
          keyPath: "range",
        });

        store.createIndex("bookId", "bookId");
      },
    });
  }

  //TODO: change the type from any -> valid one
  async saveChunk(chunk: Chunk) {
    const database = await this.db;
    console.log(chunk);
    await database.put("chunks", chunk);
  }

  async getChunk(range: string): Promise<Chunk | undefined> {
    const database = await this.db;

    return database.get("chunks", range);
  }

  async removeChunk(range: string) {
    const database = await this.db;

    await database.delete("chunks", range);
  }

  async clearChunks() {
    const database = await this.db;

    await database.clear("chunks");
  }
}
