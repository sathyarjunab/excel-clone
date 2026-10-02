import { arithmeticTokens } from "../constents";
import { numberToAlphabet } from "../util/sheet";

type ExcelFunctionsType = "SUM" | "AVERAGE" | "MIN" | "MAX" | "IF";
// IF is handled specially (it short-circuits), so it is not one of the plain
// aggregate functions that just take a list of already-evaluated numbers.
type AggregateFunctionType = Exclude<ExcelFunctionsType, "IF">;
type arithmeticOperationType = "+" | "-" | "*" | "/";
type comparisonOperationType = ">" | "<" | "=";

enum ExcelFunctions {
  SUM = "SUM",
  AVERAGE = "AVERAGE",
  MIN = "MIN",
  MAX = "MAX",
  IF = "IF",
}

enum ArithmeticOperation {
  "+" = "+",
  "-" = "-",
  "*" = "*",
  "/" = "/",
}

const excelFunctions: Record<
  AggregateFunctionType,
  (args: (number | null)[]) => number
> = {
  SUM: sum,
  AVERAGE: average,
  MIN: min,
  MAX: max,
};

function isHandledFunction(
  functionName: string,
): functionName is ExcelFunctionsType {
  return (Object.values(ExcelFunctions) as string[]).includes(functionName);
}

function isArithmeticOperation(
  operation: string,
): operation is arithmeticOperationType {
  return (Object.values(ArithmeticOperation) as string[]).includes(operation);
}

function isComparisonOperation(
  operation: string,
): operation is comparisonOperationType {
  return operation === ">" || operation === "<" || operation === "=";
}

export function isFormula(value: string): boolean {
  return value[0] === "=";
}

// Single-character tokens the tokenizer emits on their own. ":" is added on top
// of the arithmetic set so ranges (A1:B3) split into ref, ":", ref instead of
// being swallowed into one identifier.
const separators = [...arithmeticTokens, ":"];

export function tokenize(equation: string): string[] {
  const tokenizedResult: string[] = [];
  const body = equation.slice(1);
  let i = 0;

  // Invariant: every branch consumes at least one character (i always advances),
  // so an unrecognized character can never spin this loop forever.
  while (i < body.length) {
    const char = body[i]!;

    // Whitespace is a separator, not part of a token — skip it.
    if (/\s/.test(char)) {
      i++;
      continue;
    }

    // Number: a run of digits, optionally with a decimal point (".5" too).
    if (
      /[0-9]/.test(char) ||
      (char === "." && /[0-9]/.test(body[i + 1] ?? ""))
    ) {
      let val = "";
      while (i < body.length && /[0-9.]/.test(body[i]!)) {
        val += body[i];
        i++;
      }
      tokenizedResult.push(val);
      continue;
    }

    // Operator / paren / comma / colon — each is its own single-char token.
    if (separators.includes(char)) {
      tokenizedResult.push(char);
      i++;
      continue;
    }

    // Identifier: a cell ref (A1) or function name (SUM) — a letter followed by
    // letters/digits. Stops at any non-alphanumeric, so ":" ends it cleanly.
    if (/[a-zA-Z]/.test(char)) {
      let val = "";
      while (i < body.length && /[a-zA-Z0-9]/.test(body[i]!)) {
        val += body[i];
        i++;
      }
      tokenizedResult.push(val);
      continue;
    }

    // Anything else (e.g. "$", stray punctuation): emit it as its own token and
    // advance, so the loop always makes progress. The parser can reject it.
    tokenizedResult.push(char);
    i++;
  }

  return tokenizedResult;
}

export function isNumber(value: string): boolean {
  return !isNaN(Number(value));
}

export function isFunction(value: string): boolean {
  return (
    value === "SUM" ||
    value === "AVERAGE" ||
    value === "MIN" ||
    value === "MAX" ||
    value === "IF"
  );
}

export function isRef(value: string): boolean {
  return /^[A-Z]+[0-9]+$/i.test(value);
}

// The tree shapes the parser produces. The evaluator (next phase) will switch
// on `type`. Every node is just a plain tagged object.
export type ASTNode =
  | { type: "number"; value: number }
  | { type: "ref"; ref: string }
  | { type: "range"; start: string; end: string }
  | { type: "unary"; op: "-" | "+"; operand: ASTNode }
  | {
      type: "binary";
      op: arithmeticOperationType | comparisonOperationType;
      left: ASTNode;
      right: ASTNode;
    }
  | { type: "call"; name: ExcelFunctionsType; args: ASTNode[] }
  | null;

