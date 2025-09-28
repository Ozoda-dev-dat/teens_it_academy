# Overview

This is a comprehensive CRM (Customer Relationship Management) system designed for Teens IT School, built as a full-stack web application. The system manages students, teachers, groups, attendance tracking, payments, and a medal-based reward system. It features role-based authentication with separate dashboards for administrators, teachers, and students, real-time updates via WebSocket connections, and a PostgreSQL database for data persistence.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React with TypeScript using Vite as the build tool
- **UI Components**: Shadcn/ui component library with Radix UI primitives
- **Styling**: Tailwind CSS with custom design tokens and CSS variables
- **State Management**: TanStack Query (React Query) for server state management
- **Routing**: Wouter for lightweight client-side routing
- **Forms**: React Hook Form with Zod validation
- **Real-time Updates**: Custom WebSocket hook for live notifications and data synchronization

## Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **Database ORM**: Drizzle ORM for type-safe database operations
- **Authentication**: Passport.js with local strategy and session-based authentication
- **Session Storage**: PostgreSQL-backed sessions using connect-pg-simple
- **API Design**: RESTful API with role-based access control
- **Real-time Communication**: WebSocket server for live updates

## Database Design
- **Primary Database**: PostgreSQL with Neon serverless hosting
- **Schema Management**: Drizzle Kit for migrations and schema definitions
- **Key Tables**: 
  - Users (students, teachers, admins)
  - Groups (class management)
  - Group-Student relationships (many-to-many)
  - Teacher-Group assignments
  - Attendance records with JSON participant data
  - Payments and Products for e-commerce functionality
  - Medal awards tracking system

## Authentication & Authorization
- **Session Management**: Server-side sessions stored in PostgreSQL
- **Password Security**: Scrypt hashing with salt
- **Role-based Access**: Three-tier system (admin, teacher, student)
- **API Protection**: Middleware-based authentication checks
- **Secure Cookies**: HttpOnly, signed session cookies

## Deployment Architecture
- **Development**: Replit-optimized with hot module replacement
- **Production**: Vercel serverless functions for API endpoints
- **Static Assets**: Vite build output served from dist/public
- **Environment**: Separate configurations for development and production

# External Dependencies

## Database Services
- **Neon**: Serverless PostgreSQL hosting with connection pooling
- **Connection Management**: PostgreSQL connection pools optimized for serverless environments

## Development Tools
- **Replit**: Primary development environment with live coding features
- **Vite Plugins**: Runtime error overlay and cartographer for Replit integration

## UI Libraries
- **Radix UI**: Headless component primitives for accessibility
- **Lucide React**: Icon library for consistent iconography
- **Chart.js**: Data visualization for admin analytics
- **TailwindCSS**: Utility-first CSS framework

## Third-party Services
- **SendGrid**: Email service integration for notifications (configured but not actively used)
- **WebSocket**: Real-time communication for live updates across the application

## Build & Deployment
- **Vercel**: Serverless function hosting for production API endpoints
- **esbuild**: Fast JavaScript bundler for server-side code
- **PostCSS**: CSS processing with Tailwind and Autoprefixer