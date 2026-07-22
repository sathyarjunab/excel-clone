import { useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { UserContext } from "../context";
import Sheet from "./sheet";
import { fetcher } from "../util/httpReq";

export default function Book() {
  const { bookId } = useParams();
  const { books, setActiveSheetIndx } = useContext(UserContext);
  const [sheetName, setSheetName] =
    useState<{ sheetName: string; id: string }[]>();

  useEffect(() => {
    fetchSheetNameAndSheet();
  }, []);

  async function fetchSheetNameAndSheet() {
    const { data } = await fetcher<{ sheetName: string; id: string }[]>(
      `/sheets/sheetNames/${bookId}`,
      "GET",
    );

    const activeIndx = data[0].id;

    setSheetName(data);
    setActiveSheetIndx(activeIndx ?? null);

    console.log(data);

    const sheet = await fetcher(`/sheets/sheet${activeIndx}`, "GET");
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>Excel Clone</h1>
      </header>
      <div className="config-tab"></div>
      <Sheet />
      <div className="sheet">
        {sheetName?.map((sheet, index) => (
          <span
            key={index}
            onClick={() => {
              setActiveSheetIndx(sheet.id);
            }}
          >
            {sheet.sheetName}
          </span>
        ))}
      </div>
    </div>
  );
}
