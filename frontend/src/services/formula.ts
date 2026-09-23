import { arithmeticTokens } from "../constents";

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

// SUM, AVERAGE, MIN, MAX, IF
export function evaluateEquation(rawData: string): string {
  if (!isFormula(rawData)) return "#NAME?";
  if (rawData.length === 1) return rawData;
  try {
    const tokens = tokenize(rawData);
    const ast = parse(tokens);
    const result = treeTraversal(ast);
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

export function treeTraversal(tree: ASTNode): number | null {
  if (!tree) return null;

  if (tree.type === "call") {
    // IF is special: it must evaluate the condition first and then ONLY the
    // taken branch (short-circuit), so it is not part of the eager map.
    if (tree.name === "IF") {
      const [conditionNode, thenNode, elseNode] = tree.args;
      if (!conditionNode) throw new Error("#ERROR!");
      const condition = treeTraversal(conditionNode);
      // Non-zero (and non-blank) is truthy.
      if (condition !== null && condition !== 0) {
        return thenNode ? treeTraversal(thenNode) : null;
      }
      return elseNode ? treeTraversal(elseNode) : 0;
    }

    // tree.name is now narrowed to the aggregate functions (IF handled above).
    const valuatedArgs: (number | null)[] = tree.args.map((arg) =>
      treeTraversal(arg),
    );
    return excelFunctions[tree.name](valuatedArgs);
  }

  if (tree.type === "binary") {
    const left = treeTraversal(tree.left);
    const right = treeTraversal(tree.right);
    if (isComparisonOperation(tree.op)) {
      return comparisonOperation(tree.op, left, right);
    }
    return arithmeticOperation(tree.op, [left, right]);
  }

  if (tree.type === "unary") {
    const operand = treeTraversal(tree.operand) ?? 0;
    return tree.op === "-" ? -operand : operand;
  }

  if (tree.type === "number") {
    return tree.value;
  }

  if (tree.type === "ref") {
    //TODO: finding the ref function
    return Math.random();
  }

  //TODO: finding the range function
  return Math.random();
}
