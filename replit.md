# Overview

This is a full-stack Customer Relations Management (CRM) system for "Teens IT School" built with React, Express.js, and PostgreSQL. The system manages students, teachers, groups, attendance tracking, payments, and product sales. It features role-based authentication with separate dashboards for admins, teachers, and students, including real-time attendance tracking and a gamified medal system.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for client-side routing with role-based protected routes
- **State Management**: TanStack Query (React Query) for server state management
- **UI Framework**: Shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with custom design system variables
- **Authentication**: Context-based auth provider with JWT-like session handling

## Backend Architecture
- **Runtime**: Node.js with Express.js server
- **Authentication**: Passport.js with local strategy and express-session
- **Session Storage**: PostgreSQL-based session store using connect-pg-simple
- **Password Security**: Scrypt-based password hashing with salt
- **API Design**: RESTful endpoints with role-based middleware protection
- **Deployment**: Dual deployment support (traditional Express + Vercel serverless)

## Database Design
- **ORM**: Drizzle ORM with PostgreSQL adapter
- **Connection**: Connection pooling optimized for serverless environments
- **Schema**: Relational design with separate tables for users, teachers, groups, attendance, payments, products, and purchases
- **Relationships**: Foreign key constraints with cascade delete for data integrity
- **Session Management**: Server-side session storage in PostgreSQL

## Security Architecture
- **Authentication**: Multi-role system (admin, teacher, student) with secure session validation
- **Session Security**: Signed cookies with server-side validation against PostgreSQL session store
- **Password Security**: Scrypt hashing algorithm with cryptographically secure salt generation
- **Authorization**: Role-based middleware protecting sensitive endpoints
- **CORS**: Configured for cross-origin requests with credentials support

## Key Features
- **Attendance System**: Real-time attendance tracking with 15-minute time windows
- **Medal System**: Gamified achievement tracking for student engagement
- **Multi-Role Dashboards**: Specialized interfaces for admins, teachers, and students
- **Product Management**: E-commerce functionality for school merchandise
- **Group Management**: Flexible assignment of students to groups and teachers to groups

# External Dependencies

## Core Dependencies
- **@neondatabase/serverless**: PostgreSQL database connection for Neon cloud database
- **@sendgrid/mail**: Email service integration for notifications
- **@vercel/node**: Serverless function support for Vercel deployment
- **drizzle-orm**: Type-safe ORM for PostgreSQL operations
- **express-session**: Session management middleware
- **passport**: Authentication middleware framework
- **connect-pg-simple**: PostgreSQL session store adapter

## UI and Frontend Libraries
- **@tanstack/react-query**: Server state management and caching
- **@radix-ui/***: Headless UI component primitives for accessibility
- **tailwindcss**: Utility-first CSS framework
- **wouter**: Lightweight client-side routing
- **react-hook-form**: Form handling with validation
- **@hookform/resolvers**: Form validation resolvers

## Development and Build Tools
- **vite**: Modern build tool and development server
- **tsx**: TypeScript execution for development
- **esbuild**: Fast JavaScript bundler for production builds
- **@replit/vite-plugin-runtime-error-modal**: Development error handling
- **@replit/vite-plugin-cartographer**: Development tooling for Replit environment