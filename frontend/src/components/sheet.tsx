import { CSSProperties, UIEvent, useContext, useRef, useState } from "react";
import "../scss/sheet.scss";
import { numberToAlphabet } from "../util/sheet";
import { Grid } from "./grid";
import { UserContext } from "../context";

export type SheetProps = {
  prevClickedCell: `${string}-${string}` | undefined;
  currentClickedCell: `${string}-${string}` | undefined;
};

const CELL_WIDTH = 64;
const CELL_HEIGHT = 20;
const Y_AXIS_WIDTH = 40;

const getYAxisWidth = (rowCount: number) => {
  const digits = Math.max(1, rowCount.toString().length);
  return Math.max(Y_AXIS_WIDTH, 16 + digits * 8);
};

export default function Sheet() {
  const { setBook, book, activeSheetIndx } = useContext(UserContext);

  const [rowsAndCol, setRowsAndCol] = useState<{
    rows: number;
    cols: number;
  }>({
    rows: 10000,
    cols: 10000,
  });
  const [clickedCells, setClickedCells] = useState<SheetProps>();
  const [scrollPosition, setScrollPosition] = useState({ top: 0, left: 0 });
  const viewportRef = useRef<HTMLDivElement>(null);
  const yAxisWidth = getYAxisWidth(rowsAndCol.rows);

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
  };

  const handleDataEntry = (e: React.ChangeEvent<HTMLInputElement>) => {
    const content = e.target.value;
    setBook((prev) => {
      return {
        ...prev,
        sheets: prev.sheets.map((sheet) => {
          if (
            sheet.id === prev.activeSheetIndx &&
            clickedCells?.currentClickedCell
          ) {
            return {
              ...sheet,
              data: {
                ...sheet.data,
                [clickedCells.currentClickedCell]: {
                  ...sheet.data[clickedCells?.currentClickedCell],
                  content: content,
                },
              },
            };
          }
          return sheet;
        }),
      };
    });
  };

  // Use a fallback dimension if window is not available (SSR)
  const windowHeight =
    typeof window !== "undefined" ? window.innerHeight : 1000;
  const windowWidth = typeof window !== "undefined" ? window.innerWidth : 1000;

  // Calculate visible range
  const startRow = Math.max(0, Math.ceil(scrollPosition.top / CELL_HEIGHT));
  const endRow = Math.min(
    rowsAndCol.rows,
    startRow + Math.ceil(windowHeight / CELL_HEIGHT),
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
    startCol + Math.ceil(windowWidth / CELL_WIDTH),
  );

  if (endCol > rowsAndCol.cols - 100 && endCol <= rowsAndCol.cols) {
    setRowsAndCol((prev) => {
      return {
        ...prev,
        cols: prev.cols + 1000,
      };
    });
  }

  const visibleCells = [];

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
        val = book.sheets[activeSheetIndx]?.data[`${x}-${y}`]?.content || "";
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

  const visibleXAxisCells = [];
  for (let y = startCol; y < endCol; y++) {
    if (y === 0) continue;
    visibleXAxisCells.push(
      <div
        key={`x-${y}`}
        className="grid-cell axis-cell"
        style={{
          ...xAxisStyle,
          // Same coordinate model as the data cells so the letter always
          // sits directly above its column, regardless of scroll offset.
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

  const visibleYAxisCells = [];
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

  return (
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
          {visibleXAxisCells}
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
          {visibleYAxisCells}
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
        {visibleCells}
      </div>
    </div>
  );
}
