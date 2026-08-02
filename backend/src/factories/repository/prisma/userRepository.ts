import { DB } from "../../../db/pool.js";
import { IUserRepository } from "../interface.js";

export class PrismaUserRepository implements IUserRepository {
  findByToken(hashedToken: string) {
    return DB.user.findUnique({ where: { token: hashedToken } });
  }

  create(name: string, hashedToken: string) {
    return DB.user.create({ data: { name, token: hashedToken } });
  }
}
