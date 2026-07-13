export type Workbook = {
  name: string;
  sheets: Record<number, Sheet>;
  activeSheetId: number;
};

export type Sheet = {
  id: number;
  name: string;
  data: Record<`${string}-${string}`, Record<string, Grid>>;
};

export type Grid = {
  style: Record<string, string>;
  content: string | number | null | undefined;
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
