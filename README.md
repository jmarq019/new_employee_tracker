# Employee Tracker

A full-stack employee management app for tracking people, roles, and departments — with an org chart, bulk actions, and a command palette. The application is deployed through Vercel and it can be accessed [here](https://new-employee-tracker.vercel.app/employees)

## Stack

| Layer | Tech |
|-------|------|
| Frontend | Next.js 14 (App Router), TypeScript, custom CSS design system |
| Backend API | Express.js (legacy), Next.js Route Handlers (primary) |
| Database | MySQL (local) / Railway (production) |
| Deployment | Vercel (frontend + API routes) |

## Features

- **Employees** — table and cards view, search, department filter chips, "Managers only" filter, sortable columns, inline edit/delete, bulk delete with selection bar
- **Roles** — search, department filter chips, sortable columns, salary mini-bars, people-per-role count, inline edit/delete, bulk delete
- **Departments** — stat cards showing people, roles, and payroll totals per department
- **Org chart** — horizontal tree with CSS connector lines, department color-coded badges
- **Command palette** — `⌘K` / `Ctrl+K` to navigate, add records, toggle theme, and search live across all employees, roles, and departments
- **Dark mode** — toggle via nav or command palette, persisted to `localStorage`, no flash on load

## Project Structure

```
new_employee_tracker/
├── app.js / server.js        # Express API entry points
├── routes/api/               # Express REST routes (employees, roles, departments)
├── db/
│   ├── schema.sql            # MySQL schema
│   └── seeds.sql             # Seed data
├── config/connection.js      # MySQL connection (env-var driven)
├── __tests__/                # Jest + Supertest unit tests (30 tests)
└── client/                   # Next.js frontend
    ├── app/
    │   ├── api/              # Next.js route handlers (proxied to MySQL)
    │   ├── employees/
    │   ├── roles/
    │   ├── departments/
    │   └── org/
    ├── components/
    │   ├── nav.tsx
    │   ├── app-shell.tsx
    │   ├── command-palette.tsx
    │   ├── org-chart.tsx
    │   ├── employees/
    │   ├── roles/
    │   └── departments/
    └── lib/
        ├── api.ts            # Typed fetch wrappers for all CRUD operations
        ├── db.ts             # mysql2 connection pool (singleton)
        ├── design.ts         # deptColor(), avatarColor(), formatSalary()
        ├── types.ts          # Employee, Role, Department interfaces
        └── theme-context.tsx # Dark mode context
```

## Getting Started

### Prerequisites

- Node.js 18+
- MySQL 8+ (local) or a Railway MySQL instance

### Database setup

```bash
mysql -u root -p < db/schema.sql
mysql -u root -p team_db < db/seeds.sql
```

### Environment variables

Create `client/.env.local`:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=team_db
DB_PORT=3306
```

For the legacy Express server, the same vars are read from `.env` in the root.

### Run locally

```bash
# Frontend (Next.js)
cd client
npm install
npm run dev        # http://localhost:3000

# Legacy Express API (optional)
npm install
node server.js     # http://localhost:3001
```

### Run tests

```bash
npm test           # Jest + Supertest (runs from root)
```

## Deployment (Vercel)

1. Push the `client/` directory as the Vercel project root (or set the root directory in Vercel settings).
2. Add the DB environment variables in the Vercel dashboard.
3. Use [Railway](https://railway.app) or PlanetScale for the MySQL host — Vercel's serverless functions need an externally accessible database.

`client/vercel.json` is already configured for Next.js.

## API Routes

All routes live under `/api/` as Next.js Route Handlers.

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/employees` | List employees (with role title and manager name) |
| POST | `/api/employees` | Create employee |
| PUT | `/api/employees/[id]` | Update employee |
| DELETE | `/api/employees/[id]` | Delete employee |
| GET | `/api/roles` | List roles (with department name) |
| POST | `/api/roles` | Create role |
| PUT | `/api/roles/[id]` | Update role |
| DELETE | `/api/roles/[id]` | Delete role |
| GET | `/api/departments` | List departments |
| POST | `/api/departments` | Create department |
| PUT | `/api/departments/[id]` | Update department |
| DELETE | `/api/departments/[id]` | Delete department |
