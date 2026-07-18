import { Router } from "express";
import { DB } from "../db/pool.js";
import { userInjector } from "../util/user.js";

const route = Router();

route.get("/login", async (req, res, next) => {
  const exists = req.cookies?.token;
  if (exists) {
    return res.json({ message: "Already logged in" });
  }
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

  await DB.user.create({
    data: {
      name: "test",
      token: hashedToken,
    },
  });
  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
  });

  res.send({ message: "Logged in successfully" });
});

export default route;
