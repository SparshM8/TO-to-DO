# TO2DO

A powerful todo application built with Next.js, TypeScript, Tailwind CSS, and Node.js.

## Features

- User authentication
- Task management
- Lists and projects
- Real-time updates
- Offline support (PWA)
- Search and filters
- Analytics

## Tech Stack

- Frontend: Next.js 14, TypeScript, Tailwind CSS, PWA
- Backend: Node.js, TypeScript, Fastify, Prisma
- Database: PostgreSQL
- Auth: JWT

## Getting Started

1. Clone the repository
2. Install dependencies: `npm install`
3. Set up database: Configure PostgreSQL and run `npx prisma migrate dev`
4. Start development: `npm run dev`

## Project Structure

- `frontend/` - Next.js application
- `backend/` - Fastify API server
- `infra/` - Infrastructure configurations

## Scripts

- `npm run dev` - Start development servers
- `npm run build` - Build for production
- `npm run test` - Run tests
- `npm run lint` - Lint code