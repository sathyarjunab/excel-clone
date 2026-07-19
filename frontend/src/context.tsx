import { createContext, Dispatch, ReactNode, useState } from "react";
import { Sheet, Workbook } from "./types/book";
import { fetcher } from "./util/httpReq";

export const UserContext = createContext<{
  user: null | Record<string, string>;
  books: Workbook[] | null;
  activeSheetIndx: string | null;
  activeBookIndx: string | null;
  setActiveBookIndx: Dispatch<React.SetStateAction<string | null>>;
  setUser: Dispatch<React.SetStateAction<null>>;
  setBooks: Dispatch<React.SetStateAction<Workbook[] | null>>;
  setActiveSheetIndx: Dispatch<React.SetStateAction<string | null>>;
  saveSheets: (bookId: string, sheet: Sheet) => void;
}>({
  user: null,
  books: null,
  activeSheetIndx: null,
  activeBookIndx: null,
  setActiveBookIndx: () => {},
  setUser: () => {},
  setBooks: () => {},
  setActiveSheetIndx: () => {},
  saveSheets: (bookId: string, sheet: Sheet) => {},
});

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState(null);
  const [books, setBooks] = useState<Workbook[] | null>(null);
  const [activeSheetIndx, setActiveSheetIndx] = useState<string | null>(null);
  const [activeBookIndx, setActiveBookIndx] = useState<string | null>(null);

  const saveSheets = async (bookId: string, sheet: Sheet) => {
    const sheetToBeSaved = books
      ?.find((b) => b.id === bookId)
      ?.sheets?.find((s) => s.name === sheet.name);
    if (!sheetToBeSaved || !sheetToBeSaved.hasChanged) return;
    await fetcher<Sheet>("/sheets/save", "POST", true, sheetToBeSaved);
    setBooks((prev) => {
      return (prev ?? []).map((b) => {
        return b.id !== bookId
          ? b
          : {
              ...b,
              sheets: b.sheets?.map((s) => {
                return s.name === sheetToBeSaved.name
                  ? { ...s, hasChanged: false, dirtyCells: {} }
                  : s;
              }),
            };
      });
    });
  };

  return (
    <UserContext.Provider
      value={{
        user,
        setUser,
        books,
        setBooks,
        activeSheetIndx,
        setActiveSheetIndx,
        saveSheets,
        activeBookIndx,
        setActiveBookIndx,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}
