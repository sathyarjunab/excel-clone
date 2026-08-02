import React, {
  createContext,
  Dispatch,
  ReactNode,
  useCallback,
  useRef,
  useState,
} from "react";
import { clientSheet, Sheet, Workbook } from "./types/book";
import { DATASOURCE_TYPE } from "./constents";
import { dataSource } from "./factories/registory/dataSource";

export const UserContext = createContext<{
  user: null | Record<string, string>;
  books: Workbook[] | null;
  activeSheetName: string | null;
  activeBookIndx: string | null;
  activeSheet: Sheet[] | null;
  version: number;
  loadingCells: boolean;
  setActiveBookIndx: Dispatch<React.SetStateAction<string | null>>;
  setUser: Dispatch<React.SetStateAction<null>>;
  setBooks: Dispatch<React.SetStateAction<Workbook[] | null>>;
  setActiveSheetName: Dispatch<React.SetStateAction<string>>;
  setActiveSheet: Dispatch<React.SetStateAction<Sheet[] | null>>;
  saveSheets: () => void;
  latestSheetRef: React.MutableRefObject<clientSheet | null>;
  setVersion: Dispatch<React.SetStateAction<number>>;
  setLoadingCells: Dispatch<React.SetStateAction<boolean>>;
}>({
  user: null,
  books: null,
  activeSheetName: null,
  activeBookIndx: null,
  activeSheet: null,
  version: 0,
  latestSheetRef: { current: null },
  loadingCells: false,
  setActiveBookIndx: () => {},
  setUser: () => {},
  setBooks: () => {},
  setActiveSheetName: () => {},
  saveSheets: () => {},
  setActiveSheet: () => {},
  setVersion: () => {},
  setLoadingCells: () => {},
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
  const [loadingCells, setLoadingCells] = useState(false);

  const saveSheets = useCallback(async () => {
    (await dataSource[DATASOURCE_TYPE]()).saveSheets({
      dirtyCells: latestSheetRef.current?.dirtyCells,
      name: activeSheetName,
      bookId: activeBookIndx,
    });

    if (latestSheetRef.current) {
      latestSheetRef.current.dirtyCells = {};
    }
  }, [activeBookIndx, activeSheetName]);

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
        loadingCells,
        setUser,
        setBooks,
        setActiveSheetName,
        saveSheets,
        setActiveBookIndx,
        setActiveSheet,
        setVersion,
        setLoadingCells,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}
