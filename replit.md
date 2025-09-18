# Overview

This is a comprehensive CRM (Customer Relationship Management) system for Teens IT School built as a full-stack web application. The system provides role-based dashboards for administrators, teachers, and students with real-time updates and secure authentication. It manages student enrollment, group assignments, attendance tracking, medal rewards, and a virtual shop system where students can purchase items using earned medals.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS with custom design system using CSS variables
- **UI Components**: Radix UI primitives with custom shadcn/ui components
- **State Management**: TanStack Query for server state, React hooks for local state
- **Routing**: Wouter for client-side routing with protected routes
- **Real-time Updates**: WebSocket integration for live notifications
- **Build Tool**: Vite for development and production builds

## Backend Architecture
- **Runtime**: Node.js with Express.js server
- **Database ORM**: Drizzle ORM with PostgreSQL
- **Authentication**: Passport.js with session-based auth using PostgreSQL session store
- **API Design**: RESTful API with role-based access control
- **Security**: Secure session management, CSRF protection, input validation with Zod
- **Real-time**: WebSocket server for broadcasting live updates
- **Deployment**: Vercel serverless functions for API endpoints

## Database Schema
- **Users**: Role-based system (admin, teacher, student) with medal tracking
- **Groups**: Course/class management with scheduling
- **Group-Student Relations**: Many-to-many relationships for enrollment
- **Teacher-Group Assignments**: Teacher assignments to groups with status tracking
- **Attendance**: Daily attendance records with participant status tracking
- **Payments**: Student payment tracking for courses
- **Products**: Virtual shop items for medal exchange
- **Purchases**: Student purchase history
- **Medal Awards**: Tracking of medal awards with monthly limits

## Authentication & Authorization
- **Multi-role System**: Separate login flows for admin, teacher, and student roles
- **Session Management**: PostgreSQL-backed sessions with secure cookie handling
- **Role-based Access Control**: API endpoints protected by role requirements
- **Secure Session Validation**: Server-side session verification replacing vulnerable client-side cookies

## Key Features
- **Admin Dashboard**: Complete system management, user creation, group management, attendance oversight
- **Teacher Dashboard**: Group management, real-time attendance marking, student progress tracking
- **Student Dashboard**: Personal profile, medal tracking, virtual shop for purchasing items
- **Real-time Updates**: Live notifications for attendance, medal awards, and system updates
- **Medal System**: Automatic bronze medal awards for attendance with monthly limits
- **Avatar System**: Custom avatar builder for student profiles
- **Attendance Tracking**: Time-limited attendance sessions for teachers

# External Dependencies

## Database
- **PostgreSQL**: Primary database with connection pooling
- **@neondatabase/serverless**: Serverless PostgreSQL driver

## Authentication & Security
- **Passport.js**: Authentication middleware
- **connect-pg-simple**: PostgreSQL session store
- **cookie-signature**: Signed cookie verification
- **bcrypt**: Password hashing (via scrypt)

## UI Framework
- **@radix-ui/***: Accessible UI component primitives
- **@tanstack/react-query**: Server state management
- **chart.js**: Data visualization for admin dashboard

## Email Services
- **@sendgrid/mail**: Email notifications and communications

## Development Tools
- **tsx**: TypeScript execution for development
- **esbuild**: Production bundling
- **drizzle-kit**: Database schema management and migrations

## WebSocket
- **ws**: WebSocket server for real-time updates

## Validation
- **zod**: Runtime type validation for API requests