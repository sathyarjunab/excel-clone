import { Plus, Trash2, X } from "lucide-react";
import { useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "sonner";
import {
  APP_NAME,
  DATASOURCE_TYPE,
  DEFAULT_CLIENT_DB_SERVICE_TYPE,
} from "../constents";
import { UserContext } from "../context";
import { clientDbSource } from "../factories/registory/clientDb";
import { dataSource } from "../factories/registory/dataSource";
import { numberToAlphabet } from "../util/sheet";
import Sheet from "./sheet";

export default function Book() {
  const {
    activeSheetName,
    setActiveSheetName,
    setActiveBookIndx,
    selectedCell,
    sheetData,
  } = useContext(UserContext)!;

  // Formula-bar readout: the active cell's A1 address and its raw text (the
  // formula if it has one, otherwise the plain value).
  const [selRow, selCol] = selectedCell?.split("-") ?? [];
  const cellAddress =
    selRow && selCol ? `${numberToAlphabet(Number(selCol), "")}${selRow}` : "—";
  const activeGrid = selectedCell ? sheetData.cellData[selectedCell] : undefined;
  const cellContent = activeGrid?.rawData ?? activeGrid?.content ?? "";

  const { bookId } = useParams();
  const [sheetNames, setSheetNames] =
    useState<{ sheetNames: string; id: string }[]>();
  const [showCreateModule, setShowCreateModule] = useState<boolean>(false);
  const [newSheetName, setNewSheetName] = useState<string>("");
  const [sheetToDelete, setSheetToDelete] = useState<string | null>(null);

  useEffect(() => {
    if (!bookId) return;
    setActiveBookIndx(bookId);
    fetchSheetNameAndSheet();
  }, [bookId]);

  async function fetchSheetNameAndSheet() {
    let { data } = await (
      await dataSource[DATASOURCE_TYPE]()
    ).getSheetNames(bookId!);

    if (!data || data.length === 0) {
      data = [{ sheetNames: "New Sheet", id: "" }];
    }

    setSheetNames(data);
    setActiveSheetName(data[0]?.sheetNames ?? "New Sheet");
  }

  async function handleNewSheetCreate() {
    try {
      if (!newSheetName.trim()) return; //TODO: show error message
      const dataSourceInstance = await dataSource[DATASOURCE_TYPE]();
      const clientDataSource =
        await clientDbSource[DEFAULT_CLIENT_DB_SERVICE_TYPE]();

      await dataSourceInstance.saveSheets({
        dirtyCells: { "0-0": { content: "", style: {}, rawData: "" } },
        name: newSheetName,
        bookId: bookId ?? null,
      });

      if (!bookId || !activeSheetName) {
        toast.error(
          !bookId ? "Book id not found" : "Sheet name is not present",
        );
        return;
      }

      await clientDataSource.saveChunk([
        {
          id: "string",
          data: { "0-0": { content: "", style: {}, rawData: "" } },
          sheetName: activeSheetName,
          chunksCount: 1,
          range: "500-500",
          bookId: bookId,
        },
      ]);
      setShowCreateModule(false);
      fetchSheetNameAndSheet();
    } catch (err) {
      if (err instanceof Error) {
        toast.error("Failed to create sheet: " + err.message);
      }
      toast.error("Failed to create sheet: Unknown error");
    }
  }

  async function removeSheet(sheetName: string) {
    const dataSourceInstance = await dataSource[DATASOURCE_TYPE]();
    const clientDataSource =
      await clientDbSource[DEFAULT_CLIENT_DB_SERVICE_TYPE]();
    await dataSourceInstance.deleteSheet(sheetName);
    await clientDataSource.removeSheet(sheetName);
    fetchSheetNameAndSheet();
  }

  async function confirmDeleteSheet() {
    if (!sheetToDelete) return;
    try {
      await removeSheet(sheetToDelete);
    } catch (err) {
      toast.error(
        "Failed to delete sheet: " +
          (err instanceof Error ? err.message : "Unknown error"),
      );
    } finally {
      setSheetToDelete(null);
    }
  }

  return (
    <div className="app">
      <header className="app-header">
        <div className="brand">
          <span className="brand-mark" aria-hidden="true" />
          <span className="brand-name">{APP_NAME}</span>
        </div>
        {activeSheetName && (
          <span className="brand-sheet">{activeSheetName}</span>
        )}
      </header>

      <div className="formula-bar">
        <span className="cell-address" title="Active cell">
          {cellAddress}
        </span>
        <span className="cell-content">
          {cellContent ? (
            cellContent
          ) : (
            <em>Type a value, or start with “=” for a formula</em>
          )}
        </span>
        <span className="shortcut-hint">
          <kbd>=</kbd> SUM / IF / ranges
          <span className="hint-dot" />
          <kbd>Ctrl</kbd>+<kbd>C</kbd> / <kbd>X</kbd>
          <span className="hint-dot" />
          <kbd>↑ ↓ ← →</kbd> move
        </span>
      </div>

      <Sheet />
      <div className="sheet-tabs">
        <div className="sheet-tabs-scroll">
          {sheetNames?.map((sheet) => (
            <div
              key={sheet.id || sheet.sheetNames}
              className={`sheet-tab ${
                activeSheetName === sheet.sheetNames ? "active" : ""
              }`}
            >
              <button
                type="button"
                className="sheet-tab-label"
                onClick={() => {
                  setActiveSheetName(sheet.sheetNames);
                }}
              >
                {sheet.sheetNames}
              </button>
              {sheetNames.length > 1 && (
                <button
                  type="button"
                  className="sheet-tab-close"
                  aria-label={`Delete sheet ${sheet.sheetNames}`}
                  title="Delete sheet"
                  onClick={() => setSheetToDelete(sheet.sheetNames)}
                >
                  <X size={13} strokeWidth={2.5} />
                </button>
              )}
            </div>
          ))}
        </div>

        <div className="sheet-add">
          <button
            type="button"
            className={`sheet-add-btn ${showCreateModule ? "active" : ""}`}
            onClick={() => setShowCreateModule((prev) => !prev)}
            aria-label="Create new sheet"
            title="Create new sheet"
          >
            <Plus size={18} strokeWidth={2.5} />
          </button>

          {showCreateModule && (
            <div
              className="sheet-add-popover"
              role="dialog"
              aria-label="Create a new sheet"
            >
              <label htmlFor="sheetNameInput" className="sheet-add-label">
                Sheet name
              </label>
              <input
                type="text"
                id="sheetNameInput"
                className="sheet-add-input"
                placeholder="e.g. Q3 Budget"
                value={newSheetName}
                autoFocus
                onChange={(e) => setNewSheetName(e.target.value)}
              />
              <div className="sheet-add-actions">
                <button
                  type="button"
                  className="sheet-add-cancel"
                  onClick={() => {
                    setNewSheetName("");
                    setShowCreateModule(false);
                  }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="sheet-add-create"
                  disabled={!newSheetName.trim()}
                  onClick={handleNewSheetCreate}
                >
                  Create
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {sheetToDelete && (
        <div className="modal-overlay" onClick={() => setSheetToDelete(null)}>
          <div
            className="modal-card"
            role="alertdialog"
            aria-modal="true"
            aria-label="Delete sheet confirmation"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-icon">
              <Trash2 size={24} />
            </div>
            <h3>Delete this sheet?</h3>
            <p>
              You are about to delete <strong>“{sheetToDelete}”</strong>. This
              action can’t be undone.
            </p>
            <div className="modal-actions">
              <button
                type="button"
                className="modal-cancel"
                onClick={() => setSheetToDelete(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="modal-delete"
                onClick={confirmDeleteSheet}
              >
                Yes, delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
