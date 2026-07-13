import { createContext, useState, ReactNode, Dispatch } from "react";
import { Workbook } from "./types/book";
import { defaultBook } from "./helper/book";

export const UserContext = createContext<{
  user: null | Record<string, string>;
  book: Workbook;
  activeSheetIndx: number;
  setUser: Dispatch<React.SetStateAction<null>>;
  setBook: Dispatch<React.SetStateAction<Workbook>>;
  setActiveSheetIndx: Dispatch<React.SetStateAction<number>>;
}>({
  user: null,
  book: defaultBook,
  activeSheetIndx: 0,
  setUser: () => {},
  setBook: () => {},
  setActiveSheetIndx: () => {},
});

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState(null);
  const [book, setBook] = useState<Workbook>(defaultBook);
  const [activeSheetIndx, setActiveSheetIndx] = useState(0);

  return (
    <UserContext.Provider
      value={{
        user,
        setUser,
        book,
        setBook,
        activeSheetIndx,
        setActiveSheetIndx,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}
