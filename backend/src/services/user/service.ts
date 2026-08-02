import { IUserRepository } from "../../factories/repository/interface.js";
import { IUserService } from "./interface.js";

// Token minting + hashing, moved out of the middleware so the auth rules are
// testable in isolation and the middleware stays a thin adapter.
export class UserService implements IUserService {
  constructor(private readonly repo: IUserRepository) {}

  async createWithToken() {
    const bytes = crypto.getRandomValues(new Uint8Array(32));
    const token = this.toHex(bytes);
    const user = await this.repo.create("test", await this.hash(token));
    return { token, user };
  }

  async findByRawToken(token: string) {
    return this.repo.findByToken(await this.hash(token));
  }

  private async hash(token: string): Promise<string> {
    const buffer = await crypto.subtle.digest(
      "SHA-256",
      new TextEncoder().encode(token),
    );
    return this.toHex(new Uint8Array(buffer));
  }

  private toHex(bytes: Uint8Array): string {
    return Array.from(bytes)
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  }
}
