import { useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { fetcher } from "../util/httpReq";
import Sheet from "./sheet";
import { UserContext } from "../context";

export default function Book() {
  const { activeSheetName, setActiveSheetName } = useContext(UserContext);

  const { bookId } = useParams();
  const [sheetNames, setSheetNames] =
    useState<{ sheetName: string; id: string }[]>();

  useEffect(() => {
    fetchSheetNameAndSheet();
  }, [bookId]);

  async function fetchSheetNameAndSheet() {
    let { data } = await fetcher<{ sheetName: string; id: string }[]>(
      `/sheets/sheetNames/${bookId}`,
      "GET",
    );

    if (data.length === 0) {
      data = [{ sheetName: "New Sheet", id: "" }];
    }

    setSheetNames(data);
    setActiveSheetName(data[0]?.sheetName ?? "New Sheet");
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
            key={sheet.id || sheet.sheetName}
            type="button"
            className={`sheet-tab ${
              activeSheetName === sheet.sheetName ? "active" : ""
            }`}
            onClick={() => {
              setActiveSheetName(sheet.sheetName);
            }}
          >
            {sheet.sheetName}
          </button>
        ))}
      </div>
    </div>
  );
}
