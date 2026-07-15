import { createContext, useState, ReactNode, Dispatch } from "react";
import { Sheet, Workbook } from "./types/book";
import { defaultBook } from "./helper/book";
import { fetchMe } from "./util/httpReq";

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
  const [activeSheetIndx, setActiveSheetIndx] = useState(1);

  const saveSheets = async (sheet: Sheet) => {
    const sheetToBeSaved = book.sheets.find((s) => s.id === sheet.id);
    if (!sheetToBeSaved) return;
    await fetchMe<Sheet>("/api/sheets/save", sheetToBeSaved);
  };

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
