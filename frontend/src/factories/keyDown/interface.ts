export type FourNodes = {
  topLeft: `${string}-${string}`;
  bottomLeft: `${string}-${string}`;
  topRight: `${string}-${string}`;
  bottomRight: `${string}-${string}`;
};

export interface IUserInteraction {
  // handleKeyDown(keyDown: KeyboardEvents): IUserInteraction["handleArrowClicks"];
  handleArrowClicks(
    keyDown: "ArrowLeft" | "ArrowRight" | "ArrowUp" | "ArrowDown",
    fourPoints: FourNodes,
  ): FourNodes;
}
