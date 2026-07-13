import React, { CSSProperties } from "react";
import "./../scss/sheet.scss";
import { SheetProps } from "./sheet";

function child({
  value,
  customStyle,
  handleDoubleClick,
  clickedCells,
  coOrdinates,
}: {
  value: string;
  handleDoubleClick: () => void;
  coOrdinates: string;
  clickedCells: SheetProps | undefined;
  customStyle?: CSSProperties;
}) {
  return (
    <>
      {clickedCells?.currentClickedCell === coOrdinates ? (
        <input
          className="grid-cell"
          style={customStyle}
          autoFocus={true}
          defaultValue={value}
        />
      ) : (
        <div
          className="grid-cell"
          style={customStyle}
          onDoubleClick={() => {
            handleDoubleClick();
          }}
        >
          {value}
        </div>
      )}
    </>
  );
}

export const Grid = React.memo(child, (prevProps, nextProps) => {
  if (
    // In the initial render (for any future requirement)
    prevProps.coOrdinates !== nextProps.coOrdinates ||
    // If the value has changed
    prevProps.value !== nextProps.value ||
    // Need to re-render the component when a particular component was clicked and i need to remove it's input field
    nextProps.clickedCells?.prevClickedCell === nextProps.coOrdinates ||
    // Need to re-render the component when a particular component was clicked and i need to add it's input field
    nextProps.clickedCells?.currentClickedCell === nextProps.coOrdinates
  ) {
    return false;
  }

  return true;
});
