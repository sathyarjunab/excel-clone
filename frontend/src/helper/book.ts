import { Workbook } from "../types/book";

export const alphabets = [
  "",
  "A",
  "B",
  "C",
  "D",
  "E",
  "F",
  "G",
  "H",
  "I",
  "J",
  "K",
  "L",
  "M",
  "N",
  "O",
  "P",
  "Q",
  "R",
  "S",
  "T",
  "U",
  "V",
  "W",
  "X",
  "Y",
  "Z",
];

export const defaultBook: Workbook = {
  bookName: "sheet",
  sheets: [
    {
      cells: {},
      hasChanged: false,
      id: 0,
      name: "Sheet 1",
      dirtyCells: {},
    },
  ],
};
