import { IDBPDatabase, openDB } from "idb";
import { Grid, Sheet } from "../../types/book";
import { ExcelDBSchema, Icache } from "./interface";

export class IDB implements Icache {
  private db: Promise<IDBPDatabase<ExcelDBSchema>>;
  private DATA_BASE_VERSION = 6;
  private TEN_MINUTES_IN_MS = 10 * 60 * 1000; // 600,000 ms

  constructor() {
    this.db = openDB("excel-clone", this.DATA_BASE_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains("chunks")) {
          const store = db.createObjectStore("chunks", {
            keyPath: ["range", "sheetName"],
          });
          store.createIndex("bookId_index", "bookId");
          store.createIndex("sheetName_index", "sheetName");
        }

        if (!db.objectStoreNames.contains("appStore")) {
          db.createObjectStore("appStore");
        }
      },
    });
  }
  async saveChunk(chunk: Sheet[]) {
    const database = await this.db;
    // Create a single transaction for the "chunks" store
    const tx = database.transaction("chunks", "readwrite");

    // Put all items into the store concurrently within the transaction
    await Promise.all([
      ...chunk.map((item) => tx.store.put({ ...item, timestamp: new Date() })),
      tx.done,
    ]);
  }

  async getChunk(range: string, sheetName: string): Promise<Sheet | undefined> {
    const database = await this.db;
    const sheets = await database.get("chunks", [range, sheetName]);
    if (
      sheets?.timestamp &&
      Date.now() - new Date(sheets.timestamp).getTime() > this.TEN_MINUTES_IN_MS
    ) {
      this.removeChunk(range, sheetName);
    }
    return sheets;
  }

  async removeChunk(range: string, sheetName: string) {
    const database = await this.db;

    await database.delete("chunks", [range, sheetName]);
  }

  async clearChunks() {
    const database = await this.db;

    await database.clear("chunks");
  }

  async saveDirtyCell(sheetData: Record<`${string}-${string}`, Grid>) {
    const database = await this.db;
    await database.put("appStore", sheetData, "dirtyCells");
  }

  async getDirtyCells(): Promise<Record<`${string}-${string}`, Grid>> {
    const database = await this.db;
    const dirtyCells = (await database.get("appStore", "dirtyCells")) || {};
    return dirtyCells;
  }

  async removeSheet(sheetName: string) {
    const database = await this.db;
    const tx = database.transaction("chunks", "readwrite");

    const index = tx.store.index("sheetName_index");

    let cursor = await index.openCursor(sheetName);

    while (cursor) {
      await cursor.delete();
      cursor = await cursor.continue();
    }

    await tx.done;
  }
}

export const idbSingleton = new IDB();
