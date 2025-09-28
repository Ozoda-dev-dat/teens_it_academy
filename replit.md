# Student Management System

## Project Overview
This is a comprehensive learning management system (LMS) built with Node.js, Express, React, and PostgreSQL. The system manages students, teachers, groups, attendance tracking, and a medal/reward system.

## Architecture
- **Frontend**: React with TypeScript, Vite, TailwindCSS, Radix UI components
- **Backend**: Express.js with TypeScript, authentication via Passport
- **Database**: PostgreSQL with Drizzle ORM
- **Real-time**: WebSocket notifications
- **Development**: Vite dev server for frontend, tsx for backend development

## Key Features
- Multi-role authentication (Admin, Teacher, Student)
- Student and teacher management
- Group/class organization
- Attendance tracking with automatic medal rewards
- Medal/reward system (Gold, Silver, Bronze)
- Real-time notifications
- Monthly attendance reports
- Product/purchase system using medals as currency

## User Roles
- **Admin**: Full system access, manage students, teachers, groups, attendance
- **Teacher**: Manage assigned groups, track attendance, view student progress
- **Student**: View personal dashboard, attendance history, medals earned

## Project Structure
- `client/` - React frontend application
- `server/` - Express.js backend API
- `shared/` - Shared TypeScript schemas and types
- `api/` - API route handlers
- `lib/` - Shared utility functions
- `migrations/` - Database migration files

## Development Setup
- Frontend runs on port 5000 via Vite
- Backend serves API routes and static files in production
- Database migrations handled via Drizzle Kit
- Real-time features via WebSocket connections

## Recent Changes
- Imported from GitHub repository
- Setting up for Replit environment

## User Preferences
- Uses Uzbek/Russian language interface
- Focuses on educational institution management
- Medal-based reward system for student engagement