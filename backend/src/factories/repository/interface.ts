import { Prisma, book, sheet, user } from "../../generated/prisma/client.js";

// Data-access contracts. Everything above this line (services, routes) depends
// only on these interfaces — never on Prisma directly — so the persistence
// engine can be swapped by registering another implementation in the registry.

export interface ISheetRepository {
  findByBook(userId: string, bookId: string): Promise<sheet[]>;
  findByRanges(
    userId: string,
    sheetName: string,
    ranges: string[],
  ): Promise<sheet[]>;
  distinctSheetNames(
    userId: string,
    bookId: string,
  ): Promise<Pick<sheet, "sheetName" | "id">[]>;
  create(data: Prisma.sheetUncheckedCreateInput): Promise<sheet>;
  updateData(id: string, data: Prisma.InputJsonValue): Promise<sheet>;
}

export interface IBookRepository {
  findByUser(userId: string): Promise<book[]>;
  create(bookName: string, userId: string): Promise<book>;
}

export interface IUserRepository {
  findByToken(hashedToken: string): Promise<user | null>;
  create(name: string, hashedToken: string): Promise<user>;
}
