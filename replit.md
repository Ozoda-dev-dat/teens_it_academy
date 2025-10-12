# Teens IT School Management System

## Overview
A comprehensive web-based platform for managing educational activities at an IT school. The system provides role-based access for administrators, teachers, and students to manage attendance, track progress, award medals, and operate a student marketplace.

**Tech Stack:**
- Frontend: React + Vite + TypeScript + Tailwind CSS
- Backend: Express.js + TypeScript
- Database: PostgreSQL (Neon) with Drizzle ORM
- Real-time: WebSocket for live notifications
- Authentication: Passport.js with session-based auth

## Core Features

### User Roles
1. **Admin** - Full system control
   - Manage users (students, teachers)
   - Manage groups and attendance
   - Manage products and payments
   - View system statistics

2. **Teacher** - Group management
   - Mark attendance for assigned groups
   - Award medals to students
   - View student progress

3. **Student** - Personal dashboard
   - View attendance and progress
   - Purchase items with medals
   - Customize avatar

### Key Features
- **Attendance Tracking** - Daily attendance with status tracking (arrived/late/absent)
- **Medal System** - Gold/Silver/Bronze medals with monthly limits
- **Marketplace** - Products purchasable with medals
- **Avatar Customization** - Personalized student avatars
- **Real-time Notifications** - WebSocket-based live updates
- **Payment Tracking** - Student payment management

## Project Structure
```
├── client/              # React frontend
│   ├── src/
│   │   ├── components/  # UI components
│   │   ├── pages/       # Page components
│   │   ├── hooks/       # React hooks
│   │   └── lib/         # Utilities
├── server/              # Express backend
│   ├── index.ts         # Server entry point
│   ├── routes.ts        # API routes
│   ├── auth.ts          # Authentication
│   └── notifications.ts # WebSocket service
├── shared/              # Shared types and schema
└── migrations/          # Database migrations
```

## Development Setup

### Prerequisites
- Node.js >= 18.0.0
- PostgreSQL database (DATABASE_URL required)

### Environment Variables
- `DATABASE_URL` - PostgreSQL connection string (required)
- `NODE_ENV` - development/production
- `PORT` - Server port (default: 5000)

### Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run db:push` - Push database schema
- `npm run seed` - Seed initial data

## Database Schema
- **users** - Students, teachers, admins with authentication
- **groups** - Student groups with schedules
- **attendance** - Daily attendance records
- **products** - Marketplace items
- **purchases** - Student purchase history
- **payments** - Payment tracking
- **medalAwards** - Medal distribution history

## Recent Changes
- 2025-10-12: Initial project import and Replit environment setup

## Architecture Notes
- Frontend and backend served on same port (5000)
- Vite configured with allowedHosts: true for Replit proxy
- Session-based authentication with PostgreSQL session store
- Real-time updates via WebSocket on /api/ws endpoint
