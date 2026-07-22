import { Router } from "express";
import { DB } from "../db/pool.js";
import Joi from "joi";

const bookRouter = Router();

bookRouter.get("/books", async (req, res) => {
  const userId = req.user?.id;
  if (!userId) return res.status(401).json({ message: "Unauthorized" });

  let books = await DB.book.findMany({
    where: {
      userId,
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

bookRouter.post("/book", async (req, res) => {
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

export default bookRouter;
