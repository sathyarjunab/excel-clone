import { Dispatch, MutableRefObject, SetStateAction } from "react";
import { cellMovementKeysType, movementWeightage } from "../constents";
import { stabilizeFourNode } from "../util/sheet";
import { SheetProps } from "../components/sheet";
import { clientSheet } from "../types/book";
import { FourNodes } from "../types/common";

// Everything a key handler might need. The factory below hands each handler
// only the specific pieces it uses, so the component owns the state/setters and
// we never rebuild a class instance when something changes.
export type KeyDownHandlerDeps = {
  setFourNodes: Dispatch<SetStateAction<FourNodes | null>>;
  setClickedCells: Dispatch<SetStateAction<SheetProps | undefined>>;
  setLoading: Dispatch<SetStateAction<boolean>>;
  saveSheets: (setLoading: Dispatch<SetStateAction<boolean>>) => void;
  setMoverCell: Dispatch<SetStateAction<`${string}-${string}` | null>>;
  saveTimer: MutableRefObject<NodeJS.Timeout | null>;
  sheetData: clientSheet;
  fourNodes: FourNodes | null;
  moverCell: `${string}-${string}` | null;
};

export type KeyDownHandler = (keyDown: KeyboardEvent) => void;

// Shared movement of the "clicked cell" by a fixed row/column offset.
function moveClickedCell(
  setClickedCells: Dispatch<SetStateAction<SheetProps | undefined>>,
  rowInc: number,
  colInc: number,
) {
  setClickedCells((prev) => {
    if (!prev || !prev.currentClickedCell) return prev;
    const [rowStr, colStr] = prev.currentClickedCell.split("-");
    return {
      prevClickedCell: prev.currentClickedCell,
      currentClickedCell: `${Number(rowStr) + rowInc}-${Number(colStr) + colInc}`,
      makeInputActive: false,
    };
  });
}

