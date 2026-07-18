import { Request, Response, Router } from "express";
import { sheetSchema } from "../validator/commonValidator.js";
import { DB } from "../db/pool.js";
import { Prisma, sheet } from "../generated/prisma/client.js";
import { rangeCalculator, rowsColConvertor } from "../util/sheet.js";
import {
  DefaultArgs,
  JsonObject,
  Optional,
} from "@prisma/client/runtime/client";

export const sheetsRouter = Router();

// Create a new sheet
sheetsRouter.post("/save", async (req: Request, res: Response) => {
  const sheetsMetaData = await sheetSchema.validateAsync(req.body, {
    stripUnknown: true,
  });

  if (!req.user) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  // Get all the sheets from the db
  const sheets = await DB.sheet.findMany({
    where: {
      sheetName: sheetsMetaData.name,
      userId: req.user.id,
    },
  });

  const promiseGroup = [];

  const rangeToSheet: Map<string, Prisma.sheetUncheckedCreateInput> = new Map();

  for (const [coOrd, grid] of Object.entries(sheetsMetaData.dirtyCells)) {
    // convert string-string to numbers for all the dirty cells.
    const [rows, col] = rowsColConvertor(coOrd);

    // check if the db as the row for this range
    const existingRow = sheets.find((sheet) => {
      const [r, c] = rowsColConvertor(sheet.range);
      if (rows <= r && col <= c) {
        return true;
      }
      return false;
    });

    if (!existingRow) {
      // If the row is not there then we create a new row then.
      const range = rangeCalculator(rows, col);

      if (rangeToSheet.has(range)) {
        const existingRow = rangeToSheet.get(
          range,
        ) as Prisma.sheetUncheckedCreateInput;
        rangeToSheet.set(range, {
          ...existingRow,
          data: {
            ...(existingRow!.data as JsonObject),
            [coOrd]: grid,
          },
        });
      }

      rangeToSheet.set(range, {
        data: {
          [coOrd]: grid,
        },
        range: range,
        sheetName: sheetsMetaData.name,
        userId: req.user.id,
        chunksCount: sheets.length + 1,
      });
    } else {
      // If it is there then we update the existing row with the data
      promiseGroup.push(
        DB.sheet.update({
          where: {
            id: existingRow.id,
          },
          data: {
            data: { ...(existingRow.data as JsonObject), [coOrd]: grid },
          },
        }),
      );
    }
  }

  for (const [_range, sheetBody] of rangeToSheet) {
    promiseGroup.push(
      DB.sheet.create({
        data: sheetBody,
      }),
    );
  }

  await Promise.allSettled(promiseGroup);

  res.status(200).send({ message: "chages saved" });
});
