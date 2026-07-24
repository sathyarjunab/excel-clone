import {
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
  setActiveBookIndx: Dispatch<React.SetStateAction<string | null>>;
  setUser: Dispatch<React.SetStateAction<null>>;
  setBooks: Dispatch<React.SetStateAction<Workbook[] | null>>;
  setActiveSheetName: Dispatch<React.SetStateAction<string>>;
  setActiveSheet: Dispatch<React.SetStateAction<Sheet[] | null>>;
  saveSheets: (sheet: clientSheet) => void;
  fetchSheetData: (
    sheetName: string,
    startRow: number,
    endRow: number,
    startCol: number,
    endCol: number,
  ) => void;
  latestSheetRef: React.MutableRefObject<clientSheet | null>;
}>({
  user: null,
  books: null,
  activeSheetName: null,
  activeBookIndx: null,
  activeSheet: null,
  setActiveBookIndx: () => {},
  setUser: () => {},
  setBooks: () => {},
  setActiveSheetName: () => {},
  saveSheets: () => {},
  fetchSheetData: () => {},
  setActiveSheet: () => {},
  latestSheetRef: { current: null },
});

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState(null);
  const [books, setBooks] = useState<Workbook[] | null>(null);
  const [activeSheet, setActiveSheet] = useState<Sheet[] | null>(null);
  const [activeSheetName, setActiveSheetName] = useState<string>("New Sheet");
  const [activeBookIndx, setActiveBookIndx] = useState<string | null>(null);
  const latestSheetRef = useRef<clientSheet | null>(null);

  const saveSheets = useCallback(async () => {
    console.log(activeBookIndx);
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
        setUser,
        setBooks,
        setActiveSheetName,
        saveSheets,
        setActiveBookIndx,
        fetchSheetData,
        setActiveSheet,
        latestSheetRef,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}
