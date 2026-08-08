export type FourNodes = {
  topLeft: `${string}-${string}`;
  bottomLeft: `${string}-${string}`;
  topRight: `${string}-${string}`;
  bottomRight: `${string}-${string}`;
  activeCell: `${string}-${string}`;
};

type RemoveFirstParameter<F> = F extends (
  first: any,
  ...rest: infer R
) => infer Ret
  ? (...args: R) => Ret
  : never;

export type keyDownHandelingFunctions =
  | RemoveFirstParameter<IUserInteraction["handleArrowClicks"]>
  | RemoveFirstParameter<IUserInteraction["handleShiftArrowClicks"]>
  | (() => void);

export interface IUserInteraction {
  handleKeyDown(keyDown: KeyboardEvent, callBackeFunction: () => {}): void;
  handleShiftArrowClicks(
    key: "ArrowLeft" | "ArrowRight" | "ArrowUp" | "ArrowDown",
    fourNodes: FourNodes,
  ): FourNodes;
  handleArrowClicks(
    key: "ArrowLeft" | "ArrowRight" | "ArrowUp" | "ArrowDown",
    fourNodes: FourNodes,
  ): FourNodes;
}
