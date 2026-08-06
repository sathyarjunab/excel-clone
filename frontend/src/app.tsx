import { Navigate, Route, Routes } from "react-router-dom";
import { Toaster } from "sonner";
import Book from "./components/book";
import Home from "./components/home";
import "./scss/app.scss";

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
