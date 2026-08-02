import { Grid, Sheet, Workbook } from "../../types/book";
import { DataSource, getSheetReturnType } from "./interface";

export class Api implements DataSource {
  private async fetcher<K, T = unknown>(
    url: string,
    method: "GET" | "POST" | "PUT" | "DELETE" = "GET",
    secure: boolean = true,
    query?: Record<string, string | number>,
    body?: T,
  ) {
    try {
      const q = Object.entries(query ?? {})
        .map(([key, val], indx) =>
          indx === 0
            ? `?${encodeURIComponent(key)}=${encodeURIComponent(val)}`
            : `${encodeURIComponent(key)}=${encodeURIComponent(val)}`,
        )
        .join("&");

      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}${url}${q}`, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        ...(secure ? { credentials: "include" } : {}),
        ...(body ? { body: JSON.stringify(body) } : {}),
      });
      const data = (await res.json()) as K;

      return {
        status: res.status,
        ok: res.ok,
        data,
      };
    } catch (err) {
      return {
        status: 500,
        ok: false,
        data: null,
      };
    }
  }

  public async gatherData({
    endCol,
    endRow,
    startCol,
    topRow,
    sheetName,
  }: {
    topRow: number;
    endRow: number;
    startCol: number;
    endCol: number;
    sheetName: string;
  }) {
    const { data } = await this.fetcher<Sheet[]>("/sheets/sheet", "GET", true, {
      sheetName: sheetName,
      startRow: topRow,
      endRow: endRow,
      startCol: startCol,
      endCol: endCol,
    });

    return data;
  }

  public async getSheetNames(
    bookId: string,
  ): Promise<getSheetReturnType<{ sheetNames: string; id: string }[]>> {
    return await this.fetcher<{ sheetNames: string; id: string }[]>(
      `/sheets/sheetNames/${bookId}`,
      "GET",
    );
  }

  public async getBooks(): Promise<getSheetReturnType<Workbook[]>> {
    return await this.fetcher<Workbook[]>("/book/books", "GET", true);
  }

  public async saveSheets({
    dirtyCells,
    name,
    bookId,
  }: {
    dirtyCells: Record<`${string}-${string}`, Grid> | undefined;
    name: string;
    bookId: string | null;
  }): Promise<void> {
    await this.fetcher("/sheets/save", "POST", true, undefined, {
      dirtyCells: dirtyCells,
      name: name,
      bookId: bookId,
    });
  }
}
