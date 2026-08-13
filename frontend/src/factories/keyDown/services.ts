import { Dispatch, MutableRefObject, SetStateAction } from 'react';
import {
  cellMovementKeys,
  cellMovementKeysType,
  controlledKeys,
  movementWeightage,
} from '../../constents';
import { stabaliseFourNode, typeComparer } from '../../util/sheet';
import { FourNodes, IUserInteraction } from './interface';
import { SheetProps } from '../../components/sheet';
import { clientSheet } from '../../types/book';

export class UserInteractionService implements IUserInteraction {
  constructor(
    public setFourNodes: Dispatch<SetStateAction<FourNodes | null>>,
    public setLoading: Dispatch<SetStateAction<boolean>>,
    public saveSheets: (setLoading: Dispatch<SetStateAction<boolean>>) => void,
    public saveTimer: MutableRefObject<NodeJS.Timeout | null>,
    public setClickedCells: Dispatch<SetStateAction<SheetProps | undefined>>,
    public sheetData: clientSheet,
    public fourNodes: FourNodes | null,
  ) {}

  public async handleKeyDown(keyDown: KeyboardEvent) {
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
    keyDown.preventDefault();

    let colMover = 0;
    let rowMover = 0;

    const key = keyDown.key;

    if (
      typeComparer<cellMovementKeysType>(
        key,
        cellMovementKeys.map((k) => k),
      )
    ) {
      this.setFourNodes((prev) => {
        if (!prev) return prev;
        if (!keyDown.shiftKey) {
          return this.handleArrowClicks(
            // since the narrowing is done in this context, we need to do "as cellMovementKeysType"
            key as cellMovementKeysType,
            prev,
          );
        } else {
          return this.handleShiftArrowClicks(
            // since the narrowing is done in this context, we need to do "as cellMovementKeysType"
            key as cellMovementKeysType,
            prev,
          );
        }
      });

      this.setClickedCells((prev) => {
        if (!prev || !prev.currentClickedCell) return prev;

        let rowInc = 0;
        let colInc = 0;

        if (key === 'ArrowDown' || key === 'ArrowUp') {
          rowInc = movementWeightage[key];
        } else {
          colInc = movementWeightage[key];
        }

        const [row, col] = prev.currentClickedCell.split('-');

        return {
          prevClickedCell: prev.currentClickedCell,
          currentClickedCell: `${Number(row) + rowInc}-${Number(col) + colInc}`,
          makeInputActive: false,
        };
      });
    } else if (key === 'Enter') {
      if (this.saveTimer.current) clearTimeout(this.saveTimer.current);
      this.saveSheets(this.setLoading);
      this.setFourNodes((prev) => {
        if (!prev) return prev;
        return this.handleArrowClicks('ArrowDown', prev);
      });
      rowMover += 1;
    } else if (key === 'Tab') {
      this.setFourNodes((prev) => {
        if (!prev) return prev;
        return this.handleArrowClicks('ArrowRight', prev);
      });
      colMover += 1;
    } else if (keyDown.ctrlKey && key === 'c') {
      const copyText = this.handleCopy();
      await navigator.clipboard.writeText(copyText);
    }

    if (rowMover === 0 && colMover === 0) return;
    this.setClickedCells((prev) => {
      if (!prev || !prev.currentClickedCell) return prev;
      const [rowStr, colStr] = prev.currentClickedCell.split('-');
      return {
        prevClickedCell: prev.currentClickedCell,
        currentClickedCell: `${Number(rowStr) + rowMover}-${Number(colStr) + colMover}`,
        makeInputActive: false,
      };
    });
  }

  public handleShiftArrowClicks(
    key: 'ArrowLeft' | 'ArrowRight' | 'ArrowUp' | 'ArrowDown',
    fourNodes: FourNodes,
  ) {
    const [bottomRightX, bottomRightY] = fourNodes['bottomRight'].split('-');
    // In the bellow switch case it is confusing when the row or the column come backs to zero and go on reducing the value then the top node becomes the bottom node and the bottom node becomes the top node as per the naming convention.
    switch (key) {
      case 'ArrowLeft':
      case 'ArrowRight':
        const [topRightX, topRightY] = fourNodes['topRight'].split('-');
        const columnIncrementedValue =
          Number(topRightY) + movementWeightage[key];
        if (columnIncrementedValue <= 0) return fourNodes;
        fourNodes = {
          ...fourNodes,
          topRight: `${topRightX}-${columnIncrementedValue}`,
          bottomRight: `${bottomRightX}-${columnIncrementedValue}`,
        };
        break;
      case 'ArrowUp':
      case 'ArrowDown':
        const [_bottomLeftX, bottomLeftY] = fourNodes['bottomLeft'].split('-');
        const rowIncrementor = Number(bottomRightX) + movementWeightage[key];
        if (rowIncrementor <= 0) return fourNodes;
        fourNodes = {
          ...fourNodes,
          bottomLeft: `${rowIncrementor}-${bottomLeftY}`,
          bottomRight: `${rowIncrementor}-${bottomRightY}`,
        };
        break;
    }
    return stabaliseFourNode(fourNodes);
  }

  public handleArrowClicks(
    key: 'ArrowLeft' | 'ArrowRight' | 'ArrowUp' | 'ArrowDown',
    fourNodes: FourNodes,
  ) {
    const [activeCellX, activeCellY] = fourNodes['activeCell'].split('-');
    const rowChangingDirection =
      'ArrowDown' === key ? 1 : 'ArrowUp' === key ? -1 : 0;
    const columnChangingDirection =
      'ArrowRight' === key ? 1 : 'ArrowLeft' === key ? -1 : 0;

    fourNodes = {
      bottomLeft: `${Number(activeCellX) + rowChangingDirection}-${Number(activeCellY) + columnChangingDirection}`,
      bottomRight: `${Number(activeCellX) + rowChangingDirection}-${Number(activeCellY) + columnChangingDirection}`,
      topLeft: `${Number(activeCellX) + rowChangingDirection}-${Number(activeCellY) + columnChangingDirection}`,
      topRight: `${Number(activeCellX) + rowChangingDirection}-${Number(activeCellY) + columnChangingDirection}`,
      activeCell: `${Number(activeCellX) + rowChangingDirection}-${Number(activeCellY) + columnChangingDirection}`,
    };
    return stabaliseFourNode(fourNodes);
  }

  public handleCopy(): string {
    if (!this.fourNodes) return '';
    let [row, column] = this.fourNodes.topLeft
      .split('-')
      .map((coOrd) => Number(coOrd));
    const [endRow] = this.fourNodes.bottomLeft
      .split('-')
      .map((coOrd) => Number(coOrd));
    const [_startRow, endColumn] = this.fourNodes.topRight
      .split('-')
      .map((coOrd) => Number(coOrd));

    let rowLines = '';
    column = column ?? 0;
    row = row ?? 0;
    while (row !== endRow) {
      while (column !== endColumn) {
        const textContent =
          this.sheetData.cellData[`${row}-${column}`]?.content ?? '';
        rowLines += textContent + '\t';
        column++;
      }
      rowLines += '\n';
      row++;
      column = 0;
    }
    return rowLines;
  }
}
