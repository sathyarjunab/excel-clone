import React, {
  createContext,
  Dispatch,
  ReactNode,
  useCallback,
  useRef,
  useState,
} from "react";
import { clientSheet, Sheet, Workbook } from "./types/book";
import { fetcher } from "./util/httpReq";

export const UserContext = createContext<{
  user: null | Record<string, string>;
  books: Workbook[] | null;
  activeSheetName: string | null;
  activeBookIndx: string | null;
  activeSheet: Sheet[] | null;
  version: number;
  setActiveBookIndx: Dispatch<React.SetStateAction<string | null>>;
  setUser: Dispatch<React.SetStateAction<null>>;
  setBooks: Dispatch<React.SetStateAction<Workbook[] | null>>;
  setActiveSheetName: Dispatch<React.SetStateAction<string>>;
  setActiveSheet: Dispatch<React.SetStateAction<Sheet[] | null>>;
  saveSheets: () => void;
  fetchSheetData: (
    sheetName: string,
    startRow: number,
    endRow: number,
    startCol: number,
    endCol: number,
  ) => void;
  latestSheetRef: React.MutableRefObject<clientSheet | null>;
  setVersion: Dispatch<React.SetStateAction<number>>;
}>({
  user: null,
  books: null,
  activeSheetName: null,
  activeBookIndx: null,
  activeSheet: null,
  version: 0,
  latestSheetRef: { current: null },
  setActiveBookIndx: () => {},
  setUser: () => {},
  setBooks: () => {},
  setActiveSheetName: () => {},
  saveSheets: () => {},
  fetchSheetData: () => {},
  setActiveSheet: () => {},
  setVersion: () => {},
});

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState(null);
  const [books, setBooks] = useState<Workbook[] | null>(null);
  //TODO: check if i can remove setActiveSheet
  const [activeSheet, setActiveSheet] = useState<Sheet[] | null>(null);
  const [activeSheetName, setActiveSheetName] = useState<string>("New Sheet");
  const [activeBookIndx, setActiveBookIndx] = useState<string | null>(null);
  const latestSheetRef = useRef<clientSheet | null>(null);
  const [version, setVersion] = useState<number>(0);

  const saveSheets = useCallback(async () => {
    await fetcher("/sheets/save", "POST", true, undefined, {
      dirtyCells: latestSheetRef.current?.dirtyCells,
      name: activeSheetName,
      bookId: activeBookIndx,
    });

    if (latestSheetRef.current) {
      latestSheetRef.current.dirtyCells = {};
    }
  }, [activeBookIndx, activeSheetName]);

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

      let cellData = {};
      data?.forEach((sheet) => {
        cellData = {
          ...cellData,
          ...sheet.data,
        };
      });

      latestSheetRef.current = {
        cellData,
        dirtyCells: {},
      };
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
        version,
        latestSheetRef,
        setUser,
        setBooks,
        setActiveSheetName,
        saveSheets,
        setActiveBookIndx,
        fetchSheetData,
        setActiveSheet,
        setVersion,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}
