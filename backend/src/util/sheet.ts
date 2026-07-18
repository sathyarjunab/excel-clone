import { MAXCOLUMN, MAXROWS } from "./fixedConstents.js";

export function rowsColConvertor(coOrdinates: string): [number, number] {
  let result = coOrdinates.split("-");
  if (result.length !== 2) throw Error("Invalid cell coOrdinates");

  result = result.filter((s) => !isNaN(Number(s)));
  if (result.length !== 2) throw Error("coOrdinates are not numbers");

  return [Number(result[0]), Number(result[1])];
}

export function rangeCalculator(rows: number, col: number) {
  const rowRange = Math.max(Math.ceil(rows / MAXROWS), 1) * MAXROWS;
  const colRange = Math.max(Math.ceil(col / MAXCOLUMN), 1) * MAXCOLUMN;

  return `${rowRange}-${colRange}`;
}
