import { Prisma } from "../../generated/prisma/client.js";
import { ISheetRepository } from "../../factories/repository/interface.js";
import {
  rangeCalculator,
  rangeGetter,
  rowsColConvertor,
} from "../../util/sheet.js";
import { GetRangeInput, ISheetService, SaveSheetInput } from "./interface.js";

// All sheet business logic lives here, decoupled from both HTTP and Prisma.
// It depends only on ISheetRepository, so it can be unit-tested against a fake.
export class SheetService implements ISheetService {
  constructor(private readonly repo: ISheetRepository) {}

  async save(userId: string, { bookId, name, dirtyCells }: SaveSheetInput) {
    const sheets = await this.repo.findByBook(userId, bookId);

    // New chunks to insert, keyed by range so multiple dirty cells landing in
    // the same (not-yet-existing) chunk are merged into ONE create.
    const createsByRange = new Map<string, Prisma.sheetUncheckedCreateInput>();

    // Updates to existing chunks, keyed by row id so every dirty cell for a
    // chunk is folded into a SINGLE update. (The old inline code issued one
    // update per cell off the same base row, so concurrent updates clobbered
    // each other — last write won and earlier cells were lost.)
    const updatesById = new Map<string, Record<string, unknown>>();

    for (const [coOrd, grid] of Object.entries(dirtyCells)) {
      const [rows, col] = rowsColConvertor(coOrd);

      const existingRow = sheets.find((s) => {
        const [r, c] = rowsColConvertor(s.range);
        return rows <= r && col <= c && s.sheetName === name;
      });

      if (!existingRow) {
        const range = rangeGetter(rows, col);
        const pending = createsByRange.get(range);

        if (pending) {
          createsByRange.set(range, {
            ...pending,
            data: { ...(pending.data as Prisma.JsonObject), [coOrd]: grid },
          });
        } else {
          createsByRange.set(range, {
            data: { [coOrd]: grid },
            range,
            sheetName: name,
            userId,
            chunksCount: sheets.length + 1,
            bookId,
          });
        }
      } else {
        const merged =
          updatesById.get(existingRow.id) ??
          ({ ...(existingRow.data as Prisma.JsonObject) } as Record<
            string,
            unknown
          >);
        merged[coOrd] = grid;
        updatesById.set(existingRow.id, merged);
      }
    }

    const operations: Promise<unknown>[] = [];
    for (const body of createsByRange.values()) {
      operations.push(this.repo.create(body));
    }
    for (const [id, data] of updatesById) {
      operations.push(this.repo.updateData(id, data as Prisma.InputJsonValue));
    }

    await Promise.allSettled(operations);
  }

  getRange(
    userId: string,
    { sheetName, startRow, endRow, startCol, endCol }: GetRangeInput,
  ) {
    const ranges = rangeCalculator(startRow, endRow, startCol, endCol);
    return this.repo.findByRanges(userId, sheetName, ranges);
  }

  async getSheetNames(userId: string, bookId: string) {
    const sheets = await this.repo.distinctSheetNames(userId, bookId);
    return sheets.map((s) => ({ sheetNames: s.sheetName, id: s.id }));
  }
}
