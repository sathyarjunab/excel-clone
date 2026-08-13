import { ALPHABETS, X_MAX_RANGE, Y_MAX_RANGE } from "../constents";
import { FourNodes } from "../factories/keyDown/interface";

export function numberToAlphabet(num: number, result: string): string {
  if (!num || num <= 0) return "";
  const rem = ((num - 1) % 26) + 1;
  const quo = Math.floor((num - 1) / 26);
  const res = quo > 0 ? numberToAlphabet(quo, result) : "";
  return (result += res + ALPHABETS[rem]);
}
export function rangeConvertor(
  row: number,
  col: number,
): `${string}-${string}` {
  // Snap the cell to the top-left corner of its chunk. Rows use the row range
  // and cols use the col range so the two can diverge without corrupting keys.
  const rowRange = Math.max(Math.ceil(row / X_MAX_RANGE), 1) * X_MAX_RANGE;
  const colRange = Math.max(Math.ceil(col / Y_MAX_RANGE), 1) * Y_MAX_RANGE;
  return `${rowRange}-${colRange}`;
}

export function typeComparer<T>(key: any, values: string[]): key is T {
  if (typeof key !== "string") return false;
  return values.includes(key);
}

export function stabaliseFourNode(fourNodes: FourNodes): FourNodes {
  const [p1x, p1y] = fourNodes.topLeft.split("-").map(Number);
  const [p2x, p2y] = fourNodes.topRight.split("-").map(Number);
  const [p3x, p3y] = fourNodes.bottomLeft.split("-").map(Number);
  const [p4x, p4y] = fourNodes.bottomRight.split("-").map(Number);

  const minX = Math.min(p1x!, p2x!, p3x!, p4x!);
  const maxX = Math.max(p1x!, p2x!, p3x!, p4x!);
  const minY = Math.min(p1y!, p2y!, p3y!, p4y!);
  const maxY = Math.max(p1y!, p2y!, p3y!, p4y!);

  return {
    activeCell: fourNodes.activeCell,
    topLeft: `${minX}-${minY}`,
    topRight: `${minX}-${maxY}`,
    bottomLeft: `${maxX}-${minY}`,
    bottomRight: `${maxX}-${maxY}`,
  };
}
