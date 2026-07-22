import { Optional } from "@prisma/client/runtime/client";
import { Router } from "express";
import Joi from "joi";
import { DB } from "../db/pool.js";
import { Prisma, sheet } from "../generated/prisma/client.js";
import { insertDummySheets } from "../util/book.js";
import { DeepOptional } from "../types/types.js";

type Book = Prisma.bookGetPayload<{
  include: {
    sheets: true;
  };
}>;
export type BookWithSheets = Omit<Book, "sheets"> & {
  sheets: (sheet & { hasChanged?: boolean; dirtyCells?: object })[];
};
// >;

const router = Router();

router.get("/amIWorthy", (req, res) => {
  const user = req.user;
  if (!user) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  res.json({ user });
});

export default router;
