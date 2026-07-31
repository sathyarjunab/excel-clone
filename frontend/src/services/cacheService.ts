import { X_MAX_RANGE } from "../constents";
import { Sheet } from "../types/book";
import { fetcher } from "../util/httpReq";
import { IIDB } from "../util/idb";

// we need to keep current range the sheet is at.

// debouncer needed
// fetch from the IDB for the caches data
// fetch from the DB for the data that is not there in the caches IDB
// fetch the next scroll data to in all four directions
// what if i scroll to a page and the idb has partial data
//if i keep on adding the value to idb then i need to clear them using any of the logic i know.
export interface IGatherer {
  sheetName: string;

  getData({
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

export class Gatherer implements IGatherer {
  constructor(
    public sheetName: string,
    public IDB: IIDB,
  ) {}

  private async gatherApiData({
    endCol,
    endRow,
    startCol,
    topRow,
  }: {
    topRow: number;
    endRow: number;
    startCol: number;
    endCol: number;
  }) {
    const { data } = await fetcher<Sheet[]>("/sheets/sheet", "GET", true, {
      sheetName: this.sheetName,
      startRow: topRow,
      endRow: endRow,
      startCol: startCol,
      endCol: endCol,
    });

    return data;
  }

  private rangeConvertor(row: number, col: number): string {
    const rowRange = Math.max(Math.ceil(row / X_MAX_RANGE), 1) * 500;
    const colRange = Math.max(Math.ceil(col / X_MAX_RANGE), 1) * 500;
    return `${rowRange}-${colRange}`;
  }

  public async getData({
    endCol,
    endRow,
    startCol,
    topRow,
  }: {
    topRow: number;
    endRow: number;
    startCol: number;
    endCol: number;
  }) {
    const range = this.rangeConvertor(topRow, startCol);
    // 1. ✅ if found the data in the cached db send it back with no db req.
    const cachedData = await this.IDB.getChunk(range);
    console.log(cachedData);
    if (cachedData) return cachedData.sheets;
    //2. 😒 got the data from the db.
    const freshData = await this.gatherApiData({
      endCol,
      endRow,
      startCol,
      topRow,
    });
    if (freshData)
      //3. 😊 cached the data in idb here.
      this.IDB.saveChunk({
        range: freshData[0]?.range ?? range,
        sheets: freshData,
      });
    return freshData;
  }
}
