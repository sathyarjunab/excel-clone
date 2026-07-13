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
  name: "Untitled Workbook",
  activeSheetIndx: 1,
  sheets: [
    {
      data: {},
      hasChanged: false,
      id: 1,
      name: "Sheet 1",
    },
  ],
};
