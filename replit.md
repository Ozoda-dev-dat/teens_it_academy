# Overview

This is a comprehensive Student Management System (CRM) for Teens IT School built with React, Express.js, and PostgreSQL. The system supports three user roles - students, teachers, and administrators - each with tailored dashboards and functionality. The application manages student information, class groups, attendance tracking, teacher assignments, a medal reward system, and an integrated shop for purchasing items with medals.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
The client-side is built with modern React using TypeScript and follows a component-based architecture:
- **UI Framework**: React with TypeScript, using Vite as the build tool
- **Styling**: Tailwind CSS with shadcn/ui component library for consistent design
- **State Management**: TanStack Query (React Query) for server state management and caching
- **Routing**: Wouter for lightweight client-side routing
- **Authentication**: Context-based authentication with role-based route protection

## Backend Architecture
The server follows a dual deployment approach supporting both traditional Express.js and serverless Vercel functions:
- **Express Server**: Traditional Node.js/Express setup for development and self-hosting
- **Serverless API**: Vercel Functions for production deployment in `/api` directory
- **Database ORM**: Drizzle ORM with PostgreSQL for type-safe database operations
- **Authentication**: Passport.js with express-session for secure session management
- **Session Storage**: PostgreSQL-backed sessions using connect-pg-simple

## Database Design
PostgreSQL database with well-structured relationships:
- **Users Table**: Unified table for students, teachers, and admins with role-based access
- **Groups**: Class/course management with flexible scheduling
- **Group-Student Relations**: Many-to-many relationship between students and groups
- **Teacher-Group Relations**: Assignment system tracking teacher responsibilities
- **Attendance**: Daily attendance records with participant status tracking
- **Medal System**: JSON fields storing gold/silver/bronze medal counts
- **Products & Purchases**: E-commerce functionality for medal-based transactions

## Authentication & Authorization
Secure, role-based authentication system:
- **Session Management**: Server-side sessions stored in PostgreSQL
- **Password Security**: Scrypt-based password hashing with salt
- **Role-Based Access**: Three distinct user roles with appropriate permissions
- **API Protection**: Middleware-based authentication for all sensitive endpoints

## Key Features by Role

### Admin Dashboard
- Complete user management (students, teachers, admins)
- Group creation and management
- Teacher-group assignments
- Attendance overview and analytics
- Medal management system
- Product catalog management
- System statistics and reporting

### Teacher Dashboard
- View assigned groups and student lists
- Real-time attendance marking (restricted to current date)
- Student medal awarding capabilities
- Group-specific analytics and history

### Student Dashboard
- Personal profile with avatar customization
- Medal balance and achievement tracking
- Shop interface for purchasing items with medals
- Purchase history and account overview

## External Dependencies

### Core Framework Dependencies
- **@neondatabase/serverless**: PostgreSQL database connectivity for serverless environments
- **@radix-ui/react-***: Comprehensive UI component primitives for accessible design
- **@tanstack/react-query**: Server state management and caching
- **@sendgrid/mail**: Email service integration for notifications
- **@vercel/node**: Serverless function runtime for Vercel deployment

### Database & ORM
- **drizzle-orm**: Type-safe PostgreSQL ORM with excellent TypeScript support
- **drizzle-kit**: Database migration and schema management tools
- **pg**: Native PostgreSQL driver for Node.js

### Authentication & Security
- **passport**: Authentication middleware with local strategy
- **express-session**: Secure session management
- **connect-pg-simple**: PostgreSQL session store
- **cookie-signature**: Session cookie signing for security

### Development & Build Tools
- **vite**: Fast build tool with hot module replacement
- **tsx**: TypeScript execution for development
- **esbuild**: Fast JavaScript bundler for production builds
- **tailwindcss**: Utility-first CSS framework