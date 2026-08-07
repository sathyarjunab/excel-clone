export type FourNodes = {
  topLeft: `${string}-${string}`;
  bottomLeft: `${string}-${string}`;
  topRight: `${string}-${string}`;
  bottomRight: `${string}-${string}`;
  activeCell: `${string}-${string}`;
};

export interface IUserInteraction {
  // handleKeyDown(keyDown: KeyboardEvents): IUserInteraction["handleArrowClicks"];
  handleShiftArrowClicks(
    key: "ArrowLeft" | "ArrowRight" | "ArrowUp" | "ArrowDown",
    fourNodes: FourNodes,
  ): FourNodes;
  handleArrowClicks(
    key: "ArrowLeft" | "ArrowRight" | "ArrowUp" | "ArrowDown",
    fourNodes: FourNodes,
  ): FourNodes;
}
