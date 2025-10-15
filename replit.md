# Teens IT School - CRM System

## Overview
A comprehensive CRM system for managing IT school operations, including student management, attendance tracking, teacher assignments, and payment processing. Built with Express.js backend and React frontend with real-time WebSocket notifications.

**Last Updated:** October 15, 2025

## Project Status
- ✅ Successfully imported and configured for Replit environment
- ✅ Database schema migrated and ready
- ✅ Development server running on port 5000
- ✅ Frontend configured with proper Replit proxy support
- ✅ Deployment configuration set up for autoscale

## Tech Stack

### Frontend
- **Framework:** React 18 with Vite
- **UI Library:** Radix UI components + Tailwind CSS
- **State Management:** TanStack Query (React Query)
- **Routing:** Wouter
- **Forms:** React Hook Form + Zod validation

### Backend
- **Runtime:** Node.js 18+
- **Framework:** Express.js
- **Database:** PostgreSQL (Neon via Replit)
- **ORM:** Drizzle ORM
- **Authentication:** Passport.js with local strategy
- **Real-time:** WebSocket (ws library)

## Project Architecture

### Directory Structure
```
├── client/          # Frontend React application
│   ├── src/
│   │   ├── components/  # UI components
│   │   ├── pages/       # Page components
│   │   ├── hooks/       # Custom React hooks
│   │   └── lib/         # Utilities and API client
├── server/          # Backend Express application
│   ├── index.ts     # Main server entry point
│   ├── routes.ts    # API route definitions
│   ├── auth.ts      # Authentication logic
│   └── db.ts        # Database connection
├── shared/          # Shared types and schemas
│   └── schema.ts    # Drizzle schema definitions
├── migrations/      # Database migrations
└── api/             # Serverless API functions
```

### Database Schema
- **users:** Students, teachers, and admins (role-based)
- **groups:** Class groups with schedules
- **group_students:** Student-group associations
- **teacher_groups:** Teacher-group assignments
- **attendance:** Daily attendance records
- **payments:** Payment tracking
- **products:** School products/merchandise
- **sales:** Product sales records

## Configuration

### Environment Variables
- `DATABASE_URL`: PostgreSQL connection string (auto-configured by Replit)
- `NODE_ENV`: Set to "development" or "production"
- `PORT`: Server port (defaults to 5000)

### Development Server
- **Port:** 5000 (frontend and backend both served from this port)
- **Host:** 0.0.0.0 (configured for Replit proxy)
- **HMR:** Configured for Replit WebSocket proxy on port 443

### Deployment
- **Type:** Autoscale (stateless web application)
- **Build Command:** `npm run build`
- **Start Command:** `npm start`

## Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run db:push` - Push database schema changes
- `npm run seed` - Seed database with initial data
- `npm run check` - TypeScript type checking

## Features

### Role-Based Access
1. **Admin Dashboard:** Full system management, user creation, group management
2. **Teacher Dashboard:** Attendance marking, student management for assigned groups
3. **Student Dashboard:** View attendance, grades, payment history

### Core Functionality
- Real-time WebSocket notifications for attendance, payments, and updates
- Avatar builder and customization for students
- Medal/reward system (gold, silver, bronze)
- Monthly attendance tracking and visualization
- Payment and sales management
- Product/merchandise management

## Security
- Password hashing with bcrypt
- Session management with express-session
- Passport.js authentication strategies
- SSL/TLS for database connections
- CORS configured for Replit environment

## Recent Changes
- **Oct 15, 2025:** Fixed database type casting issue in rankings API
  - Added explicit VARCHAR casting in medal awards JOIN queries
  - Fixed in `getTopStudentsByMedalsThisWeek` and `getTopStudentsByMedalsThisMonth` functions
  - Resolved "operator does not exist: uuid = character varying" error
  - Rankings now load correctly without database errors

- **Oct 15, 2025:** Fixed student count display in teacher panel
  - Fixed naming mismatch: API returns `totalStudents` but frontend was accessing `studentCount`
  - Fixed in two places:
    1. Attendance group card (line 67)
    2. Overview tab group list (line 906)
  - Student counts now display correctly for each group in teacher dashboard
  
- **Oct 15, 2025:** Initial Replit setup and configuration
  - Installed all dependencies
  - Migrated database schema
  - Configured development workflow
  - Set up deployment configuration
  - Verified frontend/backend integration
