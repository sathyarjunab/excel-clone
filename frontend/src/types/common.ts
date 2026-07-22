import { Grid } from "./book";

export type ContextBody = {
  dirtyCells: Record<`${string}-${string}`, Grid>;
};
