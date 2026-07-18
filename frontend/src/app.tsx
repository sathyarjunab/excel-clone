import { useContext } from "react";
import { Toaster } from "sonner";
import Sheet from "./components/sheet";
import { UserContext } from "./context";
import "./scss/app.scss";

export default function App() {
  const { book } = useContext(UserContext);
  return (
    <>
      <Toaster richColors />
      <div className="app">
        <header className="app-header">
          <h1>Excel Clone</h1>
        </header>
        <div className="config-tab"></div>
        {/* <div>
        <div className=""></div> */}
        <div className="sheet">
          {book.sheets.map((_sheet, index) => (
            <Sheet key={index} />
          ))}
        </div>
        {/* </div> */}
      </div>
    </>
  );
}
