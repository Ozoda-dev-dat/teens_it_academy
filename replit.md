# Student Attendance Management System

## Project Overview
This is a comprehensive student attendance management system with a React frontend, Express.js backend, and PostgreSQL database. The system includes teacher dashboards, student tracking, medal rewards, and real-time notifications via WebSocket.

## Architecture
- **Frontend**: React + TypeScript + Vite + Tailwind CSS + Radix UI
- **Backend**: Express.js + TypeScript 
- **Database**: PostgreSQL with Drizzle ORM
- **Real-time**: WebSocket notifications
- **Authentication**: Passport.js with session management

## Key Features
- Multi-role system (Admin, Teacher, Student)
- Group/class management  
- Attendance tracking with automatic medal awards
- Student medal system (Gold/Silver/Bronze)
- Product marketplace for medal exchanges
- Real-time notifications
- Teacher assignment to groups

## Setup Status
✅ Dependencies installed
✅ Database schema migrated successfully
✅ Vite dev server configured for Replit (allowedHosts: true)
✅ Development workflow running on port 5000
✅ Deployment configuration set (autoscale)

## Development Server
- Runs on port 5000 with Express serving both API and frontend
- Uses `npm run dev` command
- Includes hot module replacement (HMR)
- WebSocket server on `/ws` path for real-time updates

## Known Issues
- Minor WebSocket connection issue in Replit environment (doesn't affect core functionality)
- Uses localhost fallback which may cause undefined in WebSocket URL in some cases

## Database Tables
- users (students, teachers, admins)
- groups (classes)
- group_students (enrollment)
- teacher_groups (assignments)
- attendance (with participants JSON)
- payments
- products
- purchases
- medal_awards

## Recent Changes
- Fresh import from GitHub repository
- Set up complete development environment
- Database successfully provisioned and migrated
- All TypeScript dependencies resolved