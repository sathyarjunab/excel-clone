import {
  CSSProperties,
  ReactElement,
  UIEvent,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  CELL_HEIGHT,
  CELL_WIDTH,
  DATASOURCE_TYPE,
  DEFAULT_CLIENT_DB_SERVICE_TYPE,
  FETCH_DEBOUNCE_MS,
  SAVE_DEBOUNCE_MS,
  Y_AXIS_WIDTH,
} from "../constents";
import { UserContext } from "../context";
import { Gatherer } from "../services/gatherer/service";
import { createKeyDownHandlerMap } from "../services/handlers";
import { clientDbSource } from "../factories/registory/clientDb";
import { commonService } from "../services/common";
import "../scss/sheet.scss";
import { clientSheet } from "../types/book";
import { numberToAlphabet } from "../util/sheet";
import { Grid } from "./grid";

export type SheetProps = {
  prevClickedCell: `${string}-${string}` | undefined;
  currentClickedCell: `${string}-${string}` | undefined;
  makeInputActive: boolean;
};

// Fallback viewport size before the ResizeObserver has measured the element.
const FALLBACK_HEIGHT =
  typeof window !== "undefined" ? window.innerHeight : 1000;
const FALLBACK_WIDTH = typeof window !== "undefined" ? window.innerWidth : 1000;

const getYAxisWidth = (rowCount: number) => {
  const digits = Math.max(1, rowCount.toString().length);
  return Math.max(Y_AXIS_WIDTH, 16 + digits * 8);
};

const clientDbInstancePromise =
  clientDbSource[DEFAULT_CLIENT_DB_SERVICE_TYPE]();

