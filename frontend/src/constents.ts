import { clientDbSourceType } from "./factories/registory/clientDb";
import { DataSourceType } from "./factories/registory/dataSource";

const X_MAX_RANGE = 500;
const Y_MAX_RANGE = 500;
const MAX_ROWS_PER_VIEW = 50;
const MAX_COLUMNS_PER_VIEW = 50;
const DATASOURCE_TYPE = DataSourceType.API;
const DEFAULT_CLIENT_DB_SERVICE_TYPE = clientDbSourceType.IDB;
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
export const cellMovementKeys = [
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
  "ArrowUp",
] as const;

export type cellMovementKeysType = (typeof cellMovementKeys)[number];

export type KeyboardEvents = cellMovementKeysType | "Enter" | "Escape";

const CELL_WIDTH = 64;
const CELL_HEIGHT = 20;
const Y_AXIS_WIDTH = 40;

// How long the grid waits after the last scroll before it fetches the newly
// visible range. Short enough to feel instant, long enough to skip the
// intermediate frames of a fast scroll.
const FETCH_DEBOUNCE_MS = 200;
const SAVE_DEBOUNCE_MS = 2000;

const controlledKeys = [...cellMovementKeys, "Enter", "Escape", "Tab"];

export {
  X_MAX_RANGE,
  Y_MAX_RANGE,
  MAX_ROWS_PER_VIEW,
  MAX_COLUMNS_PER_VIEW,
  DATASOURCE_TYPE,
  DEFAULT_CLIENT_DB_SERVICE_TYPE,
  ALPHABETS,
  CELL_WIDTH,
  CELL_HEIGHT,
  Y_AXIS_WIDTH,
  FETCH_DEBOUNCE_MS,
  SAVE_DEBOUNCE_MS,
  controlledKeys,
};
