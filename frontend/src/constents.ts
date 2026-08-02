import { CacheSourceType } from "./factories/registory/cache";
import { DataSourceType } from "./factories/registory/dataSource";

const X_MAX_RANGE = 500;
const Y_MAX_RANGE = 500;
const MAX_ROWS_PER_VIEW = 50;
const MAX_COLUMNS_PER_VIEW = 50;
const DATASOURCE_TYPE = DataSourceType.API;
const CACHING_SERVICE_TYPE = CacheSourceType.IDB;
const ALPHABETS = [
  "",
  "A",
  "B",
  "C",
  "D",
  "E",
  "F",
  "G",
  "H",
  "I",
  "J",
  "K",
  "L",
  "M",
  "N",
  "O",
  "P",
  "Q",
  "R",
  "S",
  "T",
  "U",
  "V",
  "W",
  "X",
  "Y",
  "Z",
];

export {
  X_MAX_RANGE,
  Y_MAX_RANGE,
  MAX_ROWS_PER_VIEW,
  MAX_COLUMNS_PER_VIEW,
  DATASOURCE_TYPE,
  CACHING_SERVICE_TYPE,
  ALPHABETS,
};
