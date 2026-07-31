import { useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { UserContext } from "../context";
import { fetcher } from "../util/httpReq";
import Sheet from "./sheet";

export default function Book() {
  const { activeSheetName, setActiveSheetName, setActiveBookIndx } =
    useContext(UserContext);

  const { bookId } = useParams();
  const [sheetNames, setSheetNames] =
    useState<{ sheetNames: string; id: string }[]>();

  useEffect(() => {
    if (!bookId) return;
    setActiveBookIndx(bookId);
    fetchSheetNameAndSheet();
  }, [bookId]);

  async function fetchSheetNameAndSheet() {
    let { data } = await fetcher<{ sheetNames: string; id: string }[]>(
      `/sheets/sheetNames/${bookId}`,
      "GET",
    );

    if (!data || data.length === 0) {
      data = [{ sheetNames: "New Sheet", id: "" }];
    }

    setSheetNames(data);
    setActiveSheetName(data[0]?.sheetNames ?? "New Sheet");
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>Excel Clone</h1>
      </header>
      <div className="config-tab"></div>
      <Sheet />
      <div className="sheet-tabs">
        {sheetNames?.map((sheet) => (
          <button
            key={sheet.id || sheet.sheetNames}
            type="button"
            className={`sheet-tab ${
              activeSheetName === sheet.sheetNames ? "active" : ""
            }`}
            onClick={() => {
              setActiveSheetName(sheet.sheetNames);
            }}
          >
            {sheet.sheetNames}
          </button>
        ))}
      </div>
    </div>
  );
}
