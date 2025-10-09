# Teens IT School CRM System

## Overview
A full-stack CRM (Customer Relationship Management) system for Teens IT School, built with React, Express, TypeScript, and PostgreSQL. The application provides role-based access for administrators, teachers, and students to manage courses, attendance, payments, and student progress.

## Project Architecture

### Technology Stack
- **Frontend**: React 18 + TypeScript + Vite
- **Backend**: Express.js + TypeScript
- **Database**: PostgreSQL (Neon) with Drizzle ORM
- **Authentication**: Passport.js with session-based auth
- **Real-time**: WebSocket for live notifications
- **UI Components**: Radix UI + Tailwind CSS

### Directory Structure
```
├── client/              # Frontend React application
│   ├── src/
│   │   ├── components/  # UI components
│   │   ├── pages/       # Page components
│   │   ├── hooks/       # React hooks
│   │   └── lib/         # Utilities and API client
│   └── index.html
├── server/              # Backend Express server
│   ├── index.ts         # Main server entry
│   ├── routes.ts        # API routes
│   ├── auth.ts          # Authentication setup
│   ├── db.ts            # Database connection
│   └── storage.ts       # Database operations
├── shared/              # Shared code
│   └── schema.ts        # Database schema
└── migrations/          # Database migrations
```

## Setup & Configuration

### Development
The project runs on port 5000 with both frontend and backend served from the same Express server.

**Start Development Server:**
```bash
npm run dev
```

The server integrates Vite in middleware mode for hot module replacement during development.

### Database
- Uses PostgreSQL database with Drizzle ORM
- Schema includes: users, groups, attendance, payments, products, purchases, medal awards
- Session store: PostgreSQL-backed session management

**Database Commands:**
```bash
npm run db:push    # Push schema changes to database
npm run migrate    # Run migrations
npm run seed       # Seed initial data
```

### Build & Production
```bash
npm run build      # Build frontend and backend
npm start          # Start production server
```

## Features

### User Roles
1. **Administrator** - Full system access, manage users and settings
2. **Teachers** - Manage groups, attendance, student progress
3. **Students** - View their courses, attendance, and progress

### Core Functionality
- User authentication and authorization
- Group/class management
- Attendance tracking
- Payment management
- Product/purchase system
- Medal/achievement awards
- Real-time notifications via WebSocket
- Avatar customization

## Environment Variables
- `DATABASE_URL` - PostgreSQL connection string (required)
- `SESSION_SECRET` - Session encryption key (default: "teens-it-school-secret-2024")
- `NODE_ENV` - Environment mode (development/production)
- `PORT` - Server port (default: 5000)

## Deployment
Configured for Replit autoscale deployment:
- Build command: `npm run build`
- Run command: `npm start`
- Serves static files from `dist/public` in production

## Recent Changes (October 2025)
- Imported from GitHub and configured for Replit environment
- Fixed Vite HMR configuration for middleware mode
- Set up PostgreSQL database with Drizzle schema
- Configured development workflow on port 5000
- Added deployment configuration for autoscale
- Created .gitignore for proper version control

## Notes
- The application uses session-based authentication with PostgreSQL session store
- WebSocket endpoint `/ws` requires authentication
- Frontend uses Replit proxy, configured to allow all hosts in development
- Database migrations are managed by Drizzle Kit
