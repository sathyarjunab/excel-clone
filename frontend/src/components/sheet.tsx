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
const TOTAL_ROWS = 10000;
const TOTAL_COLS = 1000;

export default function Sheet() {
  const { setBook, book, activeSheetIndx } = useContext(UserContext);

  const [clickedCells, setClickedCells] = useState<SheetProps>();
  const [scrollPosition, setScrollPosition] = useState({ top: 0, left: 0 });
  const viewportRef = useRef<HTMLDivElement>(null);

  const [xAxisStyle] = useState<CSSProperties>({
    backgroundColor: "#F3F3F3",
    justifyContent: "center",
    color: "#616174",
    zIndex: 2,
  });
  const [yAxisStyle] = useState<CSSProperties>({
    backgroundColor: "#F3F3F3",
    width: `${Y_AXIS_WIDTH}px`,
    justifyContent: "end",
    color: "#616174",
    zIndex: 2,
  });

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
    TOTAL_ROWS,
    startRow + Math.ceil(windowHeight / CELL_HEIGHT),
  );

  const startCol = Math.max(0, Math.ceil(scrollPosition.left / CELL_WIDTH));
  const endCol = Math.min(
    TOTAL_COLS,
    startCol + Math.ceil(windowWidth / CELL_WIDTH),
  );

  const visibleCells = [];

  for (let x = startRow; x < endRow; x++) {
    for (let y = startCol; y < endCol; y++) {
      if (x === 0 || y === 0) continue;

      let val: string | null = null;
      const top = x * CELL_HEIGHT;
      const left = Y_AXIS_WIDTH + (y - 1) * CELL_WIDTH;

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
        className="grid-cell sticky-axis-cell"
        style={{
          ...xAxisStyle,
          width: `${CELL_WIDTH}px`,
          height: `${CELL_HEIGHT}px`,
          flexShrink: 0,
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
        className="grid-cell sticky-axis-cell"
        style={{
          ...yAxisStyle,
          width: `${Y_AXIS_WIDTH}px`,
          height: `${CELL_HEIGHT}px`,
          flexShrink: 0,
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
          width: `${Y_AXIS_WIDTH + (TOTAL_COLS - 1) * CELL_WIDTH}px`,
          height: `${TOTAL_ROWS * CELL_HEIGHT}px`,
        }}
      >
        <div
          className="sheet-axis sheet-x-axis"
          style={{
            width: `${Math.max(0, endCol - startCol) * CELL_WIDTH}px`,
            height: `${CELL_HEIGHT}px`,
          }}
        >
          <div
            className="grid-cell sticky-axis-cell"
            style={{
              ...xAxisStyle,
              ...yAxisStyle,
              width: `${Y_AXIS_WIDTH}px`,
              height: `${CELL_HEIGHT}px`,
              flexShrink: 0,
              zIndex: 3,
            }}
          />
          {visibleXAxisCells}
        </div>
        <div
          className="sheet-axis sheet-y-axis"
          style={{
            width: `${Y_AXIS_WIDTH}px`,
            height: `${Math.max(0, endRow - startRow) * CELL_HEIGHT}px`,
          }}
        >
          {visibleYAxisCells}
        </div>
        {visibleCells}
      </div>
    </div>
  );
}
