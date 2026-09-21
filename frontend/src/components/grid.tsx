import React, { CSSProperties, useContext } from "react";
import "./../scss/sheet.scss";
import { SheetProps } from "./sheet";
import { UserContext } from "../context";

type GridProps = {
  handleDoubleClick: () => void;
  handleDataEntry: (e: React.ChangeEvent<HTMLInputElement>) => void;
  content: string | null;
  rawData: string | null;
  coOrdinates: `${number}-${number}`;
  clickedCells: SheetProps | undefined;
  customStyle?: CSSProperties;
};

function child({
  handleDoubleClick,
  handleDataEntry,
  content,
  rawData,
  coOrdinates,
  clickedCells,
  customStyle,
}: GridProps) {
  const { setSelectedCell } = useContext(UserContext)!;
  return (
    <>
      {clickedCells?.currentClickedCell === coOrdinates &&
      clickedCells.makeInputActive ? (
        <input
          className="grid-cell"
          style={customStyle}
          autoFocus={true}
          value={rawData ?? ""}
          onChange={handleDataEntry}
        />
      ) : (
        <div
          className="grid-cell"
          style={customStyle}
          onDoubleClick={() => {
            handleDoubleClick();
          }}
          onClick={() => {
            setSelectedCell(coOrdinates);
          }}
        >
          {content ?? ""}
        </div>
      )}
    </>
  );
}

export const Grid = React.memo(child, (prevProps, nextProps) => {
  if (
    // In the initial render (for any future requirement)
    prevProps.coOrdinates !== nextProps.coOrdinates ||
    // If the content has changed
    prevProps.content !== nextProps.content ||
    // If the raw data has changed
    prevProps.rawData !== nextProps.rawData ||
    // Need to re-render the component when a particular component was clicked and i need to remove it's input field
    nextProps.clickedCells?.prevClickedCell === nextProps.coOrdinates ||
    // Need to re-render the component when a particular component was clicked and i need to add it's input field
    nextProps.clickedCells?.currentClickedCell === nextProps.coOrdinates
  ) {
    return false;
  }

  return true;
});
