import { createContext, useState, ReactNode, Dispatch, useEffect } from "react";
import { Sheet, Workbook } from "./types/book";
import { defaultBook } from "./helper/book";
import { fetcher } from "./util/httpReq";

export const UserContext = createContext<{
  user: null | Record<string, string>;
  book: Workbook;
  activeSheetIndx: number;
  setUser: Dispatch<React.SetStateAction<null>>;
  setBook: Dispatch<React.SetStateAction<Workbook>>;
  setActiveSheetIndx: Dispatch<React.SetStateAction<number>>;
  saveSheets: (sheet: Sheet) => void;
}>({
  user: null,
  book: defaultBook,
  activeSheetIndx: 1,
  setUser: () => {},
  setBook: () => {},
  setActiveSheetIndx: () => {},
  saveSheets: (sheet: Sheet) => {},
});

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState(null);
  const [book, setBook] = useState<Workbook>(defaultBook);
  const [activeSheetIndx, setActiveSheetIndx] = useState(0);

  const saveSheets = async (sheet: Sheet) => {
    const sheetToBeSaved = book.sheets.find((s) => s.id === sheet.id);
    if (!sheetToBeSaved || !sheetToBeSaved.hasChanged) return;
    await fetcher<Sheet>("/sheets/save", "POST", true, sheetToBeSaved);
    setBook((prev) => ({
      ...prev,
      sheets: prev.sheets.map((s) => {
        return s.id === sheetToBeSaved.id
          ? { ...s, hasChanged: false, dirtyCells: {} }
          : s;
      }),
    }));
  };

  useEffect(() => {
    console.log(book.sheets[0].dirtyCells);
  }, [book]);

  return (
    <UserContext.Provider
      value={{
        user,
        setUser,
        book,
        setBook,
        activeSheetIndx,
        setActiveSheetIndx,
        saveSheets,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}