// Operators grouped by precedence level. Comparison is loosest, mul/div tightest.
const COMPARISON_OPS = [">", "<", "="];
const ADD_OPS = ["+", "-"];
const MUL_OPS = ["*", "/"];

// Turns the flat token list into an AST. Throws on malformed input; the caller
// catches and shows an error value.
export function parse(tokens: string[]): ASTNode {
  // The only mutable state: a cursor into the token array. Every helper below
  // reads/advances it — this is what replaces a manual stack.
  let pos = 0;
  const peek = (): string | undefined => tokens[pos];
  const next = (): string => tokens[pos++]!;
  const expect = (token: string): string => {
    if (peek() !== token) {
      throw new Error(
        `Expected "${token}" but found "${peek() ?? "end of formula"}"`,
      );
    }
    return next();
  };

  // --- The precedence ladder. Each level parses ONE thing from the level below,
  // then loops while it sees its own operator, nesting the running result into a
  // new binary node. `left` always holds "everything so far" as a tree. ---

  function parseExpression(): ASTNode {
    return parseComparison();
  }

  function parseComparison(): ASTNode {
    let left = parseAddSub();
    while (peek() !== undefined && COMPARISON_OPS.includes(peek()!)) {
      const op = next();
      const right = parseAddSub();
      if (!isComparisonOperation(op)) {
        throw new Error(`Unknown operator ${op}`);
      }
      left = { type: "binary", op, left, right };
    }
    return left;
  }

  function parseAddSub(): ASTNode {
    let left = parseMulDiv();
    while (peek() !== undefined && ADD_OPS.includes(peek()!)) {
      const op = next();
      const right = parseMulDiv();
      if (!isArithmeticOperation(op)) {
        throw new Error(`Unknown operator ${op}`);
      }
      left = { type: "binary", op, left, right };
    }
    return left;
  }

  function parseMulDiv(): ASTNode {
    let left = parseUnary();
    while (peek() !== undefined && MUL_OPS.includes(peek()!)) {
      const op = next();
      const right = parseUnary();
      if (!isArithmeticOperation(op)) {
        throw new Error(`Unknown operator ${op}`);
      }
      left = { type: "binary", op, left, right };
    }
    return left;
  }

  // A leading "-" (or "+"): -A1, -5. Calls itself so "--5" works too.
  function parseUnary(): ASTNode {
    if (peek() === "-" || peek() === "+") {
      const op = next();
      if (!["-", "+"].includes(op)) throw new Error(`Unknown operator ${op}`);
      return {
        type: "unary",
        op: op as "-" | "+",
        operand: parseUnary(),
      };
    }
    return parsePrimary();
  }

  // The bottom of the ladder: a number, a ref/range, a function call, or a
  // bracketed sub-expression (which restarts the whole ladder).
  function parsePrimary(): ASTNode {
    const token = peek();
    if (token === undefined) {
      throw new Error("Unexpected end of formula");
    }

    if (token === "(") {
      next();
      const node = parseExpression();
      expect(")");
      return node;
    }

    if (isFunction(token)) {
      return parseCall();
    }

    if (isNumber(token)) {
      next();
      return { type: "number", value: Number(token) };
    }

    if (isRef(token)) {
      next();
      // A ":" right after a ref makes it a range (A1:B3).
      if (peek() === ":") {
        next();
        const end = peek();
        if (end === undefined || !isRef(end)) {
          throw new Error(
            `Expected a cell after ":" but found "${end ?? "end of formula"}"`,
          );
        }
        next();
        return { type: "range", start: token, end };
      }
      return { type: "ref", ref: token };
    }

    throw new Error(`Unexpected token "${token}"`);
  }

  // name "(" arg , arg , ... ")". Each arg is a full expression, which is why
  // nesting like IF(A1>10, SUM(B1:B3), C1*2) works with no special-casing.
  function parseCall(): ASTNode {
    const name = next();
    expect("(");
    const args: ASTNode[] = [];
    if (peek() !== ")") {
      args.push(parseExpression());
      while (peek() === ",") {
        next();
        args.push(parseExpression());
      }
    }
    expect(")");
    if (!isHandledFunction(name)) {
      throw new Error(`Function ${name} is not supported`);
    }
    return { type: "call", name, args };
  }

  const ast = parseExpression();
  // If tokens remain, the formula was malformed (e.g. "=1 2").
  if (pos < tokens.length) {
    throw new Error(`Unexpected token "${peek()}" after end of formula`);
  }
  return ast;
}

