import { useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { UserContext } from "../context";
import Sheet from "./sheet";
import { dataSource } from "../factories/registory/dataSource";
import { DATASOURCE_TYPE, DEFAULT_CLIENT_DB_SERVICE_TYPE } from "../constents";
import { DiamondPlus } from "lucide-react";
import { toast } from "sonner";
import { clientDbSource } from "../factories/registory/clientDb";

export default function Book() {
  const { activeSheetName, setActiveSheetName, setActiveBookIndx } =
    useContext(UserContext);

  const { bookId } = useParams();
  const [sheetNames, setSheetNames] =
    useState<{ sheetNames: string; id: string }[]>();
  const [showCreateModule, setShowCreateModule] = useState<boolean>(false);
  const [newSheetName, setNewSheetName] = useState<string>("");

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
        dirtyCells: { "0-0": { content: "", style: {} } },
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
          data: { "0-0": { content: "", style: {} } },
          sheetName: activeSheetName,
          chunksCount: 1,
          range: "500-500",
          bookId: bookId,
        },
      ]);
    } catch (err) {
      if (err instanceof Error) {
        toast.error("Failed to create sheet: " + err.message);
      }
      toast.error("Failed to create sheet: Unknown error");
    }
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>Excel Clone</h1>
      </header>
      <div className="config-tab"></div>
      <Sheet />
      <div className="sheet-tabs">
        <div className="sheet-tabs-scroll">
          {sheetNames?.map((sheet) => (
            <button
              key={sheet.id || sheet.sheetNames}
              type="button"
              className={`sheet-tab ${
                activeSheetName === sheet.sheetNames ? "active" : ""
              }`}
              onClick={() => {
                setActiveSheetName(sheet.sheetNames);
              }}
            >
              {sheet.sheetNames}
            </button>
          ))}
          <button
            type="button"
            className={`sheet-add-btn ${showCreateModule ? "active" : ""}`}
            onClick={() => setShowCreateModule((prev) => !prev)}
            aria-label="Create new sheet"
            title="Create new sheet"
          >
            <DiamondPlus size={20} />
          </button>
        </div>

        <div className="sheet-add">
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
    </div>
  );
}
