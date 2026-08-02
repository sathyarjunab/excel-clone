import { book } from "../../generated/prisma/client.js";

export interface IBookService {
  listForUser(userId: string): Promise<book[]>;
  create(userId: string, bookName: string): Promise<book>;
}
