import { Grid } from "../../types/book";
import { rangeConvertor } from "../../util/sheet";
import { clientDbSource, clientDbSourceType } from "../registory/clientDb";
import { dataSource, DataSourceType } from "../registory/dataSource";
import { IGatherer } from "./interface";

// we need to keep current range the sheet is at.

// debouncer needed
// fetch from the IDB for the caches data
// fetch from the DB for the data that is not there in the caches IDB
// fetch the next scroll data to in all four directions
// what if i scroll to a page and the idb has partial data
//if i keep on adding the value to idb then i need to clear them using any of the logic i know.

export class Gatherer implements IGatherer {
  constructor(
    public sheetName: string,
    public cachingServiceType: clientDbSourceType,
    public dataSourceType: DataSourceType,
  ) {}

  public async getCellData({
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
    const range = rangeConvertor(topRow, startCol);

    // 1. ✅ if found the data in the cached db send it back with no db req.
    const clientDbInstance = await clientDbSource[this.cachingServiceType]();
    const cachedData = await clientDbInstance.getChunk(range, this.sheetName);
    if (cachedData) return [cachedData];

    //2. 😒 got the data from the db.
    const gatherApiData = await dataSource[this.dataSourceType]();
    const freshData = await gatherApiData.gatherData({
      endCol,
      endRow,
      startCol,
      topRow,
      sheetName: this.sheetName,
    });

    if (freshData)
      //3. 😊 cached the data in idb here.
      await clientDbInstance.saveChunk(freshData);
    return freshData;
  }

  // Write-through: when a cell is edited we patch the cached chunk in place so a
  // later scroll back to this region serves the edited value instead of the
  // stale copy that was cached on the first fetch.
  public async updateCellInCache(
    row: number,
    col: number,
    cellKey: `${string}-${string}`,
    grid: Grid,
  ): Promise<void> {
    const range = rangeConvertor(row, col);
    const clientDbInstance = await clientDbSource[this.cachingServiceType]();
    let sheet = await clientDbInstance.getChunk(range, this.sheetName);
    if (!sheet) return;

    ((sheet = {
      ...sheet,
      data: {
        ...(sheet.data ?? {}),
        [cellKey]: grid,
      },
    }),
      await clientDbInstance.saveChunk([sheet]));
  }
}
