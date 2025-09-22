# Overview

This is a comprehensive CRM (Customer Relationship Management) system for Teens IT School built as a full-stack web application. The system manages students, teachers, groups, attendance tracking, payment processing, and a gamification system with medals. It features role-based access control with separate dashboards for administrators, teachers, and students.

The application provides real-time updates through WebSocket connections and includes a medal system to motivate students. It supports attendance tracking, group management, product sales through a virtual store, and comprehensive administrative oversight.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React with TypeScript using Vite as the build tool
- **UI Library**: Shadcn/ui components with Radix UI primitives and Tailwind CSS for styling
- **State Management**: TanStack Query (React Query) for server state management and caching
- **Routing**: Wouter for lightweight client-side routing with role-based protected routes
- **Real-time Updates**: Custom WebSocket hook for live notifications and data updates

## Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **API Design**: RESTful API with role-based authentication and authorization
- **Session Management**: Express-session with PostgreSQL-backed session store for security
- **Authentication**: Passport.js with local strategy using scrypt for password hashing
- **Real-time Communication**: WebSocket server for broadcasting live updates to connected clients
- **File Structure**: Monorepo with shared schema and types between client and server

## Data Storage Solutions
- **Primary Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Database Provider**: Neon Database for managed PostgreSQL hosting
- **Schema Management**: Drizzle Kit for database migrations and schema evolution
- **Session Storage**: PostgreSQL-backed sessions using connect-pg-simple for security

## Authentication and Authorization
- **Multi-role System**: Three distinct roles (admin, teacher, student) with different access levels
- **Secure Sessions**: Server-side session validation with signed cookies
- **Role-based Access Control**: Endpoint protection based on user roles with secure authorization helpers
- **Password Security**: Scrypt-based password hashing with salt for enhanced security

## External Dependencies
- **Database**: Neon Database (managed PostgreSQL)
- **Email Service**: SendGrid for email notifications (configured but not actively used)
- **WebSocket**: Built-in WebSocket server for real-time features
- **UI Components**: Radix UI primitives for accessible component foundations
- **Charts**: Chart.js for data visualization and statistics
- **Deployment**: Vercel-compatible with serverless function support

## Key Features
- **Attendance Management**: Teachers can mark daily attendance with medal rewards for participation
- **Medal System**: Gamification with gold, silver, and bronze medals with monthly limits
- **Group Management**: Flexible group creation with teacher assignments and student enrollment
- **Payment Tracking**: Payment history and status monitoring for students
- **Product Store**: Virtual store where students can purchase items using earned medals
- **Real-time Updates**: Live notifications for all major system events
- **Responsive Design**: Mobile-first design with cross-device compatibility

## Security Considerations
- **Secure Session Management**: PostgreSQL-backed sessions replace vulnerable cookie-based authentication
- **Role-based Authorization**: Centralized authorization helpers prevent unauthorized access
- **Input Validation**: Zod schema validation on all API endpoints
- **SQL Injection Protection**: Drizzle ORM provides built-in protection against SQL injection
- **Environment Variables**: Sensitive configuration stored in environment variables