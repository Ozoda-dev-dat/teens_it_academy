# Teens IT School CRM System

## Overview

This is a comprehensive CRM (Customer Relationship Management) system built specifically for Teens IT School. It manages students, teachers, groups, attendance tracking, payments, and a medal-based reward system. The application serves three distinct user roles: administrators (full system access), teachers (group management and attendance), and students (dashboard and store access).

The system features real-time updates via WebSocket connections, secure session management, and a complete academic management workflow from student enrollment to progress tracking through a gamified medal system.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript using Vite as the build tool
- **UI Components**: Shadcn/ui component library with Radix UI primitives for accessibility
- **Styling**: Tailwind CSS for utility-first styling with custom design tokens
- **State Management**: TanStack Query (React Query) for server state and caching
- **Routing**: Wouter for lightweight client-side routing
- **Form Handling**: React Hook Form with Zod validation schemas

### Backend Architecture
- **Runtime**: Node.js with Express.js server framework
- **API Design**: RESTful API with role-based authorization middleware
- **Authentication**: Passport.js with session-based authentication using PostgreSQL session store
- **Real-time Features**: WebSocket server for live notifications and updates
- **Type Safety**: Full TypeScript coverage with shared schemas between client and server

### Database Layer
- **ORM**: Drizzle ORM for type-safe database operations
- **Database**: PostgreSQL with connection pooling for serverless optimization
- **Migrations**: Drizzle Kit for schema migrations and database management
- **Session Storage**: PostgreSQL-backed session store using connect-pg-simple

### Authentication & Authorization
- **Session Management**: Secure server-side sessions with signed cookies and PostgreSQL storage
- **Password Security**: Scrypt-based password hashing with salt for enhanced security
- **Role-Based Access**: Three-tier authorization system (admin/teacher/student) with route-level protection
- **API Security**: Secure middleware functions for validating user roles and permissions

### Real-time Communication
- **WebSocket Integration**: Custom notification service for broadcasting real-time updates
- **Event Types**: Comprehensive notification system for user actions, attendance updates, and medal awards
- **Client Reconnection**: Automatic reconnection logic with exponential backoff for reliability

### Medal System Architecture
- **Gamification Engine**: Bronze/silver/gold medal system with monthly limits and atomic transactions
- **Award Mechanics**: Automatic bronze medals for attendance, manual awards for achievements
- **Store Integration**: Medal-based virtual currency system for purchasing rewards

## External Dependencies

### Database Services
- **Neon Database**: Serverless PostgreSQL hosting with automatic scaling and branching
- **Connection Pool**: Optimized for serverless functions with connection limits and timeouts

### Email Services
- **SendGrid**: Transactional email service for notifications and system communications (configured but not actively used in current implementation)

### UI Component Libraries
- **Radix UI**: Headless, accessible UI primitives for complex components like modals, dropdowns, and form controls
- **Shadcn/ui**: Pre-built component library built on top of Radix UI with consistent styling

### Development Tools
- **Drizzle Kit**: Database schema management and migration tools
- **Replit Integration**: Development environment optimization with runtime error overlays and cartographer tooling
- **ESBuild**: Fast bundling for production builds with tree-shaking optimization

### Runtime & Hosting
- **Vercel Functions**: Serverless API endpoints optimized for edge deployment
- **WebSocket Server**: Integrated with HTTP server for real-time communication capabilities
- **Session Store**: PostgreSQL-backed session persistence for secure authentication state