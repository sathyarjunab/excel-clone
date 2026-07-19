import { useContext, useEffect } from "react";
import { toast } from "sonner";
import { UserContext } from "../context";
import { fetcher } from "../util/httpReq";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const { books, setBooks, setActiveBookIndx } = useContext(UserContext);
  const navigation = useNavigate();

  useEffect(() => {
    async function getBooks() {
      const resp = await fetcher("/user/books", "GET", true);
      if (resp.ok) {
        setBooks(resp.data);
      } else {
        toast.error("Something went wrong");
      }
    }

    getBooks();
  }, [setBooks]);

  function handleSheetOpen(bookId: string) {
    setActiveBookIndx(bookId);
    navigation(`/book/${bookId}`);
  }

  return (
    <main className="home-page">
      <section className="home-hero">
        <div className="hero-copy">
          <p className="eyebrow">Excel Clone</p>
          <h1>Create, organize, and open your workbooks.</h1>
          <p className="hero-description">
            A clean frontend dashboard for your spreadsheets with fast access to
            your saved books.
          </p>
        </div>
      </section>

      <section className="workbooks-section">
        <div className="section-header">
          <h2>Your workbooks</h2>
          <button className="primary-button" type="button">
            + New workbook
          </button>
        </div>

        {books?.length ? (
          <div className="workbook-grid">
            {books.map((book) => (
              <article key={book.id} className="workbook-card">
                <div>
                  <strong>{book.bookName || "Untitled workbook"}</strong>
                  <p>
                    {(book.sheets ?? []).length
                      ? `${(book.sheets ?? []).length} sheets`
                      : "Spreadsheet workbook"}
                  </p>
                </div>
                <span
                  className="workbook-card-cta"
                  onClick={() => {
                    handleSheetOpen(book.id);
                  }}
                >
                  Open
                </span>
              </article>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-icon">+</div>
            <p>No workbooks yet. Create one to get started.</p>
          </div>
        )}
      </section>
    </main>
  );
}
