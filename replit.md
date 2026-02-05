# Education Management System

## Overview
A full-stack web application for managing educational institutions, including student/teacher management, group management, attendance tracking, products/rewards system with medals, and purchases.

## Tech Stack
- **Frontend**: React 18 with Vite, TypeScript, TailwindCSS, shadcn/ui components
- **Backend**: Express.js with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Passport.js with session-based auth

## Project Structure
```
├── client/           # React frontend (Vite)
│   └── src/          # React components and pages
├── server/           # Express backend
│   ├── index.ts      # Server entry point
│   ├── routes.ts     # API routes
│   ├── auth.ts       # Authentication setup
│   └── storage.ts    # Database operations
├── shared/           # Shared types and schema
│   └── schema.ts     # Drizzle database schema
├── lib/              # Shared utilities
│   └── db.ts         # Database connection
├── api/              # Vercel-style API routes (unused in dev)
└── migrations/       # Database migrations
```

## Scripts
- `npm run dev` - Start development server (frontend + backend on port 5000)
- `npm run build` - Build for production
- `npm run start` - Run production server
- `npm run db:push` - Push schema changes to database
- `npm run seed` - Seed database with sample data

## Environment Variables
- `DATABASE_URL` - PostgreSQL connection string (auto-configured)

## Development
The app runs as a single server on port 5000, serving both the API and frontend. In development mode, Vite handles the frontend with HMR.

## Recent Changes
- Feb 2026: Initial import and Replit environment setup
