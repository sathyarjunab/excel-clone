import { Router } from "express";
import { DB } from "../db/pool.js";
import Joi from "joi";
import { Optional } from "@prisma/client/runtime/client";
import { book, Prisma } from "../generated/prisma/client.js";

type BookWithSheets = Prisma.bookGetPayload<{
  include: {
    sheets: true;
  };
}>;

const router = Router();

router.get("/amIWorthy", (req, res) => {
  const user = req.user;
  if (!user) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  res.json({ user });
});

router.get("/books", async (req, res) => {
  const userId = req.user?.id;
  if (!userId) return res.status(401).json({ message: "Unauthorized" });

  const books: Optional<BookWithSheets>[] = await DB.book.findMany({
    where: {
      userId,
    },
    include: {
      sheets: true,
    },
  });

  if (books.length === 0) {
    books.push(
      await DB.book.create({
        data: {
          bookName: "SheetName1",
          userId: userId,
        },
      }),
    );
  }

  res.status(200).send(books);
});

router.post("/book", async (req, res) => {
  const bookName = await Joi.string().min(3).validateAsync(req.body.bookName);

  const userId = req.user?.id;
  if (!userId) return res.status(401).json({ message: "Unauthorized" });

  const createdBook = await DB.book.create({
    data: {
      bookName,
      userId,
    },
  });
  res.status(200).send(createdBook);
});

export default router;
