import { FourNodes, IUserInteraction } from "./interface";

export class UserInteractionService implements IUserInteraction {
  private handleShiftArrowClicks(
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

  private handleArrowClicks(
    key: "ArrowLeft" | "ArrowRight" | "ArrowUp" | "ArrowDown",
    fourNodes: FourNodes,
  ): FourNodes {
    const [activeCellX, activeCellY] = fourNodes["activeCell"].split("-");
    const rowChangingDirection =
      "ArrowDown" === key ? 1 : "ArrowUp" === key ? -1 : 0;
    const columnChangingDirection =
      "ArrowRight" === key ? 1 : "ArrowLeft" === key ? -1 : 0;

    return {
      bottomLeft: `${Number(activeCellX) + rowChangingDirection}-${Number(activeCellY) + columnChangingDirection}`,
      bottomRight: `${Number(activeCellX) + rowChangingDirection}-${Number(activeCellY) + columnChangingDirection}`,
      topLeft: `${Number(activeCellX) + rowChangingDirection}-${Number(activeCellY) + columnChangingDirection}`,
      topRight: `${Number(activeCellX) + rowChangingDirection}-${Number(activeCellY) + columnChangingDirection}`,
      activeCell: `${Number(activeCellX) + rowChangingDirection}-${Number(activeCellY) + columnChangingDirection}`,
    };
  }
}
