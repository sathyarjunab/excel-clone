import { alphabets } from "../helper/book";

export function numberToAlphabet(num: number, result: string): string {
  if (!num || num <= 0) return "";
  const rem = ((num - 1) % 26) + 1;
  const quo = Math.floor((num - 1) / 26);
  const res = quo > 0 ? numberToAlphabet(quo, result) : "";
  return (result += res + alphabets[rem]);
}
