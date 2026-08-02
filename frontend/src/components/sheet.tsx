import {
  CSSProperties,
  UIEvent,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { UserContext } from "../context";
import "../scss/sheet.scss";
import { numberToAlphabet } from "../util/sheet";
import { Grid } from "./grid";
import { Gatherer } from "../factories/gatherer/service";
import { CACHING_SERVICE_TYPE, DATASOURCE_TYPE } from "../constents";

export type SheetProps = {
  prevClickedCell: `${string}-${string}` | undefined;
  currentClickedCell: `${string}-${string}` | undefined;
};

//TODO: move this to constant file
const CELL_WIDTH = 64;
const CELL_HEIGHT = 20;
const Y_AXIS_WIDTH = 40;

// Use a fallback dimension if window is not available (SSR)
const WINDOW_HEIGHT = typeof window !== "undefined" ? window.innerHeight : 1000;
const WINDOW_WIDTH = typeof window !== "undefined" ? window.innerWidth : 1000;

const getYAxisWidth = (rowCount: number) => {
  const digits = Math.max(1, rowCount.toString().length);
  return Math.max(Y_AXIS_WIDTH, 16 + digits * 8);
};

export default function Sheet() {
  const { saveSheets, latestSheetRef, version, setVersion, activeSheetName } =
    useContext(UserContext);

  const [rowsAndCol, setRowsAndCol] = useState<{
    rows: number;
    cols: number;
  }>({
    rows: 10000,
    cols: 10000,
  });
  const [clickedCells, setClickedCells] = useState<SheetProps>();
  const [scrollPosition, setScrollPosition] = useState({ top: 0, left: 0 });
  const [loading, setLoading] = useState(false);
  const viewportRef = useRef<HTMLDivElement>(null);
  const yAxisWidth = getYAxisWidth(rowsAndCol.rows);
  const timer = useRef<NodeJS.Timeout | null>(null);
  const [cells, setCells] = useState<{
    visibleXAxisCells?: any[];
    visibleYAxisCells?: any[];
    visibleCells?: any[];
  }>();
  const [timeOutRef, setTimeOutRef] = useState<NodeJS.Timeout>();

  const [xAxisStyle] = useState<CSSProperties>({
    backgroundColor: "#F3F3F3",
    justifyContent: "center",
    color: "#616174",
    zIndex: 2,
  });
  const yAxisStyle: CSSProperties = {
    backgroundColor: "#F3F3F3",
    width: `${yAxisWidth}px`,
    justifyContent: "end",
    color: "#616174",
    zIndex: 2,
    paddingRight: 6,
    textAlign: "right",
  };

  const handleDoubleClick = (x: number, y: number) => {
    if (x === 0 || y === 0) return;
    setClickedCells((prev) => {
      return {
        prevClickedCell: prev?.currentClickedCell,
        currentClickedCell: `${x.toString()}-${y.toString()}`,
      };
    });
  };

  const handleScroll = (e: UIEvent<HTMLDivElement>) => {
    setScrollPosition({
      top: e.currentTarget.scrollTop,
      left: e.currentTarget.scrollLeft,
    });
    handleFetchData();
  };

  const handleDataEntry = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (timer.current) {
      clearTimeout(timer.current);
    }
    const content = e.target.value;
    const currentClickedCell = clickedCells?.currentClickedCell;

    // here we need to add the value to the dirty cells and the active sheet
    const prev = latestSheetRef.current;

    latestSheetRef.current = {
      ...prev,
      cellData: {
        ...prev?.cellData,
        [`${currentClickedCell}`]: { style: {}, content },
      },
      dirtyCells: {
        ...prev?.dirtyCells,
        [`${currentClickedCell}`]: { style: {}, content },
      },
    };

    setVersion((prev) => prev + 1);

    timer.current = setTimeout(() => {
      saveSheets();
    }, 2000);
  };

  const handleFetchData = () => {
    if (timeOutRef) {
      clearTimeout(timeOutRef);
    }
    const startRow = Math.max(0, Math.ceil(scrollPosition.top / CELL_HEIGHT));
    const endRow = Math.min(
      rowsAndCol.rows,
      startRow + Math.ceil(WINDOW_HEIGHT / CELL_HEIGHT),
    );
    const startCol = Math.max(0, Math.ceil(scrollPosition.left / CELL_WIDTH));
    const endCol = Math.min(
      rowsAndCol.cols,
      startCol + Math.ceil(WINDOW_WIDTH / CELL_WIDTH),
    );
    setTimeOutRef(
      setTimeout(async () => {
        setLoading(true);
        const gatherer = new Gatherer(
          activeSheetName ?? "",
          CACHING_SERVICE_TYPE,
          DATASOURCE_TYPE,
        );
        const data = await gatherer.getCellData({
          endCol,
          endRow,
          startCol,
          topRow: startRow,
        });
        setLoading(false);

        let cellData = {};
        data?.forEach((sheet) => {
          cellData = {
            ...cellData,
            ...sheet.data,
          };
        });

        latestSheetRef.current = {
          cellData,
          dirtyCells: latestSheetRef.current?.dirtyCells ?? {},
        };

        setVersion((prev) => 1 + prev);
      }, 1000),
    );
  };

  useEffect(() => {
    handleFetchData();
  }, []);

  useEffect(() => {
    // Calculate visible range
    const startRow = Math.max(0, Math.ceil(scrollPosition.top / CELL_HEIGHT));
    const endRow = Math.min(
      rowsAndCol.rows,
      startRow + Math.ceil(WINDOW_HEIGHT / CELL_HEIGHT),
    );

    if (endRow > rowsAndCol.rows - 100 && endRow <= rowsAndCol.rows) {
      setRowsAndCol((prev) => {
        return {
          ...prev,
          rows: prev.rows + 1000,
        };
      });
    }

    const startCol = Math.max(0, Math.ceil(scrollPosition.left / CELL_WIDTH));
    const endCol = Math.min(
      rowsAndCol.cols,
      startCol + Math.ceil(WINDOW_WIDTH / CELL_WIDTH),
    );

    if (endCol > rowsAndCol.cols - 100 && endCol <= rowsAndCol.cols) {
      setRowsAndCol((prev) => {
        return {
          ...prev,
          cols: prev.cols + 1000,
        };
      });
    }
    const visibleCells: any = [];
    for (let x = startRow; x < endRow; x++) {
      for (let y = startCol; y < endCol; y++) {
        if (x === 0 || y === 0) continue;

        let val: string | null = null;
        const top = x * CELL_HEIGHT;
        const left = yAxisWidth + (y - 1) * CELL_WIDTH;

        const customStyle: CSSProperties = {
          top: `${top}px`,
          left: `${left}px`,
        };

        if (!val) {
          val = latestSheetRef.current?.cellData[`${x}-${y}`]?.content ?? null;
        }

        visibleCells.push(
          <Grid
            handleDataEntry={handleDataEntry}
            handleDoubleClick={() => handleDoubleClick(x, y)}
            key={`${x}-${y}`}
            value={val}
            customStyle={customStyle}
            coOrdinates={`${x}-${y}`}
            clickedCells={clickedCells}
          />,
        );
      }
    }

    const xAxisCells: any = [];
    for (let y = startCol; y < endCol; y++) {
      if (y === 0) continue;

      xAxisCells.push(
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

    const yAxisCells: any = [];
    for (let x = startRow; x < endRow; x++) {
      if (x === 0) continue;

      yAxisCells.push(
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

    setCells({
      visibleCells: visibleCells,
      visibleYAxisCells: yAxisCells,
      visibleXAxisCells: xAxisCells,
    });
  }, [version, clickedCells, scrollPosition]);

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
          {cells?.visibleXAxisCells}
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
          {cells?.visibleYAxisCells}
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
        {cells?.visibleCells}
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