export function handleArrowClicks(
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

export function handleShiftArrowClicks(
  key: "ArrowLeft" | "ArrowRight" | "ArrowUp" | "ArrowDown",
  fourNodes: FourNodes,
) {
  const [bottomRightX, bottomRightY] = fourNodes["bottomRight"].split("-");
  // In the bellow switch case it is confusing when the row or the column come backs to zero and go on reducing the value then the top node becomes the bottom node and the bottom node becomes the top node as per the naming convention.
  switch (key) {
    case "ArrowLeft":
    case "ArrowRight":
      const [topRightX, topRightY] = fourNodes["topRight"].split("-");
      const columnIncrementedValue = Number(topRightY) + movementWeightage[key];
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
      const rowIncrementor = Number(bottomRightX) + movementWeightage[key];
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

export function handleCopy(
  fourNodes: FourNodes | null,
  sheetData: clientSheet,
): string {
  if (!fourNodes) return "";
  const stableFourNodes = stabilizeFourNode(fourNodes);
  let [row = 0, column = 0] = stableFourNodes.topLeft
    .split("-")
    .map((coOrd) => Number(coOrd));
  const [endRow, startColumn] = stableFourNodes.bottomLeft
    .split("-")
    .map((coOrd) => Number(coOrd));
  const [_startRow, endColumn] = stableFourNodes.topRight
    .split("-")
    .map((coOrd) => Number(coOrd));

  let rowLines = "";
  while (row <= endRow!) {
    while (column <= endColumn!) {
      const textContent = sheetData.cellData[`${row}-${column}`]?.content ?? "";
      rowLines += textContent + "\t";
      column++;
    }
    rowLines += "\n";
    row++;
    column = startColumn ?? 0;
  }
  return rowLines;
}

// ---- Per-key handlers: each takes only the pieces it needs, and each calls
// keyDown.preventDefault() itself. ----

export function handleArrowKey(
  keyDown: KeyboardEvent,
  key: cellMovementKeysType,
  setFourNodes: Dispatch<SetStateAction<FourNodes | null>>,
  setClickedCells: Dispatch<SetStateAction<SheetProps | undefined>>,
) {
  keyDown.preventDefault();
  setFourNodes((prev) => {
    if (!prev) return prev;
    return handleArrowClicks(key, prev);
  });

  const rowInc =
    key === "ArrowDown" || key === "ArrowUp" ? movementWeightage[key] : 0;
  const colInc =
    key === "ArrowLeft" || key === "ArrowRight" ? movementWeightage[key] : 0;
  moveClickedCell(setClickedCells, rowInc, colInc);
}

export function handleShiftArrowKey(
  keyDown: KeyboardEvent,
  key: cellMovementKeysType,
  setFourNodes: Dispatch<SetStateAction<FourNodes | null>>,
) {
  keyDown.preventDefault();
  setFourNodes((prev) => {
    if (!prev) return prev;
    return handleShiftArrowClicks(key, prev);
  });
}

export function handleEnter(
  keyDown: KeyboardEvent,
  deps: Pick<
    KeyDownHandlerDeps,
    | "saveTimer"
    | "saveSheets"
    | "setLoading"
    | "setFourNodes"
    | "setClickedCells"
  >,
) {
  keyDown.preventDefault();
  const { saveTimer, saveSheets, setLoading, setFourNodes, setClickedCells } =
    deps;
  if (saveTimer.current) clearTimeout(saveTimer.current);
  saveSheets(setLoading);
  setFourNodes((prev) => {
    if (!prev) return prev;
    return handleArrowClicks("ArrowDown", prev);
  });
  moveClickedCell(setClickedCells, 1, 0);
}

export function handleTab(
  keyDown: KeyboardEvent,
  setFourNodes: Dispatch<SetStateAction<FourNodes | null>>,
  setClickedCells: Dispatch<SetStateAction<SheetProps | undefined>>,
) {
  keyDown.preventDefault();
  setFourNodes((prev) => {
    if (!prev) return prev;
    return handleArrowClicks("ArrowRight", prev);
  });
  moveClickedCell(setClickedCells, 0, 1);
}

export async function handleCopyKey(
  keyDown: KeyboardEvent,
  fourNodes: FourNodes | null,
  sheetData: clientSheet,
) {
  keyDown.preventDefault();
  const copyText = handleCopy(fourNodes, sheetData);
  await navigator.clipboard.writeText(copyText);
}

// Builds the key -> handler map. Keys are exactly what keyDownConvertor emits.
export function createKeyDownHandlerMap(
  deps: KeyDownHandlerDeps,
): Record<string, KeyDownHandler> {
  const {
    setFourNodes,
    setClickedCells,
    setLoading,
    saveSheets,
    saveTimer,
    sheetData,
    fourNodes,
  } = deps;

  return {
    ArrowUp: (keyDown) =>
      handleArrowKey(keyDown, "ArrowUp", setFourNodes, setClickedCells),
    ArrowDown: (keyDown) =>
      handleArrowKey(keyDown, "ArrowDown", setFourNodes, setClickedCells),
    ArrowLeft: (keyDown) =>
      handleArrowKey(keyDown, "ArrowLeft", setFourNodes, setClickedCells),
    ArrowRight: (keyDown) =>
      handleArrowKey(keyDown, "ArrowRight", setFourNodes, setClickedCells),
    "shift-ArrowUp": (keyDown) =>
      handleShiftArrowKey(keyDown, "ArrowUp", setFourNodes),
    "shift-ArrowDown": (keyDown) =>
      handleShiftArrowKey(keyDown, "ArrowDown", setFourNodes),
    "shift-ArrowLeft": (keyDown) =>
      handleShiftArrowKey(keyDown, "ArrowLeft", setFourNodes),
    "shift-ArrowRight": (keyDown) =>
      handleShiftArrowKey(keyDown, "ArrowRight", setFourNodes),
    Enter: (keyDown) =>
      handleEnter(keyDown, {
        saveTimer,
        saveSheets,
        setLoading,
        setFourNodes,
        setClickedCells,
      }),
    Tab: (keyDown) => handleTab(keyDown, setFourNodes, setClickedCells),
    "ctrl-c": (keyDown) => {
      void handleCopyKey(keyDown, fourNodes, sheetData);
    },
  };
}
