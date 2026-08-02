import { IBookRepository } from "../../factories/repository/interface.js";
import { IBookService } from "./interface.js";

export class BookService implements IBookService {
  constructor(private readonly repo: IBookRepository) {}

  async listForUser(userId: string) {
    const books = await this.repo.findByUser(userId);

    // A user always has at least one workbook — seed one on first visit.
    if (books.length === 0) {
      books.push(await this.repo.create("SheetName1", userId));
    }

    return books;
  }

  create(userId: string, bookName: string) {
    return this.repo.create(bookName, userId);
  }
}
