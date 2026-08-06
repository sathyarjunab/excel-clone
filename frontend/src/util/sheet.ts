import { ALPHABETS, X_MAX_RANGE, Y_MAX_RANGE } from "../constents";

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
