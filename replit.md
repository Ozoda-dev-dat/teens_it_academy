# Teens IT School - CRM System

## Overview
This is a full-stack CRM system for Teens IT School, built with React, Express, TypeScript, and PostgreSQL. The application manages students, teachers, attendance, groups, and includes real-time notifications via WebSocket.

## Project Architecture

### Frontend
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Routing**: Wouter
- **State Management**: TanStack React Query
- **UI Components**: Radix UI with custom components
- **Styling**: Tailwind CSS with custom animations
- **Real-time Updates**: WebSocket integration

### Backend
- **Framework**: Express.js with TypeScript
- **Database**: PostgreSQL (Neon)
- **ORM**: Drizzle ORM
- **Authentication**: Passport.js with session-based auth
- **Session Store**: PostgreSQL (connect-pg-simple)
- **Real-time**: WebSocket Server (ws library)

### Key Features
- Multi-role authentication (Admin, Teacher, Student)
- Attendance tracking and management
- Student medal/achievement system
- Group and class management
- Real-time notifications
- Dashboard analytics

## Development Setup

### Environment Variables
- `DATABASE_URL`: PostgreSQL connection string (already configured)
- `NODE_ENV`: Set to 'development' for dev mode

### Database
The application uses PostgreSQL with Drizzle ORM. Migrations are managed automatically:
```bash
npm run db:push    # Push schema changes to database
npm run migrate    # Run migrations
npm run seed       # Seed initial data
```

### Running the Application
The application runs on port 5000 with both frontend and backend:
```bash
npm run dev        # Development mode with hot reload
npm run build      # Build for production
npm start          # Run production build
```

## Replit Configuration

### Workflow
- **Name**: Server
- **Command**: `npm run dev`
- **Port**: 5000
- **Type**: Webview (full-stack application)

### Deployment
- **Type**: Autoscale
- **Build**: `npm run build`
- **Run**: `npm start`

### Important Notes for Replit
1. The Vite config is already set up with `allowedHosts: true` for the Replit proxy
2. Frontend binds to `0.0.0.0:5000` to work with Replit's infrastructure
3. Backend serves both API and static files on port 5000
4. WebSocket connections work through the same port via `/ws` path

## Project Structure
```
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/    # UI components
│   │   ├── pages/         # Page components
│   │   ├── hooks/         # Custom React hooks
│   │   └── lib/           # Utilities and API client
│   └── index.html
├── server/                # Backend Express application
│   ├── index.ts          # Server entry point
│   ├── routes.ts         # API routes
│   ├── auth.ts           # Authentication logic
│   ├── db.ts             # Database connection
│   └── notifications.ts  # WebSocket service
├── shared/               # Shared TypeScript types
│   └── schema.ts        # Database schema and types
├── lib/                 # Server-side utilities
├── migrations/          # Database migrations
└── api/                # API endpoints (Vercel-style routing)
```

## Recent Changes
- **2025-10-07**: Initial Replit setup completed
  - Installed dependencies
  - Configured PostgreSQL database
  - Applied database migrations
  - Set up development workflow
  - Configured deployment settings
  - Verified application is running successfully

## User Preferences
None specified yet.

## Known Issues
- WebSocket shows auth warning for unauthenticated users (expected behavior)
- This is intentional - users need to log in to receive real-time updates
