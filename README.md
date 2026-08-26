# TO2DO

TO2DO is a full-stack task-management application with a Next.js browser client and a Fastify API. The current implementation supports authenticated users, lists, tasks, subtasks, comments, tags, task attachments, and optional AI-assisted task parsing.

## Current capabilities

| Area | Implemented behavior |
| --- | --- |
| Authentication | Signup, login, seven-day JWT sessions, protected API routes, normalized email handling, and password hashing with bcrypt. |
| Lists and tasks | Create, read, update, and delete lists and tasks. Task status, priority, descriptions, and due dates are supported. |
| Task organization | Subtasks, comments, tags, and task attachments are available through authenticated API routes and the task-detail UI. |
| AI assistance | The authenticated `POST /api/ai/parse-task` endpoint can parse natural-language task descriptions when the optional AI configuration is available. |
| Client experience | Responsive Next.js pages for dashboard, authentication, lists, and task details, including online-status feedback and task-card forms. |
| Quality gates | GitHub Actions runs install, lint, the frontend API-origin guard, backend tests, and production builds on Node 20. |

Features such as real-time synchronization, offline-first persistence, analytics, and full-text search are not currently implemented and should not be treated as production capabilities until separately added and tested.

## Technology stack

The frontend uses **Next.js 16**, React, TypeScript, Tailwind CSS, and the App Router. The backend uses **Node.js**, TypeScript, Fastify, Prisma, and SQLite for the current local development datasource. Authentication uses JWT and bcrypt. The repository is an npm-workspaces monorepo with `frontend/` and `backend/` packages.

## Requirements

Use **Node.js 20.9 or newer** and npm. Install dependencies from the repository root:

```bash
npm ci
```

The backend currently uses the SQLite file configured by `backend/prisma.config.ts` and `backend/prisma/schema.prisma`. For local development, the repository includes a development database fixture. If you need a clean local database, run the Prisma migration workflow from the `backend/` directory according to the project’s migration state.

## Environment configuration

Create `backend/.env` from `backend/.env.example`. In production, `JWT_SECRET` is required and must contain at least 32 characters; the backend intentionally fails during startup when this requirement is not met. Never commit `.env` files, passwords, JWTs, or database credentials.

Create `frontend/.env.local` from `frontend/.env.example`. Set `NEXT_PUBLIC_API_URL` to the backend origin, for example:

```bash
NEXT_PUBLIC_API_URL=http://localhost:3001
```

All browser requests use the shared `frontend/src/lib/api.ts` helper. This keeps local development convenient while allowing a deployed frontend to call a separately hosted backend without source changes.

## Run locally

From the repository root, start both development servers:

```bash
npm run dev
```

The frontend normally runs at [http://localhost:3000](http://localhost:3000) and the backend at [http://localhost:3001](http://localhost:3001). If port 3000 is already in use, Next.js may select another local port; the frontend still uses the configured backend origin.

You can also run the workspaces independently:

```bash
npm run dev --workspace=frontend
npm run dev --workspace=backend
```

## Verification commands

Run the same checks used during hardening and CI:

```bash
npm run check:frontend-api
npm test
npm run lint
npm run build
```

The backend auth configuration tests verify development behavior and production fail-fast behavior. The API-origin check prevents hardcoded `localhost:3001` URLs from returning to authored frontend pages. The current lint output may include an informational `baseline-browser-mapping` freshness notice from the frontend dependency tree; it does not fail the quality gate.

## Production deployment

Deploy the frontend and backend as separate services unless a deliberate reverse-proxy arrangement is added. Configure the frontend’s `NEXT_PUBLIC_API_URL` to the public backend URL and configure the backend’s `JWT_SECRET` with a strong random value of at least 32 characters. Configure CORS on the backend for the exact frontend origin rather than using a broad wildcard in a credentialed deployment.

The current Prisma datasource is SQLite and is appropriate for local development only. Do not place the writable SQLite database on an ephemeral serverless filesystem. For a durable production deployment, migrate the Prisma schema and datasource to a managed persistent database, run migrations during deployment, and back up the database before upgrades. The repository does not currently contain a linked production hosting project or a complete managed-database deployment configuration.

## Repository layout

```text
frontend/                 Next.js browser application
backend/                  Fastify API and Prisma schema
backend/src/controllers/  HTTP handlers for auth, lists, tasks, and related features
backend/src/routes/       Authenticated and public route registration
backend/src/middlewares/  JWT authentication middleware
scripts/                  Repository quality checks
.github/workflows/        GitHub Actions CI
```

## Security notes

Passwords are hashed before storage and are never intentionally logged by the authentication controller. Do not use the development fallback secret in production. Authentication failures are returned as generic credential errors, and `/api/users/me` exposes only the safe user projection needed by the client. Production operators must still provide a strong secret, a persistent database, restricted CORS, HTTPS, and a suitable rate-limiting or edge-protection layer.

## License and contribution

Before opening a pull request, run the complete verification commands above. Keep documentation and environment examples synchronized with the actual stack, and raise a GitHub issue for a confirmed defect before changing behavior so fixes remain traceable.
