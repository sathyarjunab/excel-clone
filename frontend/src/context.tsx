import React, {
  createContext,
  Dispatch,
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { clientSheet, Sheet, Workbook } from "./types/book";
import { DATASOURCE_TYPE } from "./constents";
import { dataSource } from "./factories/registory/dataSource";

const EMPTY_SHEET: clientSheet = { cellData: {}, dirtyCells: {} };

export const UserContext = createContext<{
  user: null | Record<string, string>;
  books: Workbook[] | null;
  activeSheetName: string | null;
  activeBookIndx: string | null;
  activeSheet: Sheet[] | null;
  sheetData: clientSheet;
  setActiveBookIndx: Dispatch<React.SetStateAction<string | null>>;
  setUser: Dispatch<React.SetStateAction<null>>;
  setBooks: Dispatch<React.SetStateAction<Workbook[] | null>>;
  setActiveSheetName: Dispatch<React.SetStateAction<string>>;
  setActiveSheet: Dispatch<React.SetStateAction<Sheet[] | null>>;
  saveSheets: () => void;
  setSheetData: Dispatch<React.SetStateAction<clientSheet>>;
}>({
  user: null,
  books: null,
  activeSheetName: null,
  activeBookIndx: null,
  activeSheet: null,
  sheetData: EMPTY_SHEET,
  setActiveBookIndx: () => {},
  setUser: () => {},
  setBooks: () => {},
  setActiveSheetName: () => {},
  saveSheets: () => {},
  setActiveSheet: () => {},
  setSheetData: () => {},
});

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState(null);
  const [books, setBooks] = useState<Workbook[] | null>(null);
  //TODO: check if i can remove setActiveSheet
  const [activeSheet, setActiveSheet] = useState<Sheet[] | null>(null);
  const [activeSheetName, setActiveSheetName] = useState<string>("New Sheet");
  const [activeBookIndx, setActiveBookIndx] = useState<string | null>(null);

  // Cell data is real React state now — mutating it re-renders the grid the
  // normal way, so there is no more `ref + version++` counter to force paints.
  const [sheetData, setSheetData] = useState<clientSheet>(EMPTY_SHEET);

  // A "latest value" ref mirroring the state. The debounced save fires long
  // after the keystroke that scheduled it, so it must read the newest dirty
  // cells rather than the ones captured in its closure.
  const sheetDataRef = useRef(sheetData);
  useEffect(() => {
    sheetDataRef.current = sheetData;
  }, [sheetData]);

  const saveSheets = useCallback(async () => {
    const dirtyCells = sheetDataRef.current.dirtyCells;

    await (await dataSource[DATASOURCE_TYPE]()).saveSheets({
      dirtyCells,
      name: activeSheetName,
      bookId: activeBookIndx,
    });

    setSheetData((prev) => ({ ...prev, dirtyCells: {} }));
  }, [activeBookIndx, activeSheetName]);

  const value = useMemo(
    () => ({
      user,
      books,
      activeBookIndx,
      activeSheetName,
      activeSheet,
      sheetData,
      setUser,
      setBooks,
      setActiveSheetName,
      saveSheets,
      setActiveBookIndx,
      setActiveSheet,
      setSheetData,
    }),
    [
      user,
      books,
      activeBookIndx,
      activeSheetName,
      activeSheet,
      sheetData,
      saveSheets,
    ],
  );

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}
