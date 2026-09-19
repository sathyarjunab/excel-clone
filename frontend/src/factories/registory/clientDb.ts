import { Icache } from "../idb/interface";
import { IDB } from "../idb/service";

export enum clientDbSourceType {
  IDB = "IDB",
  IDB_SINGLETON = "IDB_SINGLETON",
}

// // 1. Define a mapping between the Enum and the Class types
type clientDbSourceRegistryMap = {
  [clientDbSourceType.IDB]: typeof IDB;
};

// 3. Apply the strict type to your registry object
export const clientDbSource: Record<
  clientDbSourceType,
  (
    ...args: ConstructorParameters<
      clientDbSourceRegistryMap[clientDbSourceType.IDB]
    >
  ) => Promise<Icache>
> = {
  [clientDbSourceType.IDB]: async (...args) => {
    const module = await import("../idb/service");
    return new module.IDB(...args);
  },
  [clientDbSourceType.IDB_SINGLETON]: async () => {
    const module = await import("../idb/service");
    return module.idbSingleton;
  },
};
