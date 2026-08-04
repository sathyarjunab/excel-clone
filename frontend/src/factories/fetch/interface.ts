import { Grid, Sheet, Workbook } from "../../types/book";

export interface GatherDataParams {
  topRow: number;
  endRow: number;
  startCol: number;
  endCol: number;
  sheetName: string;
}

export type getSheetReturnType<K> = Promise<
  | {
      status: number;
      ok: boolean;
      data: K;
    }
  | {
      status: number;
      ok: boolean;
      data: null;
    }
>;

export interface DataSource {
  gatherData(params: GatherDataParams): Promise<Sheet[] | null>;
  getSheetNames(
    bookId: string,
  ): Promise<getSheetReturnType<{ sheetNames: string; id: string }[]>>;
  getBooks(): Promise<getSheetReturnType<Workbook[]>>;
  saveSheets({
    dirtyCells,
    name,
    bookId,
  }: {
    dirtyCells: Record<`${string}-${string}`, Grid>;
    name: string;
    bookId: string | null;
  }): Promise<void>;
}
