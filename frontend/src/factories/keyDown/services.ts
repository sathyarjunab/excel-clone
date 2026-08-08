import { Dispatch, MutableRefObject, SetStateAction } from "react";
import {
  cellMovementKeys,
  cellMovementKeysType,
  controlledKeys,
} from "../../constents";
import { typeComparer } from "../../util/sheet";
import { FourNodes, IUserInteraction } from "./interface";
import { SheetProps } from "../../components/sheet";

export class UserInteractionService implements IUserInteraction {
  constructor(
    public setFourNodes: Dispatch<SetStateAction<FourNodes | null>>,
    public setLoading: Dispatch<SetStateAction<boolean>>,
    public saveSheets: (setLoading: Dispatch<SetStateAction<boolean>>) => void,
    public saveTimer: MutableRefObject<NodeJS.Timeout | null>,
    public setClickedCells: Dispatch<SetStateAction<SheetProps | undefined>>,
  ) {}

  public handleKeyDown(keyDown: KeyboardEvent) {
    if (!controlledKeys.includes(keyDown.key)) {
      this.setClickedCells((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          makeInputActive: true,
        };
      });
      return;
    }
    if (
      typeComparer<cellMovementKeysType>(
        keyDown.key,
        cellMovementKeys.map((k) => k),
      )
    ) {
      this.setFourNodes((prev) => {
        if (!prev) return prev;
        if (!keyDown.shiftKey) {
          return this.handleArrowClicks(
            // since the narrowing is done in this context, we need to do "as cellMovementKeysType"
            keyDown.key as cellMovementKeysType,
            prev,
          );
        } else {
          return this.handleShiftArrowClicks(
            // since the narrowing is done in this context, we need to do "as cellMovementKeysType"
            keyDown.key as cellMovementKeysType,
            prev,
          );
        }
      });
    } else if (keyDown.key === "Enter") {
      if (this.saveTimer.current) clearTimeout(this.saveTimer.current);
      this.saveSheets(this.setLoading);
      this.setFourNodes((prev) => {
        if (!prev) return prev;
        return this.handleArrowClicks("ArrowDown", prev);
      });
    } else if (keyDown.key === "Tab") {
      keyDown.preventDefault();
      this.setFourNodes((prev) => {
        if (!prev) return prev;
        return this.handleArrowClicks("ArrowRight", prev);
      });
    }

    this.setClickedCells((prev) => {
      if (!prev || !prev.currentClickedCell) return prev;
      const [rowStr, colStr] = prev.currentClickedCell.split("-");
      return {
        prevClickedCell: prev.currentClickedCell,
        currentClickedCell: `${Number(rowStr) + 1}-${colStr}`,
        makeInputActive: false,
      };
    });
  }

  public handleShiftArrowClicks(
    key: "ArrowLeft" | "ArrowRight" | "ArrowUp" | "ArrowDown",
    fourNodes: FourNodes,
  ) {
    const [bottomRightX, bottomRightY] = fourNodes["bottomRight"].split("-");
    // In the bellow switch case it is confusing when the row or the column come backs to zero and go on reducing the value then the top node becomes the bottom node and the bottom node becomes the top node as per the naming convention.
    switch (key) {
      case "ArrowLeft":
      case "ArrowRight":
        const [topRightX, topRightY] = fourNodes["topRight"].split("-");
        const columnIncrementedValue =
          Number(topRightY) + ("ArrowRight" === key ? 1 : -1);
        if (columnIncrementedValue <= 0) return fourNodes;
        fourNodes = {
          ...fourNodes,
          topRight: `${topRightX}-${columnIncrementedValue}`,
          bottomRight: `${bottomRightX}-${columnIncrementedValue}`,
        };
        break;
      case "ArrowUp":
      case "ArrowDown":
        const [_bottomLeftX, bottomLeftY] = fourNodes["bottomLeft"].split("-");
        const rowIncrementor =
          Number(bottomRightX) + ("ArrowDown" === key ? 1 : -1);
        if (rowIncrementor <= 0) return fourNodes;
        fourNodes = {
          ...fourNodes,
          bottomLeft: `${rowIncrementor}-${bottomLeftY}`,
          bottomRight: `${rowIncrementor}-${bottomRightY}`,
        };
        break;
    }
    return fourNodes;
  }

  public handleArrowClicks(
    key: "ArrowLeft" | "ArrowRight" | "ArrowUp" | "ArrowDown",
    fourNodes: FourNodes,
  ) {
    const [activeCellX, activeCellY] = fourNodes["activeCell"].split("-");
    const rowChangingDirection =
      "ArrowDown" === key ? 1 : "ArrowUp" === key ? -1 : 0;
    const columnChangingDirection =
      "ArrowRight" === key ? 1 : "ArrowLeft" === key ? -1 : 0;

    fourNodes = {
      bottomLeft: `${Number(activeCellX) + rowChangingDirection}-${Number(activeCellY) + columnChangingDirection}`,
      bottomRight: `${Number(activeCellX) + rowChangingDirection}-${Number(activeCellY) + columnChangingDirection}`,
      topLeft: `${Number(activeCellX) + rowChangingDirection}-${Number(activeCellY) + columnChangingDirection}`,
      topRight: `${Number(activeCellX) + rowChangingDirection}-${Number(activeCellY) + columnChangingDirection}`,
      activeCell: `${Number(activeCellX) + rowChangingDirection}-${Number(activeCellY) + columnChangingDirection}`,
    };
    return fourNodes;
  }
}
