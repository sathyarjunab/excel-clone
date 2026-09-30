import Joi from "joi";
import { Grid, Sheet } from "../types/book.js";

export const gridSchema = Joi.object<Grid>({
  rawData: Joi.string().allow("").required(),
  style: Joi.object().pattern(Joi.string(), Joi.string()).optional(),
  content: Joi.string().allow("").required(),
});

export const sheetSchema = Joi.object<Sheet>({
  bookId: Joi.string().required(),
  name: Joi.string().required(),
  dirtyCells: Joi.object().pattern(Joi.string(), gridSchema).required(),
});

export const envSchema = Joi.object({
  PORT: Joi.number().required(),
  DATABASE_URL: Joi.string().required(),
  CLIENT_ORIGIN: Joi.string().required(),
});

export const sheetGetterSchema = Joi.object({
  sheetName: Joi.string().required(),
  startRow: Joi.number().required(),
  endRow: Joi.number().required(),
  startCol: Joi.number().required(),
  endCol: Joi.number().required(),
});
