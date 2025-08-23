# Teen IT Academy CRM

## Overview

This is a fully automated Customer Relationship Management (CRM) system designed specifically for a Teen IT Academy. The application provides separate interfaces for administrators to manage students, groups, attendance, and payments, while students can view their profiles, medals, and purchase items from a marketplace. The system features a kid-friendly design with bright colors, animations, and an engaging user interface.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript for type safety
- **Styling**: TailwindCSS with custom CSS variables for theming, shadcn/ui component library for consistent UI components
- **State Management**: TanStack Query (React Query) for server state management and caching
- **Routing**: Wouter for lightweight client-side routing
- **Authentication**: Context-based auth provider with role-based access control
- **Form Handling**: React Hook Form with Zod validation schemas
- **UI Components**: Extensive use of Radix UI primitives through shadcn/ui for accessibility

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **Authentication**: Passport.js with local strategy, session-based auth using express-session
- **Password Security**: Node.js crypto module with scrypt for password hashing
- **API Design**: RESTful endpoints with role-based middleware protection
- **Error Handling**: Centralized error handling middleware with proper HTTP status codes

### Data Storage Solutions
- **Database**: PostgreSQL with Neon serverless driver
- **ORM**: Drizzle ORM for type-safe database operations
- **Schema Management**: Drizzle Kit for migrations and schema synchronization
- **Session Storage**: PostgreSQL-backed session storage using connect-pg-simple

### Authentication and Authorization
- **Strategy**: Session-based authentication with Passport.js
- **Password Security**: Scrypt-based password hashing with salt
- **Role System**: Two-tier role system (admin/student) with middleware protection
- **Session Management**: Secure session storage in PostgreSQL with configurable expiration

### Database Schema Design
- **Users Table**: Stores user credentials, profile info, and medal counts as JSONB
- **Groups Table**: Manages class groups with JSONB schedule storage
- **Group Students**: Junction table for many-to-many student-group relationships
- **Attendance**: Tracks attendance with participant arrays stored as JSONB
- **Payments**: Records payment history and class attendance counts
- **Products**: Marketplace items with medal pricing
- **Purchases**: Transaction records linking students to purchased products

## External Dependencies

### Core Framework Dependencies
- **@neondatabase/serverless**: PostgreSQL serverless database connection
- **drizzle-orm**: Type-safe ORM for database operations
- **express**: Web application framework
- **passport**: Authentication middleware
- **@tanstack/react-query**: Server state management

### UI and Styling Dependencies
- **@radix-ui/***: Comprehensive set of accessible UI primitives
- **tailwindcss**: Utility-first CSS framework
- **class-variance-authority**: CSS-in-TS utility for component variants
- **lucide-react**: Icon library

### Development and Build Tools
- **vite**: Fast build tool and dev server
- **typescript**: Type checking and compilation
- **tsx**: TypeScript execution for development
- **esbuild**: Fast bundling for production builds

### Email Integration
- **@sendgrid/mail**: Email service integration for automated notifications

### Data Visualization
- **chart.js**: Charts and graphs for admin dashboard analytics
- **react-chartjs-2**: React wrapper for Chart.js

The application uses a monorepo structure with shared TypeScript schemas between client and server, ensuring type safety across the full stack. The build process supports both development with hot reloading and production deployment with optimized bundles.