import { NextFunction, Request, Response } from "express";
import { DB } from "../db/pool.js";

export async function userInjector(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const token = req.cookies?.token;
  if (!token) {
    const { token, user } = await createUser();
    res.cookie("token", token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });
    req.user = user;
    next();
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

export async function createUser() {
  const bytes = crypto.getRandomValues(new Uint8Array(32));

  const token = Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  const hashedBuffer = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(token),
  );

  const hashedToken = Array.from(new Uint8Array(hashedBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  const user = await DB.user.create({
    data: {
      name: "test",
      token: hashedToken,
    },
  });
  return { token, user };
}
