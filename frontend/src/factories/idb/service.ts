import { IDBPDatabase, openDB } from "idb";
import { ExcelDBSchema, Icache } from "./interface";
import { Sheet } from "../../types/book";

export class IDB implements Icache {
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
  async saveChunk(chunk: Sheet[]) {
    const database = await this.db;
    // Create a single transaction for the "chunks" store
    const tx = database.transaction("chunks", "readwrite");

    // Put all items into the store concurrently within the transaction
    await Promise.all([...chunk.map((item) => tx.store.put(item)), tx.done]);
  }

  async getChunk(range: string): Promise<Sheet | undefined> {
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
