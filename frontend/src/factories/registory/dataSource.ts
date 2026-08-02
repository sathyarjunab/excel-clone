import { DataSource } from "../fetch/interface";
import { Api } from "../fetch/service";

export enum DataSourceType {
  API = "API",
}

// // 1. Define a mapping between the Enum and the Class types
type DataSourceRegistryMap = {
  [DataSourceType.API]: typeof Api;
};

// 3. Apply the strict type to your registry object
export const dataSource: Record<
  DataSourceType,
  (
    ...args: ConstructorParameters<DataSourceRegistryMap[DataSourceType.API]>
  ) => Promise<DataSource>
> = {
  [DataSourceType.API]: async (...args) => {
    const module = await import("../fetch/service");
    return new module.Api(...args);
  },
};
