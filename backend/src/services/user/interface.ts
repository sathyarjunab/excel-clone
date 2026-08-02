import { user } from "../../generated/prisma/client.js";

export interface IUserService {
  createWithToken(): Promise<{ token: string; user: user }>;
  findByRawToken(token: string): Promise<user | null>;
}
