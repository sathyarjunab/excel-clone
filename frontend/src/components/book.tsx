import { useContext, useEffect } from "react";
import { useParams } from "react-router-dom";
import { UserContext } from "../context";
import { Sheet as sheetType } from "../types/book";
import Sheet from "./sheet";

export default function Book() {
  const { bookId } = useParams();
  const { books, setActiveSheetIndx } = useContext(UserContext);
  const defaultSheet: Required<sheetType>[] = [
    {
      id: "default_sheet",
      cells: {},
      dirtyCells: {},
      hasChanged: false,
      name: "",
    },
  ];

  useEffect(() => {
    let sheet =
      (books ?? []).find((b) => b.id === bookId)?.sheets ?? defaultSheet;
    sheet = sheet.length === 0 ? defaultSheet : sheet;
    setActiveSheetIndx(sheet[0].id);
  }, []);

  return (
    <div className="app">
      <header className="app-header">
        <h1>Excel Clone</h1>
      </header>
      <div className="config-tab"></div>
      <Sheet />
      <div className="sheet">
        {(
          (books ?? []).find((b) => b.id === bookId)?.sheets ?? defaultSheet
        ).map((sheet, index) => (
          <span
            key={index}
            onClick={() => {
              setActiveSheetIndx(sheet.id);
            }}
          >
            {sheet.name}
          </span>
        ))}
      </div>
    </div>
  );
}
