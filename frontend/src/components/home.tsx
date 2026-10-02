import { useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { APP_NAME, APP_TAGLINE, DATASOURCE_TYPE } from '../constents';
import { UserContext } from '../context';
import { dataSource } from '../factories/registory/dataSource';

// Surfaced on the dashboard so the first thing a visitor learns is what the
// app can actually do — not that it resembles another spreadsheet.
const CAPABILITIES = [
  {
    title: 'Formula engine',
    detail: 'Type = for SUM, AVERAGE, MIN, MAX, IF, ranges and nested expressions.',
  },
  {
    title: 'Keyboard-first',
    detail: 'Arrow keys, Tab, Enter and Ctrl+C / Ctrl+X to fly across the grid.',
  },
  {
    title: 'Works offline',
    detail: 'Edits persist locally in IndexedDB and sync back when you reconnect.',
  },
  {
    title: 'Built for scale',
    detail: 'A virtualized grid renders millions of cells without breaking a sweat.',
  },
];

export default function Home() {
  const { books, setBooks, setActiveBookIndx } = useContext(UserContext)!;
  const navigation = useNavigate();

  useEffect(() => {
    async function getBooks() {
      const resp = await (await dataSource[DATASOURCE_TYPE]()).getBooks();
      if (resp.ok) {
        setBooks(resp.data);
      } else {
        toast.error('Something went wrong');
      }
    }

    getBooks();
  }, [setBooks]);

  function handleBookOpen(bookId: string) {
    setActiveBookIndx(bookId);
    navigation(`/book/${bookId}`);
  }

  return (
    <main className="home-page">
      <section className="home-hero">
        <div className="hero-copy">
          <p className="eyebrow">{APP_NAME}</p>
          <h1>{APP_TAGLINE}</h1>
          <p className="hero-description">
            Open a workbook and start typing. {APP_NAME} brings a real formula
            engine, keyboard-driven editing, and an offline-ready grid to the
            browser.
          </p>
        </div>

        <div className="capability-grid">
          {CAPABILITIES.map((cap) => (
            <div key={cap.title} className="capability-card">
              <strong>{cap.title}</strong>
              <span>{cap.detail}</span>
            </div>
          ))}
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
                  <strong>{book.bookName || 'Untitled workbook'}</strong>
                  <p>
                    {(book.sheets ?? []).length
                      ? `${(book.sheets ?? []).length} sheets`
                      : 'Spreadsheet workbook'}
                  </p>
                </div>
                <span
                  className="workbook-card-cta"
                  onClick={() => {
                    handleBookOpen(book.id);
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
