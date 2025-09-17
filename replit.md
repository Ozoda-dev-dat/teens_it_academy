# School Management System

## Overview
This is a full-stack school management application built for Teens IT School. It manages students, teachers, groups, attendance, and a medal reward system.

## Tech Stack
- **Frontend**: React + TypeScript with Vite
- **Backend**: Express.js + TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **UI**: Tailwind CSS with Radix UI components
- **Authentication**: Passport.js with sessions

## Project Structure
- `client/` - React frontend application
- `server/` - Express backend server
- `api/` - Vercel-style API routes
- `shared/` - Shared schemas and types
- `lib/` - Shared utilities and configurations

## Key Features
- **User Management**: Students, teachers, and admin roles
- **Group Management**: Teachers assigned to groups, students enrolled in groups
- **Medal System**: Teachers can award medals (gold, silver, bronze) to their students with monthly limits
- **Attendance Tracking**: Track student attendance per group
- **Payment Management**: Track student payments and classes attended
- **Product Store**: Students can purchase items using medals

## Medal System Rules
- **Monthly Limits per Student**: 
  - Gold: 2 medals max
  - Silver: 2 medals max  
  - Bronze: 48 medals max
- Teachers can only award medals to students in groups they're assigned to
- All medal awards are tracked individually for audit purposes

## Development
- Run `npm run dev` to start development server on port 5000
- Database migrations: `npm run db:push`
- Seed data: `npm run seed`

## Production Deployment
- Build: `npm run build`
- Start: `npm start`
- Serves on port 5000 (frontend + API)

## Recent Changes
- Fixed Vite configuration for Replit proxy compatibility
- Removed database URL logging for security
- Configured deployment settings for autoscale deployment
- Set up development workflow

## Current State
- Application is fully functional and running
- Database schema is properly migrated
- Medal system with monthly limits is implemented
- Teacher-student assignments work through group membership