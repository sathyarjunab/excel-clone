import { Navigate, Route, Routes } from "react-router-dom";
import { Toaster } from "sonner";
import Book from "./components/book";
import "./scss/app.scss";
import Home from "./components/Home";

export default function App() {
  return (
    <>
      <Toaster richColors />

      <Routes>
        <Route path="/home" element={<Home />} />
        <Route path="/book/:bookId" element={<Book />} />
        <Route path="*" element={<Navigate to="/home" replace />} />
      </Routes>
    </>
  );
}
