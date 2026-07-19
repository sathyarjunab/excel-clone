import Joi from "joi";
import { Grid, Sheet } from "../types/book.js";

export const gridSchema = Joi.object<Grid>({
  content: Joi.string().required(),
  style: Joi.object().pattern(Joi.string(), Joi.string()).optional(),
});

export const sheetSchema = Joi.object<Sheet>({
  bookId: Joi.number().required,
  name: Joi.string().required(),
  dirtyCells: Joi.object().pattern(Joi.string(), gridSchema).required(),
});

export const envSchema = Joi.object({
  PORT: Joi.number().required(),
  DATABASE_URL: Joi.string().required(),
  CLIENT_ORIGIN: Joi.string().required(),
});
