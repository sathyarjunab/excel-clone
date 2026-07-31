import { MAXCOLUMN, MAXROWS } from "./fixedConstents.js";

export function rowsColConvertor(coOrdinates: string): [number, number] {
  let result = coOrdinates.split("-");
  if (result.length !== 2) throw Error("Invalid cell coOrdinates");

  result = result.filter((s) => !isNaN(Number(s)));
  if (result.length !== 2) throw Error("coOrdinates are not numbers");

  return [Number(result[0]), Number(result[1])];
}

export function rangeGetter(rows: number, col: number) {
  const rowRange = Math.max(Math.ceil(rows / MAXROWS), 1) * MAXROWS;
  const colRange = Math.max(Math.ceil(col / MAXCOLUMN), 1) * MAXCOLUMN;

  return `${rowRange}-${colRange}`;
}

export function rangeCalculator(
  startRow: number,
  endRow: number,
  startCol: number,
  endCol: number,
): string[] {
  const range1 = rangeGetter(startRow, startCol);
  const range2 = rangeGetter(endRow, endCol);
  return range1 === range2 ? [range1] : [range1, range2];
}
