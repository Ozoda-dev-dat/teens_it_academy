# Teens IT School - CRM System

## Overview
A comprehensive school management CRM system for "Teens IT School" built with React + Express + PostgreSQL. The application manages students, teachers, administrators, attendance tracking, and medals/achievements.

**Current State**: Fully functional and running on Replit
**Last Updated**: November 14, 2025

## Project Architecture

### Tech Stack
- **Frontend**: React 18 + Vite + TypeScript
- **Backend**: Express.js + Node.js
- **Database**: PostgreSQL (Neon-backed Replit database)
- **ORM**: Drizzle ORM
- **Styling**: Tailwind CSS + Radix UI components
- **Real-time**: WebSocket support for notifications
- **Authentication**: Passport.js with local strategy

### Project Structure
```
├── client/              # React frontend
│   ├── src/
│   │   ├── components/  # UI components
│   │   ├── pages/       # Page components
│   │   ├── hooks/       # Custom hooks
│   │   └── lib/         # Utilities & API client
│   └── public/          # Static assets
├── server/              # Express backend
│   ├── index.ts         # Server entry point
│   ├── routes.ts        # API routes
│   ├── auth.ts          # Authentication logic
│   └── notifications.ts # WebSocket notifications
├── shared/              # Shared types & schemas
└── migrations/          # Database migrations
```

## Key Features
1. **Multi-role Authentication**: Separate login portals for Admin, Teacher, and Student
2. **Dashboard Views**: Customized dashboards for each role
3. **Attendance Tracking**: Teacher attendance management with monthly views
4. **Medal/Achievement System**: Track and manage student achievements
5. **Real-time Notifications**: WebSocket-based notification system

## Environment Configuration

### Required Environment Variables
- `DATABASE_URL`: PostgreSQL connection string (already configured)
- `PORT`: Server port (defaults to 5000)
- `NODE_ENV`: Environment mode (development/production)

### Development Setup
- Server runs on port 5000 (both API and frontend)
- Vite dev server configured with HMR
- CORS enabled for Replit proxy environment
- Trust proxy enabled for secure sessions

## Running the Application

### Development
```bash
npm run dev
```
This starts both the Express server and Vite dev server on port 5000.

### Database Commands
```bash
npm run db:push    # Push schema changes to database
npm run migrate    # Run migrations
npm run seed       # Seed database with sample data
```

### Production Build
```bash
npm run build      # Build frontend and backend
npm run start      # Start production server
```

## Deployment
- **Type**: Autoscale deployment
- **Build Command**: `npm run build`
- **Frontend**: Served as static files in production
- **Backend**: Bundled with esbuild

## Important Notes
- The application serves both frontend and backend on a single port (5000)
- WebSocket HMR warnings in development are expected and don't affect functionality
- Database schema is managed through Drizzle ORM
- All routes are API-based with `/api` prefix
- Trust proxy is enabled for proper session handling behind Replit's proxy

## Recent Changes
- **2025-11-14**: Initial Replit environment setup
  - Configured Vite for Replit proxy support
  - Set up PostgreSQL database and pushed schema
  - Configured development workflow
  - Set up autoscale deployment configuration
