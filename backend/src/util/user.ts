import { NextFunction, Request, Response } from "express";
import { REPOSITORY_TYPE } from "../constents.js";
import { userRepository } from "../factories/registory/repository.js";
import { UserService } from "../services/user/service.js";
import { THIRTY_DAYS } from "./fixedConstents.js";

// Thin adapter: translate the cookie into a req.user, delegating all token
// logic to UserService (which is built from the repository registry/factory).
export async function userInjector(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const service = new UserService(await userRepository[REPOSITORY_TYPE]());
  const token = req.cookies?.token;

  if (!token) {
    const { token: freshToken, user } = await service.createWithToken();
    res.cookie("token", freshToken, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: THIRTY_DAYS,
    });
    req.user = user;
    next();
    return;
  }

  const user = await service.findByRawToken(token);
  if (!user) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  req.user = user;
  next();
}
