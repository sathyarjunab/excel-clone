import React from "react";
import ReactDOM from "react-dom/client";
import "./styles.css";
import App from "./app";
import { UserProvider } from "./context";

const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("Root element not found");
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <UserProvider>
      <App />
    </UserProvider>
  </React.StrictMode>,
);
