import { Grid } from "./book.js";

export type Workbook = {
  name: string;
  sheets: Sheet[];
  activeSheetIndx: number;
};

export type Sheet = {
  id: number;
  name: string;
  cells: Record<`${string}-${string}`, Grid>;
  dirtyCells: Record<`${string}-${string}`, Grid>;
  hasChanged: boolean;
};

export enum Alphabets {
  A = "A",
  B = "B",
  C = "C",
  D = "D",
  E = "E",
  F = "F",
  G = "G",
  H = "H",
  I = "I",
  J = "J",
  K = "K",
  L = "L",
  M = "M",
  N = "N",
  O = "O",
  P = "P",
  Q = "Q",
  R = "R",
  S = "S",
  T = "T",
  U = "U",
  V = "V",
  W = "W",
  X = "X",
  Y = "Y",
  Z = "Z",
}

export type DeepOptional<T> = T extends (...args: any[]) => any
  ? T
  : T extends readonly (infer U)[]
    ? readonly DeepOptional<U>[]
    : T extends (infer U)[]
      ? DeepOptional<U>[]
      : T extends object
        ? { [K in keyof T]?: DeepOptional<T[K]> }
        : T;
