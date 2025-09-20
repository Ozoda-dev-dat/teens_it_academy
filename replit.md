# Teens IT School Management System

## Overview
A comprehensive school management system designed for IT education centers. This full-stack application provides role-based dashboards for administrators, teachers, and students with features for attendance tracking, student management, rewards system, and more.

## Recent Changes
- **2025-09-20**: Imported from GitHub and configured for Replit environment
- **2025-09-20**: Set up PostgreSQL database with Drizzle ORM
- **2025-09-20**: Configured development workflow on port 5000
- **2025-09-20**: Added seed data including admin account (admin@mail.com / admin2233)
- **2025-09-20**: Configured deployment settings for production

## Project Architecture

### Tech Stack
- **Frontend**: React 18 + TypeScript + Vite
- **UI Framework**: Tailwind CSS + Radix UI components
- **Backend**: Node.js + Express.js + TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Real-time**: WebSocket connections
- **Authentication**: Passport.js with local strategy
- **State Management**: TanStack Query (React Query)
- **Routing**: Wouter (client-side routing)

### Project Structure
```
├── client/                 # React frontend application
│   ├── src/
│   │   ├── components/ui/  # Reusable UI components (Radix + Tailwind)
│   │   ├── hooks/          # Custom React hooks
│   │   ├── lib/            # Utilities and configurations
│   │   ├── pages/          # Page components for different routes
│   │   └── main.tsx        # Application entry point
├── server/                 # Express.js backend
│   ├── index.ts           # Server entry point
│   ├── routes.ts          # API route definitions
│   ├── auth.ts            # Authentication logic
│   ├── db.ts              # Database connection
│   ├── seed.ts            # Database seeding script
│   └── storage.ts         # Data access layer
├── shared/                # Shared types and schemas
│   └── schema.ts          # Drizzle database schema
├── api/                   # API endpoint implementations
└── migrations/            # Database migration files
```

### User Roles & Features
- **Admin**: Full system access, user management, group creation, attendance overview
- **Teacher**: Group management, attendance tracking, student progress monitoring
- **Student**: Personal dashboard, attendance history, rewards/medals tracking

### Key Features
- Role-based authentication and authorization
- Real-time attendance tracking
- Medal/rewards system for student motivation
- Group and class management
- Payment tracking
- Product/reward store
- Real-time notifications via WebSocket

## Database Schema
The application uses PostgreSQL with the following main entities:
- `users` - All system users (admin, teachers, students)
- `groups` - Learning groups/classes
- `attendance` - Attendance records
- `payments` - Student payment tracking
- `products` - Reward store items
- `medals` - Student achievement tracking

## Development Setup

### Environment Variables
- `DATABASE_URL` - PostgreSQL connection string (auto-configured in Replit)
- `NODE_ENV` - Environment mode (development/production)
- `PORT` - Server port (defaults to 5000)

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run db:push` - Sync database schema
- `npm run seed` - Seed database with demo data

### Demo Accounts
- **Administrator**: admin@mail.com / admin2233

## Deployment Configuration
- **Target**: Autoscale deployment (suitable for stateless web applications)
- **Build Command**: `npm run build` (builds frontend and backend)
- **Start Command**: `npm start` (runs production server)
- **Port**: 5000 (configured for Replit environment)

## User Preferences
- Project follows standard React/Express.js conventions
- Uses TypeScript throughout for type safety
- Implements comprehensive error handling and logging
- Configured for Replit environment with proper host settings (0.0.0.0:5000)
- Database operations use Drizzle ORM for type-safe queries