export default function Sheet() {
  const {
    saveSheets,
    sheetData,
    setSheetData,
    activeSheetName,
    selectedCell,
    setFourNodes,
    fourNodes,
    setLoading,
    loading,
    saveTimer,
    moverCell,
    setMoverCell,
  } = useContext(UserContext)!;

  const [rowsAndCol, setRowsAndCol] = useState<{
    rows: number;
    cols: number;
  }>({
    rows: 10000,
    cols: 10000,
  });
  const [clickedCells, setClickedCells] = useState<SheetProps>();
  const [scrollPosition, setScrollPosition] = useState({ top: 0, left: 0 });
  // #5: the visible viewport size is measured, not frozen at module load, so
  // the grid recalculates its visible range when the window resizes.
  const [viewportSize, setViewportSize] = useState({
    height: FALLBACK_HEIGHT,
    width: FALLBACK_WIDTH,
  });

  const viewportRef = useRef<HTMLDivElement>(null);
  // #4: two independent debounces, each in a ref so they survive re-renders
  // without being state (a timer in state re-renders on every scroll).
  const fetchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const yAxisWidth = getYAxisWidth(rowsAndCol.rows);

  const handleDoubleClick = useCallback(() => {
    setClickedCells((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        makeInputActive: true,
      };
    });
  }, []);

  const handleFetchData = useCallback(() => {
    if (fetchTimer.current) clearTimeout(fetchTimer.current);

    fetchTimer.current = setTimeout(async () => {
      // Read the scroll offset from the DOM at fire time so the fetch always
      // targets the region the user actually landed on (no stale closure).
      const el = viewportRef.current;
      const top = el ? el.scrollTop : scrollPosition.top;
      const left = el ? el.scrollLeft : scrollPosition.left;

      const startRow = Math.max(0, Math.ceil(top / CELL_HEIGHT));
      const endRow = Math.min(
        rowsAndCol.rows,
        startRow + Math.ceil(viewportSize.height / CELL_HEIGHT),
      );
      const startCol = Math.max(0, Math.ceil(left / CELL_WIDTH));
      const endCol = Math.min(
        rowsAndCol.cols,
        startCol + Math.ceil(viewportSize.width / CELL_WIDTH),
      );

      setLoading(true);
      try {
        const gatherer = new Gatherer(
          activeSheetName ?? "",
          DEFAULT_CLIENT_DB_SERVICE_TYPE,
          DATASOURCE_TYPE,
        );
        const data = await gatherer.getCellData({
          endCol,
          endRow,
          startCol,
          topRow: startRow,
        });

        let fetched: clientSheet["cellData"] = {};
        data?.forEach((sheet) => {
          fetched = { ...fetched, ...sheet.data };
        });

        // Layer unsaved local edits on top of the fetched server data so a
        // background refetch never wipes out something the user just typed.
        setSheetData((prev) => ({
          cellData: { ...fetched, ...prev.dirtyCells },
          dirtyCells: prev.dirtyCells,
        }));
      } finally {
        setLoading(false);
      }
    }, FETCH_DEBOUNCE_MS);
  }, [rowsAndCol, viewportSize, activeSheetName, setSheetData, scrollPosition]);

  const handleDataEntry = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const content = e.target.value;
      const currentClickedCell = clickedCells?.currentClickedCell;
      if (!currentClickedCell) return;

      const grid = { style: {}, content };

      // #2: cell data is real state, so the edit re-renders the grid normally.
      setSheetData((prev) => {
        // #3: add the dirty cell to the IDB so that if the user refreshes the page as soon as he enters the details it persist in db
        clientDbInstancePromise.then(async (clientDbInstance) => {
          await clientDbInstance.saveDirtyCell({
            ...prev.dirtyCells,
            [currentClickedCell]: grid,
          });
        });

        return {
          cellData: { ...prev.cellData, [currentClickedCell]: grid },
          dirtyCells: { ...prev.dirtyCells, [currentClickedCell]: grid },
        };
      });

      // #4: write through to the IDB chunk so scrolling away and back shows the
      // edit instead of the stale value cached on the first fetch.
      const [rowStr, colStr] = currentClickedCell.split("-");
      const gatherer = new Gatherer(
        activeSheetName ?? "",
        DEFAULT_CLIENT_DB_SERVICE_TYPE,
        DATASOURCE_TYPE,
      );
      void gatherer.updateCellInCache(
        Number(rowStr),
        Number(colStr),
        currentClickedCell,
        grid,
      );

      if (saveTimer.current) clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(
        () => saveSheets(setLoading),
        SAVE_DEBOUNCE_MS,
      );
    },
    [clickedCells, activeSheetName, saveSheets, setSheetData],
  );

  const handleKeyDown = useCallback(
    (keyDown: KeyboardEvent) => {
      const convertedKey = commonService.keyDownConvertor(keyDown);
      const handlerMap = createKeyDownHandlerMap({
        setFourNodes,
        setClickedCells,
        setLoading,
        saveSheets,
        saveTimer,
        sheetData,
        fourNodes,
        moverCell,
        setMoverCell,
        setSheetData,
        activeSheetName,
      });
      const handler = handlerMap[convertedKey];

      // No handler for this key -> the user is typing into the cell.
      if (!handler) {
        setClickedCells((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            makeInputActive: true,
          };
        });
        return;
      }

      handler(keyDown);
    },
    [
      fourNodes,
      sheetData,
      saveSheets,
      saveTimer,
      setFourNodes,
      setClickedCells,
      setLoading,
      activeSheetName,
    ],
  );

  const xAxisStyle = useMemo<CSSProperties>(
    () => ({
      backgroundColor: "#F3F3F3",
      justifyContent: "center",
      color: "#616174",
      zIndex: 2,
    }),
    [],
  );
  const yAxisStyle = useMemo<CSSProperties>(
    () => ({
      backgroundColor: "#F3F3F3",
      width: `${yAxisWidth}px`,
      justifyContent: "end",
      color: "#616174",
      zIndex: 2,
      paddingRight: 6,
      textAlign: "right",
    }),
    [yAxisWidth],
  );

  const visibleRange = useMemo(() => {
    const startRow = Math.max(0, Math.ceil(scrollPosition.top / CELL_HEIGHT));
    const endRow = Math.min(
      rowsAndCol.rows,
      startRow + Math.ceil(viewportSize.height / CELL_HEIGHT),
    );
    const startCol = Math.max(0, Math.ceil(scrollPosition.left / CELL_WIDTH));
    const endCol = Math.min(
      rowsAndCol.cols,
      startCol + Math.ceil(viewportSize.width / CELL_WIDTH),
    );
    return { startRow, endRow, startCol, endCol };
  }, [scrollPosition, rowsAndCol, viewportSize]);

  // #1: the visible cells are DERIVED render output, computed with useMemo
  // during render — never stored in state and rebuilt from an effect.
  const cells = useMemo(() => {
    const { startRow, endRow, startCol, endCol } = visibleRange;

    const visibleCells: ReactElement[] = [];
    for (let x = startRow; x < endRow; x++) {
      for (let y = startCol; y < endCol; y++) {
        if (x === 0 || y === 0) continue;

        const top = x * CELL_HEIGHT;
        const left = yAxisWidth + (y - 1) * CELL_WIDTH;
        const customStyle: CSSProperties = {
          top: `${top}px`,
          left: `${left}px`,
        };

        const val = sheetData.cellData[`${x}-${y}`]?.content ?? null;

        visibleCells.push(
          <Grid
            handleDataEntry={handleDataEntry}
            handleDoubleClick={() => handleDoubleClick()}
            key={`${x}-${y}`}
            value={val}
            customStyle={customStyle}
            coOrdinates={`${x}-${y}`}
            clickedCells={clickedCells}
          />,
        );
      }
    }

    const visibleXAxisCells: ReactElement[] = [];
    for (let y = startCol; y < endCol; y++) {
      if (y === 0) continue;

      visibleXAxisCells.push(
        <div
          key={`x-${y}`}
          className="grid-cell axis-cell"
          style={{
            ...xAxisStyle,
            left: `${yAxisWidth + (y - 1) * CELL_WIDTH}px`,
            top: 0,
            width: `${CELL_WIDTH}px`,
            height: `${CELL_HEIGHT}px`,
          }}
        >
          {numberToAlphabet(y, "")}
        </div>,
      );
    }

    const visibleYAxisCells: ReactElement[] = [];
    for (let x = startRow; x < endRow; x++) {
      if (x === 0) continue;

      visibleYAxisCells.push(
        <div
          key={`y-${x}`}
          className="grid-cell axis-cell"
          style={{
            ...yAxisStyle,
            left: 0,
            top: `${x * CELL_HEIGHT}px`,
            width: `${yAxisWidth}px`,
            height: `${CELL_HEIGHT}px`,
          }}
        >
          {x.toString()}
        </div>,
      );
    }

    return { visibleCells, visibleXAxisCells, visibleYAxisCells };
  }, [
    visibleRange,
    sheetData,
    clickedCells,
    yAxisWidth,
    xAxisStyle,
    yAxisStyle,
    handleDataEntry,
    handleDoubleClick,
  ]);

  // The selection (fourNodes) is drawn as ONE overlay spanning the whole
  // range, not by styling each cell. This keeps `fourNodes` out of the `cells`
  // memo, so moving the selection updates a single div instead of re-rendering
  // every cell it covers — the same decoupling used for the loading indicator.
  const selectionOverlay = useMemo(() => {
    if (!fourNodes) return null;

    let minRow = Infinity;
    let maxRow = -Infinity;
    let minCol = Infinity;
    let maxCol = -Infinity;
    for (const corner of [
      fourNodes.topLeft,
      fourNodes.topRight,
      fourNodes.bottomLeft,
      fourNodes.bottomRight,
    ]) {
      const [row, col] = corner.split("-").map(Number);
      if (row && row < minRow) minRow = row;
      if (row && row > maxRow) maxRow = row;
      if (col && col < minCol) minCol = col;
      if (col && col > maxCol) maxCol = col;
    }

    // Never draw over the frozen header row/column.
    if (minRow < 1 || minCol < 1) return null;

    return (
      <div
        className="sheet-selection"
        style={{
          top: `${minRow * CELL_HEIGHT}px`,
          left: `${yAxisWidth + (minCol - 1) * CELL_WIDTH}px`,
          width: `${(maxCol - minCol + 1) * CELL_WIDTH}px`,
          height: `${(maxRow - minRow + 1) * CELL_HEIGHT}px`,
        }}
      />
    );
  }, [fourNodes, yAxisWidth]);

  // keep viewportSize in sync with the actual element.
  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;

    const measure = () =>
      setViewportSize({ height: el.clientHeight, width: el.clientWidth });

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => {
      observer.disconnect();
      // Clear pending timers on unmount.
      if (fetchTimer.current) clearTimeout(fetchTimer.current);
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, []);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleKeyDown]);

  useEffect(() => {
    if (!selectedCell) return;
    setFourNodes({
      bottomLeft: selectedCell,
      bottomRight: selectedCell,
      topLeft: selectedCell,
      topRight: selectedCell,
      activeCell: selectedCell,
    });
    const [x, y] = selectedCell.split("-").map(Number);
    setClickedCells((prev) => ({
      prevClickedCell: prev?.currentClickedCell,
      currentClickedCell: `${x}-${y}`,
      makeInputActive: false,
    }));
  }, [selectedCell]);

  // Fetch on first mount and whenever the active sheet changes.
  useEffect(() => {
    handleFetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeSheetName]);

  // Grow the sheet as the user approaches the current edge. Kept as its own
  // effect because it is a side effect and must not live inside the render memo.
  useEffect(() => {
    const { endRow, endCol } = visibleRange;
    if (endRow > rowsAndCol.rows - 100 && endRow <= rowsAndCol.rows) {
      setRowsAndCol((prev) => ({ ...prev, rows: prev.rows + 1000 }));
    }
    if (endCol > rowsAndCol.cols - 100 && endCol <= rowsAndCol.cols) {
      setRowsAndCol((prev) => ({ ...prev, cols: prev.cols + 1000 }));
    }
  }, [visibleRange, rowsAndCol]);

  const handleScroll = (e: UIEvent<HTMLDivElement>) => {
    setScrollPosition({
      top: e.currentTarget.scrollTop,
      left: e.currentTarget.scrollLeft,
    });
    handleFetchData();
  };

  return (
    <div className="sheet-shell">
      <div className="sheet-viewport" ref={viewportRef} onScroll={handleScroll}>
        <div
          className="sheet-body"
          style={{
            width: `${yAxisWidth + (rowsAndCol.cols - 1) * CELL_WIDTH}px`,
            height: `${rowsAndCol.rows * CELL_HEIGHT}px`,
          }}
        >
          {/* Column headers (A, B, C ...): pinned to the top on vertical
              scroll, but free to move horizontally so each letter tracks its
              column. */}
          <div
            className="sheet-axis sheet-x-axis"
            style={{
              width: `${yAxisWidth + (rowsAndCol.cols - 1) * CELL_WIDTH}px`,
              height: `${CELL_HEIGHT}px`,
              transform: `translateY(${scrollPosition.top}px)`,
            }}
          >
            {cells.visibleXAxisCells}
          </div>
          {/* Row headers (1, 2, 3 ...): pinned to the left on horizontal
              scroll, but free to move vertically so each number tracks its
              row. */}
          <div
            className="sheet-axis sheet-y-axis"
            style={{
              width: `${yAxisWidth}px`,
              height: `${rowsAndCol.rows * CELL_HEIGHT}px`,
              transform: `translateX(${scrollPosition.left}px)`,
            }}
          >
            {cells.visibleYAxisCells}
          </div>
          {/* Top-left corner: pinned in both directions. */}
          <div
            className="sheet-corner grid-cell"
            style={{
              ...xAxisStyle,
              ...yAxisStyle,
              left: 0,
              top: 0,
              width: `${yAxisWidth}px`,
              height: `${CELL_HEIGHT}px`,
              zIndex: 4,
              transform: `translate(${scrollPosition.left}px, ${scrollPosition.top}px)`,
            }}
          />
          {cells.visibleCells}
          {selectionOverlay}
        </div>
      </div>
      {/* Fetch indicator: a single element pinned to the visible viewport
          corner. It lives outside the cell array, so toggling it never
          re-renders any cell — the spinner animates purely in CSS. */}
      {loading && (
        <div className="sheet-loading-indicator">
          <span className="sheet-loading-dot" />
          <span className="sheet-loading-dot" />
          <span className="sheet-loading-dot" />
          Loading
        </div>
      )}
    </div>
  );
}
