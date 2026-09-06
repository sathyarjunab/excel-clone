import { Grid } from "./book";

export type ContextBody = {
  dirtyCells: Record<`${string}-${string}`, Grid>;
};
export type FourNodes = {
  topLeft: `${string}-${string}`;
  bottomLeft: `${string}-${string}`;
  topRight: `${string}-${string}`;
  bottomRight: `${string}-${string}`;
  activeCell: `${string}-${string}`;
};
