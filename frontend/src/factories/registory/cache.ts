import { Icache } from "../idb/interface";
import { IDB } from "../idb/service";

export enum CacheSourceType {
  IDB = "IDB",
}

// // 1. Define a mapping between the Enum and the Class types
type CacheSourceRegistryMap = {
  [CacheSourceType.IDB]: typeof IDB;
};

// 3. Apply the strict type to your registry object
export const cacheSource: Record<
  CacheSourceType,
  (
    ...args: ConstructorParameters<CacheSourceRegistryMap[CacheSourceType.IDB]>
  ) => Promise<Icache>
> = {
  [CacheSourceType.IDB]: async (...args) => {
    const module = await import("../idb/service");
    return new module.IDB(...args);
  },
};
