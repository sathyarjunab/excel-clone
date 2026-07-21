import { Optional } from "@prisma/client/runtime/client";
import { book } from "../generated/prisma/client.js";
import { BookWithSheets } from "../routes/user.js";

export const defaultSheet = {
  id: "default_sheet",
  cells: {},
  dirtyCells: {},
  hasChanged: false,
  name: "",
};

export function insertDummySheets(book: Optional<BookWithSheets>[]) {
  return book.map((b) => {
    if ((b.sheets ?? []).length !== 0) return b;

    return {
      ...b,
      sheets: [defaultSheet],
    };
  });
}
