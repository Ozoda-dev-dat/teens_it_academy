# Teens IT Academy CRM

## Overview

This is a fully automated Customer Relationship Management (CRM) system designed for a Teen IT Academy. The system features a colorful, kid-friendly interface with space/tech themes and serves three main user types: administrators, teachers, and students. The CRM handles student management, group organization, attendance tracking, fee management, medals/rewards system, and an internal marketplace where students can purchase items using earned medals.

The application is built as a full-stack web application with a React frontend and Express.js backend, using PostgreSQL for data persistence and Drizzle ORM for database operations.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack Query (React Query) for server state management
- **UI Components**: Radix UI primitives with shadcn/ui components
- **Styling**: Tailwind CSS with custom design tokens for the teen-friendly theme
- **Build Tool**: Vite for development and production builds
- **Authentication**: Context-based auth provider with protected routes

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Authentication**: Passport.js with Local Strategy and express-session
- **Session Storage**: PostgreSQL-backed sessions using connect-pg-simple
- **Password Hashing**: Node.js crypto module with scrypt
- **API Design**: RESTful API endpoints with role-based access control
- **Error Handling**: Centralized error handling with appropriate HTTP status codes

### Database Schema
The system uses PostgreSQL with the following main entities:
- **Users**: Stores admin, teacher, and student accounts with roles, credentials, and medal counts
- **Groups**: Programming classes/groups with schedules and descriptions
- **GroupStudents**: Many-to-many relationship between students and groups
- **TeacherGroups**: Many-to-many relationship between teachers and groups
- **Attendance**: Daily attendance records with participant status tracking
- **Payments**: Fee tracking system linking students to payment records
- **Products**: Marketplace items with medal-based pricing
- **Purchases**: Student purchase history

### Authentication and Authorization
- **Session-based authentication** using PostgreSQL-backed sessions for security
- **Role-based access control** with three roles: admin, teacher, student
- **Protected API endpoints** with middleware for role verification
- **Secure password handling** with salted hashing using scrypt

### Key Features Implementation
- **Dashboard System**: Role-specific dashboards with relevant metrics and actions
- **Attendance Management**: Teachers can mark attendance with time-limited sessions
- **Medal System**: Automated reward system with visual medal displays
- **Marketplace**: Internal shop where students spend medals on virtual items
- **Avatar System**: Customizable student avatars with builder interface
- **Real-time UI**: Optimistic updates and toast notifications for user feedback

## External Dependencies

### Core Framework Dependencies
- **@neondatabase/serverless**: Neon PostgreSQL serverless driver for database connections
- **drizzle-orm**: TypeScript ORM for database operations and migrations
- **express**: Web application framework for the backend API
- **passport**: Authentication middleware with local strategy support

### UI and Styling
- **@radix-ui/***: Comprehensive set of accessible UI primitives
- **tailwindcss**: Utility-first CSS framework for styling
- **class-variance-authority**: For creating consistent component variants
- **clsx**: Conditional className utility

### State Management and API
- **@tanstack/react-query**: Server state management and caching
- **@hookform/resolvers**: Form validation integration
- **zod**: TypeScript-first schema validation

### Development and Build Tools
- **vite**: Fast build tool and development server
- **tsx**: TypeScript execution for development scripts
- **esbuild**: Fast bundler for production builds
- **@replit/vite-plugin-runtime-error-modal**: Development error overlay

### Authentication and Security
- **connect-pg-simple**: PostgreSQL session store for express-session
- **passport-local**: Local username/password authentication strategy
- **cookie-signature**: Signed cookie support for session security

### Deployment Platform
- **@vercel/node**: Vercel platform integration for serverless deployment
- The application is configured for both local development and Vercel deployment