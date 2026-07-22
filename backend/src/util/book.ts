import { Optional } from "@prisma/client/runtime/client";
import { book } from "../generated/prisma/client.js";
import { BookWithSheets } from "../routes/user.js";

export const defaultSheet: Omit<
  NonNullable<BookWithSheets["sheets"]>[number],
  "createdAt" | "updatedAt"
> = {
  id: "default_sheet",
  data: {},
  dirtyCells: {},
  hasChanged: false,
  sheetName: "",
  chunksCount: 1,
  range: "",
  userId: "",
  bookId: "",
};

export function insertDummySheets(book: Optional<BookWithSheets>[]) {
  return book.map((b) => {
    if ((b.sheets ?? []).length !== 0) return b;

    return {
      ...b,
      sheets: [{ ...defaultSheet, bookId: book[0].id, userId: book[0].userId }],
    };
  });
}
