import { X_MAX_RANGE } from "../constents";
import { alphabets } from "../helper/book";

export function numberToAlphabet(num: number, result: string): string {
  if (!num || num <= 0) return "";
  const rem = ((num - 1) % 26) + 1;
  const quo = Math.floor((num - 1) / 26);
  const res = quo > 0 ? numberToAlphabet(quo, result) : "";
  return (result += res + alphabets[rem]);
}
export function rangeConvertor(row: number, col: number): string {
  const rowRange = Math.max(Math.ceil(row / X_MAX_RANGE), 1) * 500;
  const colRange = Math.max(Math.ceil(col / X_MAX_RANGE), 1) * 500;
  return `${rowRange}-${colRange}`;
}
