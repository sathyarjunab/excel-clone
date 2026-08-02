import { RepositoryType } from "./factories/registory/repository.js";

// The active persistence engine. Swapping the whole backend to another store
// (or an in-memory fake in tests) is a one-line change here, mirroring the
// frontend's DATASOURCE_TYPE / CACHING_SERVICE_TYPE constants.
export const REPOSITORY_TYPE = RepositoryType.PRISMA;
