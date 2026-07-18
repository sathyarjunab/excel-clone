import { Request, Response, Router } from "express";
import { sheetSchema } from "../validator/commonValidator.js";

export const sheetsRouter = Router();

// Create a new sheet
sheetsRouter.post("/save", async (req: Request, res: Response) => {
  const sheets = await sheetSchema.validateAsync(req.body, {
    stripUnknown: true,
  });

  // 1. check if row exists for this sheets location if no then create it.
  // 2. if there is a row update it
});
