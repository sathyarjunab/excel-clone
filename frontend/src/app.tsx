import { useEffect, useState } from "react";
import { Workbook } from "./types/book";
import Sheet from "./components/sheet";
import "./scss/app.scss";

export default function App() {
  const [book, setBook] = useState<Workbook | null>(null);
  const [activeSheetId, setActiveSheetId] = useState<number | null>(null);
  useEffect(() => {}, []);

  const handleCreateSheet = async () => {};

  return (
    <div className="app">
      <header className="app-header">
        <h1>Excel Clone</h1>
      </header>
      <div className="config-tab"></div>
      {/* <div>
        <div className=""></div> */}
      <div className="sheet">
        <Sheet />
      </div>
      {/* </div> */}
    </div>
  );
}
