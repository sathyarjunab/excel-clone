import {
  createContext,
  Dispatch,
  ReactNode,
  useCallback,
  useState,
} from "react";
import { Sheet, Workbook } from "./types/book";
import { ContextBody } from "./types/common";
import { fetcher } from "./util/httpReq";

const contextBody = {
  dirtyCells: {},
};

export const UserContext = createContext<{
  user: null | Record<string, string>;
  books: Workbook[] | null;
  activeSheetName: string | null;
  activeBookIndx: string | null;
  activeSheet: Sheet[] | null;
  contextBody: ContextBody;
  setActiveBookIndx: Dispatch<React.SetStateAction<string | null>>;
  setUser: Dispatch<React.SetStateAction<null>>;
  setBooks: Dispatch<React.SetStateAction<Workbook[] | null>>;
  setActiveSheetName: Dispatch<React.SetStateAction<string | null>>;
  setActiveSheet: Dispatch<React.SetStateAction<Sheet[] | null>>;
  setContextBody: Dispatch<React.SetStateAction<ContextBody>>;
  saveSheets: (sheet: Sheet) => void;
  fetchSheetData: (
    sheetName: string,
    startRow: number,
    endRow: number,
    startCol: number,
    endCol: number,
  ) => void;
}>({
  user: null,
  books: null,
  activeSheetName: null,
  activeBookIndx: null,
  activeSheet: null,
  contextBody,
  setActiveBookIndx: () => {},
  setUser: () => {},
  setBooks: () => {},
  setActiveSheetName: () => {},
  saveSheets: () => {},
  fetchSheetData: () => {},
  setActiveSheet: () => {},
  setContextBody: () => {},
});

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState(null);
  const [books, setBooks] = useState<Workbook[] | null>(null);
  const [activeSheet, setActiveSheet] = useState<Sheet[] | null>(null);
  const [activeSheetName, setActiveSheetName] = useState<string | null>(null);
  const [activeBookIndx, setActiveBookIndx] = useState<string | null>(null);
  const [contextBody, setContextBody] = useState<ContextBody>({
    dirtyCells: {},
  });

  const saveSheets = useCallback(async () => {
    await fetcher<Sheet>(
      "/sheets/save",
      "POST",
      true,
      undefined,
      contextBody.dirtyCells,
    );
  }, []);

  const fetchSheetData = useCallback(
    async (
      sheetName: string,
      startRow: number,
      endRow: number,
      startCol: number,
      endCol: number,
    ) => {
      const { data } = await fetcher<Sheet[]>("/sheets/sheet", "GET", true, {
        sheetName,
        startRow,
        endRow,
        startCol,
        endCol,
      });

      setActiveSheet(data);
    },
    [],
  );

  return (
    <UserContext.Provider
      value={{
        user,
        books,
        activeBookIndx,
        activeSheetName,
        activeSheet,
        contextBody,
        setUser,
        setBooks,
        setActiveSheetName,
        saveSheets,
        setActiveBookIndx,
        fetchSheetData,
        setActiveSheet,
        setContextBody,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}
