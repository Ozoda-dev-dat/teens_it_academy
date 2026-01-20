# Teens IT School CRM

## Overview

A comprehensive CRM (Customer Relationship Management) system for Teens IT School, designed to manage students, teachers, groups, attendance tracking, and a gamified medal/rewards system. The application supports three user roles: administrators, teachers, and students, each with their own dashboard and permissions.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight React router)
- **State Management**: TanStack React Query for server state, React Context for auth state
- **UI Components**: shadcn/ui component library built on Radix UI primitives
- **Styling**: Tailwind CSS with CSS custom properties for theming
- **Build Tool**: Vite with HMR support

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **API Pattern**: RESTful endpoints under `/api/*`
- **Authentication**: Session-based auth using express-session with PostgreSQL session store
- **Password Security**: scrypt hashing with random salts
- **Real-time Updates**: WebSocket support via `ws` library for live notifications

### Data Storage
- **Database**: PostgreSQL (via Neon serverless)
- **ORM**: Drizzle ORM with type-safe schema definitions
- **Session Storage**: connect-pg-simple for PostgreSQL session persistence
- **Schema Location**: `shared/schema.ts` contains all table definitions

### Project Structure
```
├── client/           # React frontend
│   └── src/
│       ├── components/   # UI components
│       ├── hooks/        # Custom React hooks
│       ├── lib/          # Utilities and API clients
│       └── pages/        # Route components
├── server/           # Express backend
│   ├── auth.ts       # Authentication setup
│   ├── routes.ts     # API route handlers
│   ├── storage.ts    # Database operations
│   └── notifications.ts  # WebSocket service
├── shared/           # Shared types and schemas
├── api/              # Vercel serverless functions (alternative deployment)
├── lib/              # Shared utilities for API functions
└── migrations/       # Drizzle database migrations
```

### Authentication Flow
1. Users authenticate via `/api/login` with email/password
2. Sessions stored in PostgreSQL using signed cookies
3. Role-based access control (admin, teacher, student)
4. Protected routes verify session and role before access

### Key Features
- **Student Management**: CRUD operations, auto-generated login credentials
- **Group Management**: Create groups with schedules, assign students and teachers
- **Attendance Tracking**: Daily attendance with arrived/late/absent status, monthly reports
- **Medal System**: Gold/silver/bronze medals awarded by teachers/admins
- **Shop System**: Students can purchase products using earned medals
- **Teacher Portal**: Teachers manage their assigned groups and take attendance

## External Dependencies

### Database
- **Neon PostgreSQL**: Serverless PostgreSQL database (`@neondatabase/serverless`)
- **Drizzle ORM**: Type-safe database queries and migrations

### Authentication & Sessions
- **express-session**: Session management
- **connect-pg-simple**: PostgreSQL session store
- **cookie-signature**: Signed cookie verification

### Email (Optional)
- **SendGrid**: Email service integration (`@sendgrid/mail`)

### UI Components
- **Radix UI**: Accessible component primitives (dialog, dropdown, tabs, etc.)
- **Lucide React**: Icon library
- **Chart.js**: Data visualization

### Development
- **Vite**: Frontend build and dev server
- **TypeScript**: Type safety across the stack
- **Drizzle Kit**: Database migration tooling