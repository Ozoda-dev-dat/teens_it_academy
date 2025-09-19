# Replit.md

## Overview

This is a full-stack web application for "Teens IT School" - a comprehensive CRM system for managing IT education. The application is built with a modern TypeScript stack, featuring separate dashboards for administrators, teachers, and students. The system manages users, groups, attendance tracking, medal rewards, product purchases, and real-time notifications.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query (React Query) for server state management
- **UI Components**: Radix UI primitives with custom components built on top
- **Styling**: Tailwind CSS with CSS variables for theming
- **Form Handling**: React Hook Form with Zod validation

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Database ORM**: Drizzle ORM for type-safe database operations
- **API Design**: RESTful API with role-based access control
- **Authentication**: Passport.js with session-based authentication using PostgreSQL session store
- **Real-time Communication**: WebSocket server for live notifications and updates
- **File Structure**: Monorepo structure with shared schema definitions

### Database Design
- **Primary Database**: PostgreSQL with connection pooling
- **Session Store**: PostgreSQL-backed sessions via connect-pg-simple
- **Schema Management**: Drizzle migrations with type-safe schema definitions
- **Core Entities**: Users (with roles), Groups, Attendance, Payments, Products, Purchases, Medal Awards
- **Relationships**: Many-to-many relationships between users and groups, comprehensive foreign key constraints

### Authentication & Authorization
- **Session Management**: Server-side sessions stored in PostgreSQL with signed cookies
- **Password Security**: Scrypt-based password hashing with salt
- **Role-Based Access**: Three distinct roles (admin, teacher, student) with different permission levels
- **Protected Routes**: Client-side route protection based on user role
- **API Security**: Secure session validation for all API endpoints

### Real-time Features
- **WebSocket Integration**: Live notifications for attendance, medals, and system updates
- **Automatic Polling**: Client-side polling for real-time medal updates
- **Broadcast System**: Server-side notification broadcasting to connected clients

### Deployment Configuration
- **Development**: Vite dev server with HMR and runtime error overlays
- **Production**: Static file serving with Express.js
- **Build Process**: TypeScript compilation, Vite bundling, and esbuild for server code
- **Environment**: Replit-optimized with cartographer integration for development

## External Dependencies

### Core Runtime Dependencies
- **Database**: PostgreSQL (configured via DATABASE_URL environment variable)
- **Email Service**: SendGrid for transactional emails (@sendgrid/mail)
- **Session Secret**: Required SESSION_SECRET environment variable for secure sessions

### UI Component Libraries
- **Radix UI**: Complete set of unstyled, accessible UI components
- **Chart.js**: Data visualization for analytics and reporting
- **Lucide React**: Comprehensive icon library
- **CMDK**: Command palette and search functionality

### Development Tools
- **TypeScript**: Full type safety across frontend, backend, and shared code
- **Drizzle Kit**: Database migrations and schema management
- **PostCSS**: CSS processing with Tailwind CSS
- **ESBuild**: Fast TypeScript compilation for production builds

### Real-time & State Management
- **TanStack Query**: Server state management with caching and synchronization
- **WebSocket (ws)**: Real-time bidirectional communication
- **React Hook Form**: Form state management with validation

### Security & Authentication
- **Passport.js**: Authentication middleware with local strategy
- **Cookie Signature**: Signed cookie validation
- **Connect PG Simple**: PostgreSQL session store integration
- **Crypto**: Node.js crypto module for password hashing