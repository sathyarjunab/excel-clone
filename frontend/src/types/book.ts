export type Workbook = {
  id: string;
  createdAt?: Date;
  updatedAt?: Date;
  userId?: string;
  bookName: string;
  sheets?: Sheet[];
};

export type Sheet = {
  id: string;
  name: string;
  cells: Record<`${string}-${string}`, Grid>;
  dirtyCells: Record<`${string}-${string}`, Grid>;
  hasChanged: boolean;
};

export type Grid = {
  style: Record<string, string>;
  content: string | null;
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
