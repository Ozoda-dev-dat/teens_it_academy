# Overview

This is a comprehensive CRM (Customer Relationship Management) system designed for Teens IT School, built as a full-stack web application. The system manages students, teachers, groups, attendance tracking, product sales, and administrative functions through role-based access control. It features separate dashboards for administrators, teachers, and students, with real-time attendance tracking, medal/achievement systems, and an integrated shop for purchasing products.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React 18 with TypeScript for type safety
- **UI Components**: Radix UI primitives with shadcn/ui component library for consistent design
- **Styling**: Tailwind CSS with custom design tokens and CSS variables
- **State Management**: TanStack Query (React Query) for server state management and caching
- **Routing**: Wouter for lightweight client-side routing
- **Authentication**: Context-based auth provider with role-based route protection

## Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript for both client and server
- **API Design**: RESTful API with role-based authentication middleware
- **Authentication**: Passport.js with local strategy and express-session
- **Session Management**: PostgreSQL-backed sessions using connect-pg-simple
- **Password Security**: Scrypt-based password hashing with salt
- **Role-Based Access**: Three-tier system (admin, teacher, student) with middleware guards

## Data Storage Solutions
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Connection**: Connection pooling optimized for serverless environments
- **Schema**: Relational design with proper foreign key constraints and cascading deletes
- **Migrations**: Drizzle-kit for database schema management and migrations
- **Session Store**: PostgreSQL-backed session storage for security

## Key Data Models
- **Users**: Unified user table with role-based differentiation (admin/teacher/student)
- **Groups**: Course/class management with scheduling information
- **Attendance**: Time-tracked attendance with status (arrived/late/absent)
- **Products**: Shop items with pricing and availability
- **Purchases**: Transaction records linking students to products
- **Relationships**: Many-to-many relationships between students-groups and teachers-groups

## Security & Authentication
- **Session Security**: Signed cookies with server-side session validation
- **Password Security**: Scrypt hashing with unique salts per password
- **CSRF Protection**: SameSite cookie attributes and origin validation
- **Role Authorization**: Middleware-based access control for all API endpoints
- **Input Validation**: Zod schema validation for all API inputs

## External Dependencies

### Database & ORM
- **@neondatabase/serverless**: Serverless PostgreSQL connection driver
- **drizzle-orm**: Type-safe ORM with PostgreSQL adapter
- **drizzle-kit**: Database migration and schema management tools
- **pg**: PostgreSQL client for Node.js

### Authentication & Security
- **passport**: Authentication middleware framework
- **passport-local**: Local username/password authentication strategy
- **express-session**: Session management middleware
- **connect-pg-simple**: PostgreSQL session store adapter
- **cookie-signature**: Cookie signing utilities

### UI Framework & Components
- **@radix-ui/***: Comprehensive set of accessible UI primitives
- **@tanstack/react-query**: Server state management and caching
- **tailwindcss**: Utility-first CSS framework
- **class-variance-authority**: Component variant management
- **clsx**: Conditional className utility

### Development & Build Tools
- **vite**: Fast build tool and development server
- **tsx**: TypeScript execution engine for development
- **esbuild**: Fast JavaScript bundler for production builds
- **@vercel/node**: Serverless function utilities for deployment