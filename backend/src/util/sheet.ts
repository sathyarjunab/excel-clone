import { ALPHABETS, alphabetsMapping } from "../constents.js";
import { MAXCOLUMN, MAXROWS } from "./fixedConstents.js";

const ALPHANUMERIC = /^([A-Za-z]+)(\d+)$/;
type RowColumn = {
  row: number;
  column: number;
};

/**
 * Concerts the co-ordinates that is in the form of string-string to rows and column
 * @param coOrdinates
 * @returns
 */
export function rowsColConvertor(coOrdinates: string): RowColumn {
  let result = coOrdinates.split("-");
  if (result.length !== 2) throw Error("Invalid cell coOrdinates");

  result = result.filter((s) => !isNaN(Number(s)));
  if (result.length !== 2) throw Error("coOrdinates are not numbers");

  return { row: Number(result[0]), column: Number(result[1]) };
}

/**
 * This returns the exact range at which the particular co-ordinate exists
 * @param rows
 * @param col
 * @returns
 */
export function rangeGetter(coOrdinates: RowColumn) {
  const rowRange = Math.max(Math.ceil(coOrdinates.row / MAXROWS), 1) * MAXROWS;
  const colRange =
    Math.max(Math.ceil(coOrdinates.column / MAXCOLUMN), 1) * MAXCOLUMN;

  return `${rowRange}-${colRange}`;
}

/**
 * converts the alpha numeric numbers in the form of A1 to rows and column
 * @param coOrdinates
 * @returns
 */

export function alphaNumericConvertor(coOrdinates: string[]): RowColumn[] {
  const rowColumn: { row: number; column: number }[] = [];
  for (const coOrd of coOrdinates) {
    const match = coOrd.match(ALPHANUMERIC);
    if (!match) continue;
    // Internal keys are row-col, but A1 is column-letter + row-number: the
    // digits (match[2]) are the row and the letters (match[1]) are the column.
    const formedString = `${match[2]}-${columnToNumber(match[1] ?? "")}`;
    rowColumn.push(rowsColConvertor(formedString));
  }
  return rowColumn;
}

export function rangeCalculator(
  startRow: number,
  endRow: number,
  startCol: number,
  endCol: number,
): string[] {
  const range1 = rangeGetter({
    row: startRow,
    column: startCol,
  });
  const range2 = rangeGetter({
    row: endRow,
    column: endCol,
  });
  return range1 === range2 ? [range1] : [range1, range2];
}

export function numberToAlphabet(num: number, result: string = ""): string {
  if (!num || num <= 0) return "";
  const rem = ((num - 1) % 26) + 1;
  const quo = Math.floor((num - 1) / 26);
  const res = quo > 0 ? numberToAlphabet(quo, result) : "";
  return (result += res + ALPHABETS[rem]);
}

function columnToNumber(column: string): number {
  let result = 0;

  for (const char of column.toUpperCase()) {
    result = result * 26 + (char.charCodeAt(0) - "A".charCodeAt(0) + 1);
  }

  return result;
}

export function coOrdinateToAlphaNumeric(coOrdinate: `${number}-${number}`) {
  const splitValues = coOrdinate.split("-");
  // Input is row-col; A1 is column-letter + row-number, so the letter comes from
  // the column (splitValues[1]) and the row number (splitValues[0]) trails it.
  return `${numberToAlphabet(Number(splitValues[1]))}${splitValues[0]}`;
}
