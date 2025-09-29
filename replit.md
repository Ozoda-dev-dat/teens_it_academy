# Teens IT School CRM System

## Overview
This is a comprehensive school management system (CRM) for "Teens IT School" that handles students, teachers, groups, attendance tracking, and administrative functions. The project was successfully imported from GitHub and configured to run in the Replit environment.

## Recent Changes
- **2025-09-29**: Successfully imported from GitHub and configured for Replit
- Installed all dependencies and resolved TypeScript errors
- Set up PostgreSQL database with Drizzle ORM migrations
- Configured development workflow to run on port 5000
- Set up deployment configuration for production

## Project Architecture
- **Frontend**: React 18 + TypeScript with Vite build system
- **Backend**: Express.js server with REST API
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Passport.js with local strategy and session management
- **UI Components**: Radix UI components with Tailwind CSS
- **Real-time Features**: WebSocket support for notifications

## Project Structure
```
├── client/          # React frontend application
├── server/          # Express backend server
├── api/            # API route handlers (Vercel-style)
├── shared/         # Shared schema and types
├── lib/            # Shared utilities and auth
└── migrations/     # Database migrations
```

## Development
- **Port**: 5000 (configured for Replit environment)
- **Host**: 0.0.0.0 with allowedHosts: true for proxy support
- **Database**: PostgreSQL with automatic session management
- **Hot Reload**: Vite HMR configured for development

## Deployment
- **Target**: Autoscale deployment
- **Build**: `npm run build` (includes database push and Vite build)
- **Run**: `npm start` (production server)

## Features
- Multi-role authentication (Admin, Teacher, Student)
- Group management and student enrollment
- Attendance tracking with bulk operations
- Medal/achievement system
- Real-time notifications via WebSocket
- Responsive UI with dark/light theme support
- Session-based authentication with PostgreSQL storage