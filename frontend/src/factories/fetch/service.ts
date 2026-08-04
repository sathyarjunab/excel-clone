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
    const data = await res.json();

    if (!res.ok) throw new Error(data.error ?? "Unknown error");
    console.log("Data fetched successfully:", data);
    return {
      status: res.status,
      ok: res.ok,
      data: data as K,
    };
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
    try {
      const { data } = await this.fetcher<Sheet[]>(
        "/sheets/sheet",
        "GET",
        true,
        {
          sheetName: sheetName,
          startRow: topRow,
          endRow: endRow,
          startCol: startCol,
          endCol: endCol,
        },
      );

      return data;
    } catch (err) {
      throw new Error(
        "Failed to gather data: " +
          (err instanceof Error ? err.message : "Unknown error"),
      );
    }
  }

  public async getSheetNames(
    bookId: string,
  ): Promise<getSheetReturnType<{ sheetNames: string; id: string }[]>> {
    try {
      return await this.fetcher<{ sheetNames: string; id: string }[]>(
        `/sheets/sheetNames/${bookId}`,
        "GET",
      );
    } catch (err) {
      throw new Error(
        "Failed to get sheet names: " +
          (err instanceof Error ? err.message : "Unknown error"),
      );
    }
  }

  public async getBooks(): Promise<getSheetReturnType<Workbook[]>> {
    try {
      return await this.fetcher<Workbook[]>("/book/books", "GET", true);
    } catch (err) {
      throw new Error(
        "Failed to get books: " +
          (err instanceof Error ? err.message : "Unknown error"),
      );
    }
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
    try {
      await this.fetcher("/sheets/save", "POST", true, undefined, {
        dirtyCells: dirtyCells,
        name: name,
        bookId: bookId,
      });
    } catch (err) {
      throw new Error(
        "Failed to save sheets: " +
          (err instanceof Error ? err.message : "Unknown error"),
      );
    }
  }
}
