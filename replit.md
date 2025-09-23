# Teens IT School CRM System

## Overview

This is a comprehensive Customer Relationship Management (CRM) system designed for "Teens IT School", an educational institution that offers programming courses to teenagers. The system manages students, teachers, groups, attendance tracking, payments, and a gamified medal system to motivate students. It features role-based access control with three distinct user types: administrators, teachers, and students, each having their own dedicated dashboard and functionality.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript using Vite for development and build tooling
- **UI Components**: Radix UI components with shadcn/ui component library for consistent design
- **Styling**: Tailwind CSS with custom CSS variables for theming
- **State Management**: TanStack Query (React Query) for server state management and caching
- **Routing**: Wouter for lightweight client-side routing
- **Authentication**: Context-based authentication with role-based protected routes
- **Real-time Updates**: WebSocket integration for live notifications and updates

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **API Design**: RESTful API with role-based authorization middleware
- **Session Management**: Express-session with PostgreSQL session store for security
- **Authentication**: Passport.js with local strategy and secure password hashing using scrypt
- **Real-time Communication**: WebSocket server for broadcasting live updates
- **File Structure**: Monorepo structure with shared schema definitions

### Database Architecture
- **Primary Database**: PostgreSQL with Drizzle ORM
- **Connection**: Neon serverless PostgreSQL for cloud hosting
- **Schema Management**: Drizzle Kit for migrations and schema evolution
- **Session Storage**: PostgreSQL-backed session store for secure authentication
- **Key Tables**:
  - Users (students, teachers, admins with role-based access)
  - Groups (course groups with scheduling information)
  - Group-Student relationships (many-to-many)
  - Teacher-Group assignments with status tracking
  - Attendance records with participant status
  - Payment tracking for student fees
  - Product catalog and purchase history
  - Medal awards system for gamification

### Authentication & Authorization
- **Session-Based Authentication**: Secure server-side sessions with PostgreSQL storage
- **Password Security**: Scrypt hashing with salt for password storage
- **Role-Based Access Control**: Three distinct roles (admin, teacher, student) with granular permissions
- **API Security**: Middleware functions for route protection and user authorization
- **Cross-Platform Login**: Separate login endpoints for different user roles

### External Dependencies

- **Database**: Neon PostgreSQL serverless database for data persistence
- **Email Service**: SendGrid integration for email notifications (configured but not actively used)
- **UI Components**: Radix UI primitives for accessible component foundation
- **Charts**: Chart.js for data visualization in admin dashboard
- **Development Tools**: 
  - Replit integration for development environment
  - TypeScript for type safety across the entire stack
  - ESBuild for production bundling