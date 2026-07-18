import { NextFunction, Request, Response } from "express";
import { DB } from "../db/pool.js";

export async function userInjector(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const token = req.cookies?.token;
  if (!token) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const hashedBuffer = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(token),
  );

  const hashedToken = Array.from(new Uint8Array(hashedBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  const user = await DB.user.findUnique({
    where: { token: hashedToken },
  });

  if (!user) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  req.user = user;
  next();
}
