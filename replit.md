# Overview

This is a comprehensive school management CRM system called "Teens IT School" built with React, Node.js/Express, and PostgreSQL. The system supports three user roles (admin, teacher, student) with role-based dashboards and functionality. Key features include student/teacher management, group organization, attendance tracking, medal awarding system, product purchasing, and payment management. The application uses modern web technologies including React with TypeScript, Drizzle ORM for database operations, shadcn/ui components, and TailwindCSS for styling.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React 18 with TypeScript and Vite for build tooling
- **UI Library**: shadcn/ui components built on Radix UI primitives
- **Styling**: TailwindCSS with custom design tokens and responsive design
- **State Management**: TanStack Query for server state and React Context for authentication
- **Routing**: Wouter for client-side routing with role-based protected routes
- **Forms**: React Hook Form with Zod validation schemas

## Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **API Design**: RESTful APIs with role-based access control
- **Authentication**: Passport.js with local strategy and secure session management
- **Session Storage**: PostgreSQL-backed session store using connect-pg-simple
- **Validation**: Zod schemas shared between client and server
- **Security**: Secure cookie handling, CSRF protection, and input sanitization

## Data Storage
- **Primary Database**: PostgreSQL with connection pooling
- **ORM**: Drizzle ORM with TypeScript-first schema definitions
- **Migrations**: Database schema versioning with drizzle-kit
- **Session Store**: PostgreSQL table-based session persistence
- **File Storage**: Local file system for static assets

## Authentication & Authorization
- **Strategy**: Session-based authentication with signed cookies
- **Roles**: Three-tier system (admin, teacher, student) with granular permissions
- **Session Security**: Server-side session validation with PostgreSQL storage
- **API Protection**: Role-based middleware for endpoint access control
- **Password Security**: Scrypt-based password hashing with salt

## External Dependencies
- **Database**: PostgreSQL (Neon serverless database for cloud deployment)
- **Email Service**: SendGrid for transactional emails
- **Deployment**: Vercel serverless functions for production hosting
- **Development**: Replit environment with hot reloading and debugging tools
- **UI Components**: Radix UI primitives for accessible component foundations
- **Charts**: Chart.js for data visualization and analytics dashboards