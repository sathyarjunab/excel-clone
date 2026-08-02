import { DB } from "../../../db/pool.js";
import { Prisma } from "../../../generated/prisma/client.js";
import { ISheetRepository } from "../interface.js";

// The ONLY place sheet persistence talks to Prisma. Swapping databases (or
// registering an in-memory fake for tests) means adding a sibling class here.
export class PrismaSheetRepository implements ISheetRepository {
  findByBook(userId: string, bookId: string) {
    return DB.sheet.findMany({ where: { userId, bookId } });
  }

  findByRanges(userId: string, sheetName: string, ranges: string[]) {
    return DB.sheet.findMany({
      where: { userId, sheetName, range: { in: ranges } },
    });
  }

  distinctSheetNames(userId: string, bookId: string) {
    return DB.sheet.findMany({
      where: { userId, bookId },
      distinct: "sheetName",
      select: { sheetName: true, id: true },
    });
  }

  create(data: Prisma.sheetUncheckedCreateInput) {
    return DB.sheet.create({ data });
  }

  updateData(id: string, data: Prisma.InputJsonValue) {
    return DB.sheet.update({ where: { id }, data: { data } });
  }
}