// ---- A1 <-> coordinate helpers (the inverse of numberToAlphabet). A1 is
// column-letter + row-number; these drive range expansion and ref collection. ----

const A1_PATTERN = /^([A-Za-z]+)([0-9]+)$/;

// "E" -> 5, "AA" -> 27 (bijective base-26 decode).
function columnToNumber(column: string): number {
  let result = 0;
  for (const char of column.toUpperCase()) {
    result = result * 26 + (char.charCodeAt(0) - "A".charCodeAt(0) + 1);
  }
  return result;
}

function parseRef(ref: string): { col: number; row: number } {
  const match = ref.match(A1_PATTERN);
  if (!match) throw new Error("#REF!");
  return { col: columnToNumber(match[1]!), row: Number(match[2]) };
}

// Expands "A1".."B3" into every A1 key it covers, normalised to upper case.
// Endpoints may be given in any corner order, so min/max each axis.
function expandRange(start: string, end: string): string[] {
  const a = parseRef(start);
  const b = parseRef(end);
  const minCol = Math.min(a.col, b.col);
  const maxCol = Math.max(a.col, b.col);
  const minRow = Math.min(a.row, b.row);
  const maxRow = Math.max(a.row, b.row);

  const cells: string[] = [];
  for (let row = minRow; row <= maxRow; row++) {
    for (let col = minCol; col <= maxCol; col++) {
      cells.push(`${numberToAlphabet(col, "")}${row}`);
    }
  }
  return cells;
}

// Walks the AST once and collects every cell the formula reads, expanding each
// range into its individual cells, so the caller can fetch them all in one go.
function collectRefs(node: ASTNode, acc: Set<string>): void {
  if (!node) return;
  switch (node.type) {
    case "ref":
      acc.add(node.ref.toUpperCase());
      break;
    case "range":
      for (const cell of expandRange(node.start, node.end)) acc.add(cell);
      break;
    case "unary":
      collectRefs(node.operand, acc);
      break;
    case "binary":
      collectRefs(node.left, acc);
      collectRefs(node.right, acc);
      break;
    case "call":
      for (const arg of node.args) collectRefs(arg, acc);
      break;
  }
}

// Server returns raw cell content strings. Empty -> blank (null); a numeric
// string -> its number; anything else (text, or a formula-valued ref, which is
// the dependency-graph boundary we haven't crossed yet) -> blank for now.
function toCellValue(content: string | undefined): number | null {
  if (content === undefined || content === "") return null;
  const n = Number(content);
  return isNaN(n) ? null : n;
}

// Fetches raw content for a batch of A1 refs in one call (A1 -> content).
export type CellResolver = (refs: string[]) => Promise<Record<string, string>>;

// SUM, AVERAGE, MIN, MAX, IF
export async function evaluateEquation(
  rawData: string,
  resolveCells: CellResolver,
): Promise<string> {
  if (!isFormula(rawData)) return "#NAME?";
  if (rawData.length === 1) return rawData;
  try {
    const tokens = tokenize(rawData);
    const ast = parse(tokens);

    // 1. Collect every cell this formula needs (ranges expanded to cells)...
    const refSet = new Set<string>();
    collectRefs(ast, refSet);
    const refs = [...refSet];
    console.log(refs);

    // 2. ...fetch them all in a single call...
    const rawValues = refs.length ? await resolveCells(refs) : {};
    const values = new Map<string, number | null>();
    for (const [a1, content] of Object.entries(rawValues)) {
      values.set(a1.toUpperCase(), toCellValue(content));
    }

    // 3. ...then evaluate against the resolved values.
    const result = treeTraversal(ast, values);
    return result?.toString() ?? "#VALUE!";
  } catch (err) {
    // Excel-style error codes (e.g. "#DIV/0!") are thrown with a "#"-prefixed
    // message; anything else (parse errors, mid-typing) collapses to #ERROR!.
    const message = err instanceof Error ? err.message : "";
    return message.startsWith("#") ? message : "#ERROR!";
  }
}

