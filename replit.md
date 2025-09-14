# Education Management System

## Overview
This is a full-stack education management application built with Express.js, React, and PostgreSQL. The application manages students, teachers, groups, attendance tracking, and a medal-based reward system.

## Recent Changes (September 14, 2025)
- Fixed TypeScript compilation errors to make the application Replit-compatible
- Configured PostgreSQL database with Drizzle ORM
- Set up development workflow on port 5000
- Configured deployment settings for Replit's autoscale platform
- Updated component types for better React compatibility
- Implemented proper authentication type safety

## Project Architecture

### Backend (Express.js + TypeScript)
- **Server**: Express.js server with session-based authentication using Passport.js
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations  
- **API Routes**: RESTful API for user management, groups, attendance, and products
- **Authentication**: Secure password hashing with scrypt and session management

### Frontend (React + Vite + TypeScript)
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite with hot module replacement
- **UI Components**: Radix UI components with Tailwind CSS styling
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack React Query for server state
- **Forms**: React Hook Form with Zod validation

### Database Schema
- **Users**: Student and admin user management with avatar customization
- **Teachers**: Separate teacher management system
- **Groups**: Class/group organization with student assignments
- **Attendance**: Time-based attendance tracking with status management
- **Products**: Medal-based reward system with purchasable items
- **Payments**: Financial tracking for classes and purchases

## Development Setup
1. Database is automatically configured via Replit's PostgreSQL integration
2. Dependencies installed with `npm install`
3. Database schema synced with `npm run db:push`
4. Development server runs with `npm run dev` on port 5000

## Deployment Configuration
- **Target**: Autoscale (stateless web application)
- **Build**: `npm run build` (compiles TypeScript and bundles frontend)
- **Runtime**: `npm start` (production Express.js server)
- **Port**: 5000 (only non-firewalled port on Replit)

## User Preferences
- TypeScript strict mode enabled for type safety
- Component-based architecture with reusable UI components
- Security-first approach with password-less user serialization
- Responsive design with mobile-friendly interfaces

## Technical Notes
- Frontend configured with `allowedHosts: true` for Replit proxy compatibility
- CORS and trust proxy settings configured for cloud deployment
- Health check endpoint available at `/health`
- Comprehensive error handling and logging throughout the application