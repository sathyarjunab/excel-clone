import { Request, Response, Router } from "express";
import Joi from "joi";
import { REPOSITORY_TYPE } from "../constents.js";
import { sheetRepository } from "../factories/registory/repository.js";
import { SheetService } from "../services/sheet/service.js";
import {
  sheetGetterSchema,
  sheetSchema,
} from "../validator/commonValidator.js";

export const sheetsRouter = Router();

// Compose the service at the route boundary: the registry (factory) hands back
// a repository implementation, which the service depends on via its interface.
const getSheetService = async () =>
  new SheetService(await sheetRepository[REPOSITORY_TYPE]());

// Persist the client's dirty cells.
sheetsRouter.post("/save", async (req: Request, res: Response) => {
  const meta = await sheetSchema.validateAsync(req.body, {
    stripUnknown: true,
  });

  if (!req.user) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const service = await getSheetService();
  await service.save(req.user.id, {
    bookId: meta.bookId,
    name: meta.name,
    dirtyCells: meta.dirtyCells,
  });

  res.status(200).send({ message: "changes saved" });
});

// Distinct sheet names for a book.
sheetsRouter.get("/sheetNames/:bookId", async (req, res) => {
  const bookId = await Joi.string().required().validateAsync(req.params.bookId);

  const userId = req.user?.id;
  if (!userId) return res.status(401).json({ message: "Unauthorized" });

  const service = await getSheetService();
  const sheetNames = await service.getSheetNames(userId, bookId);

  res.status(200).send(sheetNames);
});

// Cell data for a visible range.
sheetsRouter.get("/sheet", async (req, res) => {
  const sheetInfo = await sheetGetterSchema.validateAsync(req.query);

  const userId = req.user?.id;
  if (!userId) return res.status(401).json({ message: "Unauthorized" });

  const service = await getSheetService();
  const sheets = await service.getRange(userId, sheetInfo);

  res.status(200).send(sheets);
});
