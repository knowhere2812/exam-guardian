# Exam Guardian

Exam Guardian is a university-focused online exam proctoring platform with a clear split between frontend and backend responsibilities.

## Project structure

- [frontend](frontend): React + Vite + TypeScript + Tailwind application
- [backend](backend): Express + TypeScript API and auth server
- [prisma](prisma): Prisma schema and database modeling
- [task.md](task.md): delivery checklist for backend integration work

## Tech stack

### Frontend

- React
- Vite
- TypeScript
- TanStack Router
- TanStack Query
- Tailwind CSS
- Recharts
- Lucide icons

### Backend

- Node.js
- Express
- TypeScript
- Prisma ORM
- PostgreSQL / Neon
- JWT auth
- bcrypt password hashing
- CORS + validation middleware

## Current status

The project already includes:

- a working frontend app shell and route structure under [frontend/src](frontend/src)
- a backend API foundation under [backend/src](backend/src)
- Prisma models under [prisma/schema.prisma](prisma/schema.prisma)
- JWT-based authentication scaffolding and backend-ready API client integration

## Local development

### 1) Frontend

From the repository root:

```sh
cd frontend
npm install
npm run dev
```

The frontend runs with Vite and is configured to be API-ready.

### 2) Neon database and backend

Create a PostgreSQL project in Neon and copy the connection strings from its dashboard. Put the pooled connection string in `DATABASE_URL` and the direct, non-pooler string in `DIRECT_URL` in `backend/.env`. Keep both URLs private and do not commit `.env`. If `DIRECT_URL` is omitted, the Prisma command wrapper derives the direct Neon hostname in memory from `DATABASE_URL`.

From the repository root:

```sh
npm install
npm run db:generate
npm run db:push
npm run dev:api
```

The backend defaults to port `4000` and exposes a health endpoint at:

```sh
http://localhost:4000/api/health
```

`npm run db:push` creates or updates the tables in the Neon database specified by `DIRECT_URL`. The API stores users, exams, and attempts there; it does not use seeded demo accounts or sample exam records.

## Environment variables

Use `backend/.env` for API secrets and database values. The API loads it explicitly, and the Prisma scripts load it before running schema operations. A placeholder Neon configuration is available at [.env.example](.env.example).

Required values include:

- `DATABASE_URL`
- `DIRECT_URL`
- `PORT`
- `FRONTEND_ORIGIN`
- `JWT_SECRET`
- `JWT_EXPIRES_IN`
- `VITE_API_URL`

## Frontend/backend responsibilities

### Frontend responsibilities

- UI and page flows
- role-based screens for student/admin
- exam and proctoring UX
- API-backed service layer integration
- charts, dashboards, and user interactions

### Backend responsibilities

- authentication and authorization
- request validation
- centralized error handling
- Prisma database access
- API endpoints for exams, attempts, users, and proctoring
- server-side enforcement of secure business rules

## Notes

This repo is intentionally structured so the frontend and backend are separately categorized, which makes development and future expansion easier.

The project still follows the planned architecture:

Frontend -> Services -> API -> Express -> Prisma -> PostgreSQL

and keeps AI/proctoring modules separate from the core application backend for future extension.

## Build verification

The project has been validated with:

```sh
npx tsx --test backend/src/lib/auth.test.ts
npm run build
npm run build:api
```

These commands confirm the JWT auth logic and the frontend/backend builds are working in the current repo state.
