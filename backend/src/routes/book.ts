import { Router } from "express";
import Joi from "joi";
import { REPOSITORY_TYPE } from "../constents.js";
import { bookRepository } from "../factories/registory/repository.js";
import { BookService } from "../services/book/service.js";

const bookRouter = Router();

const getBookService = async () =>
  new BookService(await bookRepository[REPOSITORY_TYPE]());

bookRouter.get("/books", async (req, res) => {
  const userId = req.user?.id;
  if (!userId) return res.status(401).json({ message: "Unauthorized" });

  const service = await getBookService();
  const books = await service.listForUser(userId);

  res.status(200).send(books);
});

bookRouter.post("/book", async (req, res) => {
  const bookName = await Joi.string().min(3).validateAsync(req.body.bookName);

  const userId = req.user?.id;
  if (!userId) return res.status(401).json({ message: "Unauthorized" });

  const service = await getBookService();
  const createdBook = await service.create(userId, bookName);

  res.status(200).send(createdBook);
});

export default bookRouter;
