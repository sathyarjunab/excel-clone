# Excel Clone

Two independent apps:

- `backend/` — Express + PostgreSQL API (TypeScript)
- `frontend/` — React + Vite client (TypeScript)

## Backend setup

```
cd backend
cp .env.example .env   # edit DATABASE_URL if needed
npm install
npm run db:migrate      # creates sheets/cells tables
npm run dev              # ts-node/tsx watch mode on http://localhost:4000
npm run build            # tsc -> dist/
npm start                # run compiled dist/index.js
```

## Frontend setup

```
cd frontend
cp .env.example .env
npm install
npm run dev              # starts on http://localhost:5173
npm run build            # tsc -b type-check, then vite build
```

## Data model

- `sheets` — one row per spreadsheet tab
- `cells` — one row per non-empty cell, keyed by (sheet_id, row_index, col_index), storing `value` and optional `formula`

## API

- `GET /api/sheets` — list sheets
- `POST /api/sheets` — create sheet `{ name }`
- `GET /api/sheets/:id` — get sheet + its cells
- `PATCH /api/sheets/:id` — rename sheet
- `DELETE /api/sheets/:id` — delete sheet
- `PUT /api/cells/:sheetId` — upsert a cell `{ row_index, col_index, value, formula }`
- `DELETE /api/cells/:sheetId` — clear a cell `{ row_index, col_index }`
