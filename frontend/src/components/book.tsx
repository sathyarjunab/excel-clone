import { useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { fetcher } from "../util/httpReq";
import Sheet from "./sheet";
import { UserContext } from "../context";

export default function Book() {
  const { setActiveSheetName } = useContext(UserContext);

  const { bookId } = useParams();
  const [sheetNames, setSheetNames] =
    useState<{ sheetName: string; id: string }[]>();

  useEffect(() => {
    fetchSheetNameAndSheet();
  }, []);

  async function fetchSheetNameAndSheet() {
    const { data } = await fetcher<{ sheetName: string; id: string }[]>(
      `/sheets/sheetNames/${bookId}`,
      "GET",
    );

    setSheetNames(data);
    setActiveSheetName(data[0]?.sheetName ?? null);
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>Excel Clone</h1>
      </header>
      <div className="config-tab"></div>
      <Sheet />
      <div className="sheet">
        {sheetNames?.map((sheet, index) => (
          <span
            key={index}
            onClick={() => {
              setActiveSheetName(sheet.sheetName);
            }}
          >
            {sheet.sheetName}
          </span>
        ))}
      </div>
    </div>
  );
}
