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

The frontend uses **Next.js 16**, React, TypeScript, Tailwind CSS, and the App Router. The backend uses **Node.js**, TypeScript, Fastify, Prisma ORM 6.19, and MongoDB. Authentication uses JWT and bcrypt. The repository is an npm-workspaces monorepo with `frontend/` and `backend/` packages.

## Requirements

Use **Node.js 20.9 or newer** and npm. Install dependencies from the repository root:

```bash
npm ci
```

The backend reads `DATABASE_URL` from the environment and expects MongoDB. Use MongoDB Atlas or another MongoDB deployment configured as a replica set, because Prisma uses transactions for some nested writes. MongoDB does not use Prisma Migrate; after reviewing a schema change, synchronize it deliberately with `npx prisma db push` from the `backend/` directory. Do not run that command against production without a backup and an explicit review.

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

The Prisma datasource is MongoDB and is intended to connect to a managed persistent deployment such as MongoDB Atlas. Configure the Atlas URI as `DATABASE_URL`, confirm the cluster provides a replica set, and use `npx prisma db push` only as a reviewed schema-synchronization step because Prisma Migrate is not supported for MongoDB. The included `render.yaml` describes the backend web service and keeps `DATABASE_URL` and `FRONTEND_URL` as dashboard-provided secrets. A Vercel frontend still needs its project root set to `frontend` and its public `NEXT_PUBLIC_API_URL` set to the Render API URL.

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
