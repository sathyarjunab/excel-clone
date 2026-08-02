import { DB } from "../../../db/pool.js";
import { IBookRepository } from "../interface.js";

export class PrismaBookRepository implements IBookRepository {
  findByUser(userId: string) {
    return DB.book.findMany({ where: { userId } });
  }

  create(bookName: string, userId: string) {
    return DB.book.create({ data: { bookName, userId } });
  }
}