export function arithmeticOperation(
  type: arithmeticOperationType,
  args: (number | null)[],
): number {
  // Empty (e.g. SUM of an all-blank range) is 0, not a reduce-of-empty crash.
  if (args.length === 0) return 0;
  return (
    args.reduce((a, b) => {
      // Blank cells count as 0 in arithmetic, matching Excel.
      const left = a ?? 0;
      const right = b ?? 0;
      if (type === "+") return left + right;
      if (type === "-") return left - right;
      if (type === "*") return left * right;
      if (type === "/") {
        if (right === 0) throw new Error("#DIV/0!");
        return left / right;
      }
      return 0;
    }) ?? 0
  );
}

// Comparisons (used inside IF): returns 1 for true, 0 for false.
export function comparisonOperation(
  op: comparisonOperationType,
  left: number | null,
  right: number | null,
): number {
  const a = left ?? 0;
  const b = right ?? 0;
  if (op === ">") return a > b ? 1 : 0;
  if (op === "<") return a < b ? 1 : 0;
  return a === b ? 1 : 0;
}

export function sum(args: (number | null)[]) {
  return arithmeticOperation("+", args);
}

export function average(args: (number | null)[]) {
  // Blanks are ignored (not counted in the denominator), matching Excel.
  const nums = args.filter((arg): arg is number => arg !== null);
  if (nums.length === 0) return 0;
  return arithmeticOperation("+", nums) / nums.length;
}

export function min(args: (number | null)[]) {
  const nums = args.filter((arg): arg is number => arg !== null);
  if (nums.length === 0) return 0;
  return Math.min(...nums);
}

export function max(args: (number | null)[]) {
  const nums = args.filter((arg): arg is number => arg !== null);
  if (nums.length === 0) return 0;
  return Math.max(...nums);
}

export function treeTraversal(
  tree: ASTNode,
  values: Map<string, number | null>,
): number | null {
  if (!tree) return null;

  if (tree.type === "call") {
    // IF is special: it must evaluate the condition first and then ONLY the
    // taken branch (short-circuit), so it is not part of the eager map.
    if (tree.name === "IF") {
      const [conditionNode, thenNode, elseNode] = tree.args;
      if (!conditionNode) throw new Error("#ERROR!");
      const condition = treeTraversal(conditionNode, values);
      // Non-zero (and non-blank) is truthy.
      if (condition !== null && condition !== 0) {
        return thenNode ? treeTraversal(thenNode, values) : null;
      }
      return elseNode ? treeTraversal(elseNode, values) : 0;
    }

    // tree.name is now narrowed to the aggregate functions (IF handled above).
    // A range arg (SUM(A1:B3)) is NOT one value — expand it into the list of its
    // cell values and flatten into the argument list; scalar args evaluate normally.
    const valuatedArgs: (number | null)[] = [];
    for (const arg of tree.args) {
      if (arg?.type === "range") {
        for (const cell of expandRange(arg.start, arg.end)) {
          valuatedArgs.push(values.get(cell) ?? null);
        }
      } else {
        valuatedArgs.push(treeTraversal(arg, values));
      }
    }
    return excelFunctions[tree.name](valuatedArgs);
  }

  if (tree.type === "binary") {
    const left = treeTraversal(tree.left, values);
    const right = treeTraversal(tree.right, values);
    if (isComparisonOperation(tree.op)) {
      return comparisonOperation(tree.op, left, right);
    }
    return arithmeticOperation(tree.op, [left, right]);
  }

  if (tree.type === "unary") {
    const operand = treeTraversal(tree.operand, values) ?? 0;
    return tree.op === "-" ? -operand : operand;
  }

  if (tree.type === "number") {
    return tree.value;
  }

  if (tree.type === "ref") {
    // Blank/missing cells resolve to null (treated as blank by the operators).
    return values.get(tree.ref.toUpperCase()) ?? null;
  }

  // A bare range used where a single value is expected (e.g. "=A1:B3", or a
  // range as an IF branch) isn't a scalar — Excel errors here.
  throw new Error("#VALUE!");
}
