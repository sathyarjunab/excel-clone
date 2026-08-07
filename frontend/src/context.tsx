import React, {
  createContext,
  Dispatch,
  ReactNode,
  useCallback,
  useMemo,
  useState,
} from "react";
import { DATASOURCE_TYPE, DEFAULT_CLIENT_DB_SERVICE_TYPE } from "./constents";
import { clientDbSource } from "./factories/registory/clientDb";
import { dataSource } from "./factories/registory/dataSource";
import { clientSheet, Sheet, Workbook } from "./types/book";

const EMPTY_SHEET: clientSheet = { cellData: {}, dirtyCells: {} };

export const UserContext = createContext<{
  user: null | Record<string, string>;
  books: Workbook[] | null;
  activeSheetName: string | null;
  activeBookIndx: string | null;
  activeSheet: Sheet[] | null;
  sheetData: clientSheet;
  selectedCell: `${string}-${string}` | null;
  setActiveBookIndx: Dispatch<React.SetStateAction<string | null>>;
  setUser: Dispatch<React.SetStateAction<null>>;
  setBooks: Dispatch<React.SetStateAction<Workbook[] | null>>;
  setActiveSheetName: Dispatch<React.SetStateAction<string>>;
  setActiveSheet: Dispatch<React.SetStateAction<Sheet[] | null>>;
  saveSheets: (loaderSetter: Dispatch<React.SetStateAction<boolean>>) => void;
  setSheetData: Dispatch<React.SetStateAction<clientSheet>>;
  setSelectedCell: Dispatch<React.SetStateAction<`${string}-${string}` | null>>;
} | null>(null);

const clientDbInstancePromise =
  clientDbSource[DEFAULT_CLIENT_DB_SERVICE_TYPE]();

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState(null);
  const [books, setBooks] = useState<Workbook[] | null>(null);
  //TODO: check if i can remove setActiveSheet
  const [activeSheet, setActiveSheet] = useState<Sheet[] | null>(null);
  const [activeSheetName, setActiveSheetName] = useState<string>("New Sheet");
  const [activeBookIndx, setActiveBookIndx] = useState<string | null>(null);
  const [selectedCell, setSelectedCell] = useState<
    `${string}-${string}` | null
  >(null);

  // Cell data is real React state now — mutating it re-renders the grid the
  // normal way, so there is no more `ref + version++` counter to force paints.
  const [sheetData, setSheetData] = useState<clientSheet>(EMPTY_SHEET);

  const saveSheets = useCallback(
    async (loaderSetter: Dispatch<React.SetStateAction<boolean>>) => {
      loaderSetter(true);
      const dirtyCells = await (await clientDbInstancePromise).getDirtyCells();

      if (Object.keys(dirtyCells).length === 0) {
        loaderSetter(false);
        return;
      }

      await (
        await dataSource[DATASOURCE_TYPE]()
      ).saveSheets({
        dirtyCells,
        name: activeSheetName,
        bookId: activeBookIndx,
      });

      setSheetData((prev) => ({ ...prev, dirtyCells: {} }));
      clientDbInstancePromise.then(async (clientDbInstance) => {
        await clientDbInstance.saveDirtyCell({});
      });
      loaderSetter(false);
    },
    [activeBookIndx, activeSheetName],
  );
  const value = useMemo(
    () => ({
      user,
      books,
      activeBookIndx,
      activeSheetName,
      activeSheet,
      sheetData,
      selectedCell,
      setUser,
      setBooks,
      setActiveSheetName,
      saveSheets,
      setActiveBookIndx,
      setActiveSheet,
      setSheetData,
      setSelectedCell,
    }),
    [
      user,
      books,
      activeBookIndx,
      activeSheetName,
      activeSheet,
      sheetData,
      selectedCell,
      saveSheets,
    ],
  );

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}
