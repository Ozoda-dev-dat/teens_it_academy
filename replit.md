# Overview

This is a comprehensive school management system called "Teens IT School CRM" built with a full-stack TypeScript architecture. The system manages students, teachers, groups, attendance, payments, products, and a medal reward system. It features role-based authentication (admin, teacher, student) with different dashboards and capabilities for each user type. The application includes real-time notifications via WebSocket connections and supports both development and production deployments.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React with TypeScript using Vite as the build tool
- **UI Library**: shadcn/ui components built on Radix UI primitives with Tailwind CSS for styling
- **Routing**: wouter for lightweight client-side routing with protected routes based on user roles
- **State Management**: TanStack Query (React Query) for server state management and caching
- **Authentication**: Context-based auth provider with session management
- **Real-time Updates**: Custom WebSocket hook for live notifications and medal updates

## Backend Architecture
- **Runtime**: Node.js with Express.js server framework
- **Language**: TypeScript with ES modules
- **Session Management**: express-session with PostgreSQL session store for security
- **Authentication**: Passport.js with local strategy using scrypt for password hashing
- **API Structure**: RESTful API with organized route handlers for different resources
- **Real-time Communication**: WebSocket server for broadcasting notifications

## Database Layer
- **ORM**: Drizzle ORM with PostgreSQL dialect for type-safe database operations
- **Database**: PostgreSQL (configured for Neon database service)
- **Schema**: Comprehensive schema covering users, groups, attendance, payments, products, purchases, and medal awards
- **Migrations**: Drizzle Kit for database migrations and schema changes

## Authentication & Authorization
- **Password Security**: scrypt-based password hashing with salt
- **Session Security**: Signed cookies with PostgreSQL-backed session storage
- **Role-Based Access**: Three user roles (admin, teacher, student) with different permissions
- **API Security**: Secure authentication helpers that validate server-side sessions

## File Structure & Organization
- **Shared Types**: Common schema definitions in `/shared` directory
- **Client**: React frontend in `/client` with organized components and pages
- **Server**: Express backend in `/server` with modular route handlers
- **API Routes**: Serverless-ready API endpoints in `/api` directory for Vercel deployment
- **Library Code**: Shared utilities and database connections in `/lib` directory

## Key Features
- **Medal System**: Comprehensive reward system with gold, silver, and bronze medals
- **Attendance Tracking**: Daily attendance recording with real-time updates
- **Group Management**: Student-teacher-group assignments with flexible scheduling
- **Payment Processing**: Student payment tracking and management
- **Product Store**: Virtual store where students can purchase items with medals
- **Real-time Notifications**: Live updates across all connected clients
- **Avatar System**: Customizable user avatars with builder interface

## Development vs Production
- **Development**: Uses Vite dev server with HMR and development-specific plugins
- **Production**: Builds to static files served by Express with optimized asset handling
- **Environment Variables**: Separate configuration for database connections and session secrets

# External Dependencies

## Database Services
- **Neon Database**: PostgreSQL hosting service with SSL connections
- **connect-pg-simple**: PostgreSQL session store for Express sessions

## UI and Styling
- **Tailwind CSS**: Utility-first CSS framework with custom design system
- **Radix UI**: Accessible component primitives for complex UI elements
- **Lucide React**: Icon library for consistent iconography
- **Chart.js**: Data visualization for dashboard statistics

## Development Tools
- **Vite**: Fast build tool with TypeScript support and React plugin
- **ESBuild**: Fast bundler for production server builds
- **Drizzle Kit**: Database schema management and migration tools
- **TSX**: TypeScript execution for development and scripts

## Authentication & Security
- **Passport.js**: Authentication middleware with local strategy
- **cookie-signature**: Secure cookie signing for session management
- **crypto**: Node.js built-in module for password hashing

## Real-time Communication
- **ws**: WebSocket library for real-time notifications
- **TanStack Query**: Data fetching and caching with real-time updates

## Email Services (Optional)
- **SendGrid**: Email service integration for notifications (configured but not actively used)

## Deployment
- **Vercel**: Serverless deployment platform with API routes support
- **Node.js**: Server runtime with Express framework for production