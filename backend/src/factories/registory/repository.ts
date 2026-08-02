import {
  IBookRepository,
  ISheetRepository,
  IUserRepository,
} from "../repository/interface.js";

export enum RepositoryType {
  PRISMA = "PRISMA",
}

// One registry per aggregate. Each maps a RepositoryType to an async factory
// that lazy-imports and instantiates the concrete implementation — the same
// enum + typed map + dynamic import shape used on the frontend (dataSource.ts).

export const sheetRepository: Record<
  RepositoryType,
  () => Promise<ISheetRepository>
> = {
  [RepositoryType.PRISMA]: async () => {
    const module = await import("../repository/prisma/sheetRepository.js");
    return new module.PrismaSheetRepository();
  },
};

export const bookRepository: Record<
  RepositoryType,
  () => Promise<IBookRepository>
> = {
  [RepositoryType.PRISMA]: async () => {
    const module = await import("../repository/prisma/bookRepository.js");
    return new module.PrismaBookRepository();
  },
};

export const userRepository: Record<
  RepositoryType,
  () => Promise<IUserRepository>
> = {
  [RepositoryType.PRISMA]: async () => {
    const module = await import("../repository/prisma/userRepository.js");
    return new module.PrismaUserRepository();
  },
};
