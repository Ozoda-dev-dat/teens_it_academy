# Teens IT School - Management System

## Overview
A comprehensive IT school management system built for tracking students, teachers, attendance, and a medal-based rewards program. The application features real-time updates via WebSockets and a marketplace where students can redeem medals for products.

## Tech Stack
- **Frontend**: React + Vite + TypeScript + TailwindCSS
- **Backend**: Express.js + TypeScript
- **Database**: PostgreSQL (Neon) with Drizzle ORM
- **Real-time**: WebSockets (ws library)
- **Authentication**: Passport.js with session-based auth
- **UI Components**: Radix UI primitives

## Project Structure
```
├── client/              # React frontend
│   ├── src/
│   │   ├── components/  # UI components
│   │   ├── hooks/       # Custom React hooks
│   │   ├── lib/         # Utilities and API client
│   │   └── pages/       # Page components
│   └── index.html
├── server/              # Express backend
│   ├── index.ts         # Server entry point
│   ├── routes.ts        # API routes
│   ├── auth.ts          # Authentication setup
│   ├── notifications.ts # WebSocket service
│   └── storage.ts       # Database operations
├── shared/
│   └── schema.ts        # Shared database schema
└── migrations/          # Database migrations
```

## Key Features
1. **User Management** - Admin, Teacher, and Student roles with separate dashboards
2. **Course Groups** - Create and manage course groups with teacher assignments
3. **Attendance Tracking** - Track student attendance with automatic bronze medal rewards
4. **Medal System** - Gold, Silver, Bronze medals with monthly limits to prevent abuse
5. **Marketplace** - Students redeem medals for products
6. **Real-time Updates** - WebSocket notifications for all major events
7. **Avatar Customization** - Custom avatar builder for students

## Setup & Configuration

### Environment Variables
The following environment variables are automatically configured:
- `DATABASE_URL` - PostgreSQL connection string
- `PORT` - Server port (default: 5000)
- `NODE_ENV` - Environment (development/production)

### Database Setup
The database schema is managed via Drizzle ORM. On initial setup:
```bash
npm run db:push    # Push schema to database
npm run seed       # Seed with demo data
```

### Demo Accounts
After seeding, the following accounts are available:
- **Admin**: admin@mail.com / admin2233

Students and teachers are created through the admin panel.

## Development

### Running Locally
```bash
npm run dev        # Start development server (port 5000)
```

### Building for Production
```bash
npm run build      # Build both frontend and backend
npm start          # Run production server
```

## Deployment
- **Target**: Autoscale deployment (stateless)
- **Build Command**: `npm run build`
- **Run Command**: `npm start`
- **Port**: 5000 (configured via PORT env variable)

## Recent Changes
- **2025-10-08**: Initial project setup in Replit environment
  - Configured PostgreSQL database with Drizzle ORM
  - Set up development workflow on port 5000
  - Configured deployment settings for autoscale
  - Seeded database with demo admin account

## Architecture Notes
- **Session Management**: PostgreSQL-backed sessions via connect-pg-simple
- **WebSocket Auth**: Sessions are validated from cookies on WebSocket connections
- **Frontend Proxy**: Vite dev server configured to allow all hosts for Replit proxy
- **API Structure**: RESTful endpoints under `/api/*` prefix
- **Real-time**: WebSocket server on `/ws` path for live notifications

## Medal System Rules
- Bronze: Up to 48 medals per student per month (auto-awarded for attendance)
- Silver: Up to 100 medals per student per month
- Gold: Up to 50 medals per student per month
- Medals can be revoked by admin or teacher
- Students can spend medals in marketplace

## User Roles & Permissions
- **Admin**: Full system access, manage all users, groups, products
- **Teacher**: Manage assigned groups, mark attendance, award medals
- **Student**: View personal data, dashboard, purchase from marketplace
