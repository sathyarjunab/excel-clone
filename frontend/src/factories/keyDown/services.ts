import { FourNodes, IUserInteraction } from "./interface";

export class UserInteractionService implements IUserInteraction {
  // handleKeyDown = (keyDown: string) => {
  //   if (
  //     typeComparer<cellMovementKeysType>(
  //       keyDown,
  //       cellMovementKeys.map((k) => k),
  //     )
  //   ) {
  //     return this.handleArrowClicks.bind(keyDown);
  //   }
  //   return () => {};
  // };
  handleArrowClicks(
    key: "ArrowLeft" | "ArrowRight" | "ArrowUp" | "ArrowDown",
    fourNodes: FourNodes,
  ) {
    // In the bellow switch case it is confusing when the row or the column come backs to zero and go on reducing the value then the top node becomes the bottom node and the bottom node becomes the top node as per the naming convention.
    switch (key) {
      case "ArrowLeft":
      case "ArrowRight":
        const [topRightX, topRightY] = fourNodes["topRight"].split("-");
        const [bottomLeftX] = fourNodes["bottomRight"].split("-");
        const columnIncrementedValue =
          Number(topRightY) + ("ArrowRight" === key ? 1 : -1);
        if (columnIncrementedValue < 0) return fourNodes;
        fourNodes = {
          ...fourNodes,
          topRight: `${topRightX}-${columnIncrementedValue}`,
          bottomRight: `${bottomLeftX}-${columnIncrementedValue}`,
        };
        break;
      case "ArrowUp":
      case "ArrowDown":
        const [_bottomLeftX, bottomLeftY] = fourNodes["bottomLeft"].split("-");
        const [bottomRightX, bottomRightY] =
          fourNodes["bottomRight"].split("-");
        const rowIncrementor =
          Number(bottomRightX) + ("ArrowDown" === key ? 1 : -1);
        if (rowIncrementor < 0) return fourNodes;
        fourNodes = {
          ...fourNodes,
          bottomLeft: `${rowIncrementor}-${bottomLeftY}`,
          bottomRight: `${rowIncrementor}-${bottomRightY}`,
        };
        break;
    }
    return fourNodes;
  }
}
