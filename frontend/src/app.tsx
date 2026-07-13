import { useContext } from "react";
import Sheet from "./components/sheet";
import { UserContext, UserProvider } from "./context";
import "./scss/app.scss";

export default function App() {
  const { book } = useContext(UserContext);
  return (
    <UserProvider>
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
    </UserProvider>
  );
}
