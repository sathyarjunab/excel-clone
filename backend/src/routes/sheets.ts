import { Request, Response, Router } from "express";
import { sheetSchema } from "../validator/commonValidator.js";

export const sheetsRouter = Router();

// Create a new sheet
sheetsRouter.post("/save", async (req: Request, res: Response) => {
  const sheets = await sheetSchema.validateAsync(req.body, {
    stripUnknown: true,
  });
});
