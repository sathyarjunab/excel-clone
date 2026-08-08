import {
  createContext,
  Dispatch,
  MutableRefObject,
  ReactNode,
  SetStateAction,
  useCallback,
  useMemo,
  useRef,
  useState,
} from "react";
import { DATASOURCE_TYPE, DEFAULT_CLIENT_DB_SERVICE_TYPE } from "./constents";
import { FourNodes } from "./factories/keyDown/interface";
import { clientDbSource } from "./factories/registory/clientDb";
import { dataSource } from "./factories/registory/dataSource";
import { clientSheet, Sheet, Workbook } from "./types/book";

const EMPTY_SHEET: clientSheet = { cellData: {}, dirtyCells: {} };
type SetFunctionType<K> = Dispatch<SetStateAction<K>>;

export const UserContext = createContext<{
  user: null | Record<string, string>;
  books: Workbook[] | null;
  activeSheetName: string | null;
  activeBookIndx: string | null;
  activeSheet: Sheet[] | null;
  sheetData: clientSheet;
  selectedCell: `${string}-${string}` | null;
  fourNodes: FourNodes | null;
  loading: boolean;
  setActiveBookIndx: SetFunctionType<string | null>;
  setUser: SetFunctionType<null>;
  setBooks: SetFunctionType<Workbook[] | null>;
  setActiveSheetName: SetFunctionType<string>;
  setActiveSheet: SetFunctionType<Sheet[] | null>;
  saveSheets: (loaderSetter: SetFunctionType<boolean>) => void;
  setSheetData: SetFunctionType<clientSheet>;
  setSelectedCell: SetFunctionType<`${string}-${string}` | null>;
  setFourNodes: SetFunctionType<FourNodes | null>;
  setLoading: SetFunctionType<boolean>;
  saveTimer: MutableRefObject<NodeJS.Timeout | null>;
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
  const [fourNodes, setFourNodes] = useState<FourNodes | null>(null);
  const [loading, setLoading] = useState(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Cell data is real React state now — mutating it re-renders the grid the
  // normal way, so there is no more `ref + version++` counter to force paints.
  const [sheetData, setSheetData] = useState<clientSheet>(EMPTY_SHEET);

  const saveSheets = useCallback(
    async (loaderSetter: SetFunctionType<boolean>) => {
      const dirtyCells = await (await clientDbInstancePromise).getDirtyCells();

      if (Object.keys(dirtyCells).length === 0) {
        loaderSetter(false);
        return;
      }
      loaderSetter(true);

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
      fourNodes,
      loading,
      setUser,
      setBooks,
      setActiveSheetName,
      saveSheets,
      setActiveBookIndx,
      setActiveSheet,
      setSheetData,
      setSelectedCell,
      setFourNodes,
      setLoading,
      saveTimer,
    }),
    [
      user,
      books,
      activeBookIndx,
      activeSheetName,
      activeSheet,
      sheetData,
      selectedCell,
      fourNodes,
    ],
  );

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}
