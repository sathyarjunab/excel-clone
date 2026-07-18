import { user } from "../generated/prisma/client.ts";

declare global {
  namespace Express {
    interface Request {
      user?: user;
    }
  }
}

export {};
