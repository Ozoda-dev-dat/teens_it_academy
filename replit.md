# Teens IT School Management System

## Overview
This is a full-stack web application for managing a programming school for teenagers. The system supports multiple user roles (admin, teachers, students) with features for attendance tracking, student management, reward systems with medals, and product purchases.

## Recent Changes
- **September 18, 2025**: Successfully imported from GitHub and configured for Replit environment
- Database setup completed with PostgreSQL
- Development workflow configured 
- Sample data seeded with admin user and demo content

## Project Architecture
- **Frontend**: React 18 with TypeScript, Vite build system, Tailwind CSS
- **Backend**: Express.js server with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Passport.js with local strategy and session management
- **UI Components**: Radix UI with custom styling

## User Roles & Features
- **Admin**: Full system management, user creation, group management
- **Teachers**: Attendance tracking, student progress monitoring 
- **Students**: Dashboard view, medal tracking, product purchases

## Database Schema
- Users (admin/teacher/student roles)
- Groups (classes/courses)
- Attendance tracking
- Medal awards system
- Products and purchases
- Payment tracking

## Development Setup
- Development server runs on port 5000
- Uses Vite for frontend development with HMR
- Express serves both API routes and frontend in development
- Database migrations handled via Drizzle Kit

## Demo Credentials
- **Administrator**: admin@mail.com / admin2233
- Students and teachers can be created through the admin panel

## Deployment Configuration
- **Type**: Autoscale deployment
- **Build**: `npm run build` (includes database push and frontend build)
- **Start**: `npm start` (production server)
- Serves both frontend and backend from single Node.js process

## Key Dependencies
- React ecosystem with Tanstack Query for state management
- Tailwind CSS with Radix UI components
- Drizzle ORM for type-safe database operations
- Express with security middleware
- Wouter for lightweight routing