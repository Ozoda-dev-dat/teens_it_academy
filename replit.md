# Overview

This is a comprehensive Customer Relationship Management (CRM) system built specifically for Teens IT School. The application is designed to manage students, teachers, groups, attendance tracking, payments, and product sales within an educational environment. It supports three distinct user roles: administrators, teachers, and students, each with their own specialized dashboard and functionality.

The system is built with modern web technologies including React for the frontend, Express.js for the backend API, and PostgreSQL for data persistence. It follows a full-stack architecture with role-based access control, secure authentication, and real-time data management.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
The client-side application is built with React and TypeScript, utilizing a component-based architecture with the following key design decisions:

- **UI Framework**: Uses Radix UI components with Tailwind CSS for consistent, accessible design
- **State Management**: TanStack Query (React Query) for server state management and caching
- **Routing**: Wouter library for lightweight client-side routing
- **Authentication**: Context-based authentication with protected routes
- **Form Handling**: React Hook Form with Zod validation schemas

## Backend Architecture
The server follows a RESTful API design with Express.js:

- **API Structure**: RESTful endpoints organized by resource type (students, teachers, groups, etc.)
- **Authentication**: Passport.js with local strategy and PostgreSQL session store
- **Authorization**: Role-based access control middleware
- **Database Layer**: Drizzle ORM for type-safe database operations
- **Session Management**: Server-side sessions with PostgreSQL backing store

## Data Storage Solutions
PostgreSQL database with Drizzle ORM:

- **Schema Design**: Relational database with proper foreign key constraints
- **Tables**: Users, groups, group_students, teacher_groups, attendance, payments, products, purchases
- **Migration System**: Drizzle Kit for database migrations and schema management
- **Connection Pooling**: PostgreSQL connection pool for efficient database connections

## Authentication and Authorization
Multi-layered security approach:

- **Session-based Authentication**: Secure server-side sessions with PostgreSQL storage
- **Password Security**: Scrypt-based password hashing with salt
- **Role-based Access**: Three distinct roles (admin, teacher, student) with appropriate permissions
- **API Security**: Secure authentication middleware for API routes

## External Dependencies

### Database Services
- **PostgreSQL**: Primary database for all application data
- **Neon Database**: Cloud PostgreSQL provider (based on connection string pattern)

### Email Services
- **SendGrid**: Email delivery service for notifications and communications

### UI and Styling
- **Radix UI**: Accessible component library for forms, dialogs, and interactive elements
- **Tailwind CSS**: Utility-first CSS framework for styling
- **Lucide React**: Icon library for consistent iconography

### Development and Deployment
- **Vite**: Build tool and development server
- **TypeScript**: Type safety across the entire application
- **ESBuild**: Fast JavaScript bundler for production builds
- **Vercel**: Deployment platform (based on Vercel-specific API handlers)

### Session and Authentication
- **Passport.js**: Authentication middleware for Node.js
- **connect-pg-simple**: PostgreSQL session store for Express sessions
- **cookie-signature**: Secure cookie signing for session management

### Data Validation and Processing
- **Zod**: Schema validation for forms and API inputs
- **Drizzle ORM**: Type-safe database ORM with migration support