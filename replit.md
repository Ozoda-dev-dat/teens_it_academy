# Teens IT School CRM

## Overview
A comprehensive CRM system for managing an IT school with students, teachers, administrators, groups, attendance, payments, and a medal rewards system. Built with React frontend and Express backend, using PostgreSQL database with Drizzle ORM.

## Project Architecture

### Tech Stack
- **Frontend**: React 18 + Vite + TypeScript
- **Backend**: Express.js + TypeScript
- **Database**: PostgreSQL (via Drizzle ORM)
- **UI Components**: Radix UI + Tailwind CSS
- **Real-time**: WebSocket for live updates
- **Authentication**: Passport.js with local strategy + Express sessions

### Project Structure
```
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # UI components
│   │   ├── hooks/        # React hooks (auth, websocket)
│   │   ├── lib/          # Utilities and API client
│   │   └── pages/        # Page components
│   └── index.html
├── server/                # Express backend
│   ├── auth.ts          # Authentication setup
│   ├── db.ts            # Database connection
│   ├── index.ts         # Main server entry
│   ├── notifications.ts # WebSocket notifications
│   ├── routes.ts        # API routes
│   └── vite.ts          # Vite dev server integration
├── shared/               # Shared TypeScript types
│   └── schema.ts        # Database schema and types
└── migrations/          # Database migrations
```

## Development Setup

### Database
The project uses PostgreSQL with the following environment variables already configured:
- `DATABASE_URL`: Connection string
- `PGHOST`, `PGPORT`, `PGUSER`, `PGPASSWORD`, `PGDATABASE`: Individual connection params

### Scripts
- `npm run dev` - Start development server (port 5000)
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run db:push` - Push schema changes to database
- `npm run seed` - Seed database with initial data

### Ports
- **Port 5000**: Main application (serves both API and frontend)
  - Frontend: Served by Vite in dev, static files in production
  - Backend API: `/api/*` endpoints
  - WebSocket: `/ws` endpoint

## Key Features

### User Roles
1. **Admin**: Full system management
2. **Teacher**: Manage assigned groups and attendance
3. **Student**: View personal dashboard, attendance, and rewards

### Core Modules
- **User Management**: Students, teachers, admins with profiles
- **Group Management**: Class groups with schedules
- **Attendance Tracking**: Mark student attendance (arrived/late/absent)
- **Payment Tracking**: Student payment records
- **Medal System**: Gold/silver/bronze medals as rewards
- **Product Store**: Students can purchase items with medals
- **Real-time Updates**: WebSocket notifications for live data sync

## Configuration

### Replit Environment
The application is configured for Replit with:
- Vite dev server on `0.0.0.0:5000` with `allowedHosts: true`
- HMR over WSS on port 443
- Trust proxy enabled in production
- Session management with PostgreSQL store

### Deployment
Configured for autoscale deployment with:
- Build: `npm run build` (includes database push + Vite build + esbuild server)
- Run: `npm start` (production Node.js server)

## Recent Changes (2025-10-01)
- Installed all npm dependencies
- Applied database migrations with Drizzle
- Configured development workflow on port 5000
- Set up deployment configuration for production
- Verified application runs successfully
