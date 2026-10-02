# Lattice

A fast, keyboard-first spreadsheet that runs in the browser — built from scratch to
explore the hard parts of a real spreadsheet: a **formula engine**, a **virtualized
grid** that renders a 10,000 × 10,000 sheet smoothly, and an **offline-first caching
layer** that keeps edits responsive and durable.

> Two independent apps: a React + Vite client (`frontend/`) and an Express + Postgres
> API (`backend/`).

---

## Highlights

- **Formula engine** — a hand-written tokenizer → recursive-descent parser (AST) →
  evaluator. Supports arithmetic with correct operator precedence, parentheses,
  cell refs (`A1`), ranges (`A1:B3`), comparisons, and functions (`SUM`, `AVERAGE`,
  `MIN`, `MAX`, `IF`). References are resolved by collecting every cell a formula
  needs in one AST walk and fetching them all in a **single batched API call**.
- **Virtualized rendering** — the grid only ever mounts the cells in the viewport,
  so a 10,000 × 10,000 sheet stays smooth with a near-constant number of DOM nodes.
  Scroll position drives a debounced range fetch.
- **Offline-first data layer** — edits are written through to an IndexedDB chunk
  cache and a dirty-cell store, then synced to the server on a debounce. Reads are
  served from the cache first and fall back to the API, so scrolling back to a region
  is instant.
- **Keyboard-first editing** — arrow keys, Tab, Enter, and Ctrl+C / Ctrl+X, with a
  single-overlay selection model that moves without re-rendering the cells it covers.

## Tech stack

| | |
|---|---|
| **Frontend** | React, TypeScript, Vite, React Router, IndexedDB (`idb`), SCSS |
| **Backend** | Node, Express, TypeScript, Prisma, PostgreSQL, Joi |

---

## Getting started

### Backend

```bash
cd backend
cp .env.example .env     # set DATABASE_URL (Postgres) and optionally PORT
npm install
npm run db:migrate       # apply Prisma migrations
npm run dev              # watch mode (default http://localhost:4000)
```

### Frontend

```bash
cd frontend
cp .env.example .env     # set VITE_BACKEND_URL to the backend's /api base
npm install
npm run dev              # http://localhost:5173
```

---

## Architecture

### Rendering: virtualize everything

The sheet is modelled as a 10,000 × 10,000 coordinate space, but only the cells that
fall inside the current viewport are rendered. Visible cells are **derived** from
scroll position with `useMemo` rather than stored in state, and the selection is drawn
as one overlay spanning the range instead of styling each cell — so moving the
selection repaints a single element, not thousands.

### Data: chunked, offline-first, write-through

Cells are grouped into fixed **chunks** (a range such as `100-100`) rather than stored
one row per cell. That one idea runs end to end:

- **Server** (`sheet` table): one row per chunk — a `range` plus a JSON `data` blob of
  its cells.
- **Client** (IndexedDB): the same chunks are cached, plus a separate dirty-cell store
  for unsaved edits.
- **Read path** (`Gatherer`): check the IDB chunk cache first; on a miss, fetch from
  the API and cache the result.
- **Write path**: every edit updates React state, the dirty-cell store, **and** the
  cached chunk (write-through), so scrolling away and back shows the edit, not a stale
  value. Edits sync to the server on a debounce.

### Formula engine

```
"=SUM(A1:B3) + C1"  →  tokenize  →  parse (AST)  →  collect refs  →  batch fetch  →  evaluate
```

1. **Tokenize** the raw string into numbers, refs, ranges, operators, and function
   names.
2. **Parse** into an AST with a precedence ladder (comparison → add/sub → mul/div →
   unary → primary), so `A1 + B2 * 3` nests correctly and parentheses restart the
   ladder.
3. **Collect refs** in one AST walk, expanding every range (`A1:B3`) into its cells.
4. **Batch fetch** all referenced cells in a single `POST /sheets/sheet/cellValue`.
5. **Evaluate** the AST against the fetched value map; ranges inside functions expand
   to value lists, blank cells behave like Excel, and errors surface as `#DIV/0!`,
   `#REF!`, `#CYCLE!`, etc.

The cell resolver is **injected** into the evaluator, so the "fetch raw values" step
can later be swapped for a dependency-graph lookup without touching the traversal.

---

## Current limitations & roadmap

This is a deliberately scoped build. The formula engine is a **calculator over stored
values**, not yet a fully reactive spreadsheet:

- A reference to a cell that itself contains a formula resolves to blank (the API
  returns raw content). The fix is a **dependency graph** — the injected resolver is
  the seam where it plugs in.
- Changing a cell does not auto-recompute its dependents; that also needs the graph
  (reverse dependencies + topological recalculation).

Natural next steps, in order: a dependency graph with cycle detection and incremental
recalculation, then undo/redo via a reversible command stack, then real-time
collaboration (CRDT/OT over WebSockets).
