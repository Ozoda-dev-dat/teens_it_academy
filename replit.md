# Teens IT School Management System

## Overview
This is a full-stack web application for managing a programming school. It's a comprehensive CRM system for tracking students, teachers, groups, attendance, and payments. The application supports multiple user roles including administrators, teachers, and students.

## Architecture
- **Frontend**: React 18 with TypeScript, Vite build system
- **Backend**: Express.js with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Passport.js with local strategy
- **Real-time**: WebSocket support for notifications
- **UI**: Radix UI components with TailwindCSS styling

## Recent Changes (September 28, 2025)
- Successfully imported GitHub project into Replit environment
- Set up PostgreSQL database and ran initial migrations
- Configured development workflow on port 5000
- Verified frontend and backend integration
- Set up deployment configuration for autoscale production deployment

## Project Structure
```
├── client/               # React frontend application
│   ├── src/
│   │   ├── components/   # UI components (Radix UI based)
│   │   ├── hooks/        # React hooks for auth, WebSocket, etc.
│   │   ├── lib/          # Utilities, API client, query client
│   │   └── pages/        # Application pages/routes
├── server/               # Express backend
│   ├── auth.ts           # Authentication setup
│   ├── routes.ts         # API route definitions
│   └── index.ts          # Server entry point
├── shared/               # Shared schemas and types
├── lib/                  # Shared utilities
└── migrations/           # Database migration files
```

## Key Features
- Multi-role authentication (Admin, Teacher, Student)
- Student and group management
- Attendance tracking with medal rewards system
- Payment and product management
- Real-time notifications via WebSocket
- Responsive UI with modern design

## Environment Setup
- Database: PostgreSQL (configured via DATABASE_URL)
- Development server: `npm run dev` (port 5000)
- Build: `npm run build`
- Production: `npm start`

## User Preferences
- Language: Application supports Uzbek text content
- UI: Modern, card-based design with clean typography
- Authentication: Role-based access control with separate login flows

## Development Notes
- The application is properly configured for Replit environment
- Vite config includes allowedHosts: true for proxy support
- Server configured to trust proxy for production deployment
- WebSocket server runs on same port as HTTP server