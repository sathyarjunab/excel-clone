import { createContext, Dispatch, ReactNode, useEffect, useState } from "react";
import { Sheet, Workbook } from "./types/book";
import { fetcher } from "./util/httpReq";

export const UserContext = createContext<{
  user: null | Record<string, string>;
  books: Workbook[] | null;
  activeBookIndx: string | null;
  activeSheet: Sheet[] | null;
  setActiveBookIndx: Dispatch<React.SetStateAction<string | null>>;
  setUser: Dispatch<React.SetStateAction<null>>;
  setBooks: Dispatch<React.SetStateAction<Workbook[] | null>>;
  setActiveSheets: Dispatch<React.SetStateAction<Sheet[] | null>>;
  saveSheets: (bookId: string, sheet: Sheet) => void;
}>({
  user: null,
  books: null,
  activeBookIndx: null,
  activeSheet: null,
  setActiveBookIndx: () => {},
  setUser: () => {},
  setBooks: () => {},
  setActiveSheets: () => {},
  saveSheets: (bookId: string, sheet: Sheet) => {},
});

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState(null);
  const [books, setBooks] = useState<Workbook[] | null>(null);
  const [activeSheet, setActiveSheets] = useState<Sheet[] | null>(null);
  const [activeBookIndx, setActiveBookIndx] = useState<string | null>(null);

  const saveSheets = async (bookId: string, sheet: Sheet) => {
    const sheetToBeSaved = books
      ?.find((b) => b.id === bookId)
      ?.sheets?.find((s) => s.sheetName === sheet.sheetName);
    if (!sheetToBeSaved || !sheetToBeSaved.hasChanged) return;
    await fetcher<Sheet>("/sheets/save", "POST", true, sheetToBeSaved);
    setBooks((prev) => {
      return (prev ?? []).map((b) => {
        return b.id !== bookId
          ? b
          : {
              ...b,
              sheets: b.sheets?.map((s) => {
                return s.sheetName === sheetToBeSaved.sheetName
                  ? { ...s, hasChanged: false, dirtyCells: {} }
                  : s;
              }),
            };
      });
    });
  };

  const fetchSheet = async (sheetIdx: string) => {};

  useEffect(() => {
    console.log(books);
  }, [books]);

  return (
    <UserContext.Provider
      value={{
        user,
        books,
        activeBookIndx,
        activeSheet,
        setUser,
        setBooks,
        saveSheets,
        setActiveBookIndx,
        setActiveSheets,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}
