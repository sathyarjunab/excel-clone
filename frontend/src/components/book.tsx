import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { fetcher } from "../util/httpReq";
import Sheet from "./sheet";

export default function Book() {
  const { bookId } = useParams();
  const [sheetNames, setSheetNames] =
    useState<{ sheetName: string; id: string }[]>();

  useEffect(() => {
    fetchSheetNameAndSheet();
  }, []);

  async function fetchSheetNameAndSheet() {
    const { data } = await fetcher<{ sheetName: string; id: string }[] | []>(
      `/sheets/sheetNames/${bookId}`,
      "GET",
    );

    const activeIndx = data[0]?.id;

    setSheetNames(data);
    if (!activeIndx) return;

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
        {sheetNames?.map((sheet, index) => (
          <span
            key={index}
            onClick={() => {
              // set a sheet;
            }}
          >
            {sheet.sheetName}
          </span>
        ))}
      </div>
    </div>
  );
}
