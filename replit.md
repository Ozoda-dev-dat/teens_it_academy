# Overview

This is a comprehensive CRM system for Teens IT School, built to manage students, teachers, groups, attendance tracking, payment processing, and a medal-based rewards system. The application serves three distinct user roles: administrators who have full system access, teachers who can manage their assigned groups and mark attendance, and students who can view their progress and purchase items with earned medals.

The system features real-time updates via WebSockets for immediate notification of changes across all connected clients, a gamified learning experience through bronze/silver/gold medals, and detailed attendance tracking with monthly reporting capabilities.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture

**Technology Stack**: React with TypeScript, using Vite as the build tool and development server. The UI is built with shadcn/ui components based on Radix UI primitives, styled with Tailwind CSS.

**Routing**: Client-side routing implemented with Wouter, a lightweight routing library. The application uses protected routes that redirect based on user authentication status and role (admin/teacher/student).

**State Management**: React Query (TanStack Query) handles server state management with aggressive caching strategies (`staleTime: Infinity`) to minimize unnecessary network requests. Authentication state is managed through a custom `AuthContext` provider that wraps the entire application.

**Real-time Features**: WebSocket connection established to receive live updates for attendance records, medal awards, user changes, and statistics. The frontend maintains a persistent WebSocket connection that automatically reconnects on disconnection (up to 5 attempts with 3-second intervals).

**Component Organization**: 
- `/client/src/pages` - Full page components for different user dashboards
- `/client/src/components/ui` - Reusable UI components from shadcn/ui
- `/client/src/hooks` - Custom React hooks for auth, WebSocket, and mobile detection
- `/client/src/lib` - Utility functions and shared logic

**Design Pattern**: The frontend follows a component-based architecture with separation of concerns. Business logic is abstracted into custom hooks, API interactions are centralized in query/mutation functions, and UI components remain presentational.

## Backend Architecture

**Framework**: Express.js server with TypeScript, running in ESM module mode. The server handles both traditional HTTP routes and WebSocket connections for real-time updates.

**API Structure**: RESTful API organized into logical endpoint groups:
- `/api/auth/*` - Authentication (login, logout, user session)
- `/api/students/*` - Student management with role-based access
- `/api/teachers/*` - Teacher management and dashboard data
- `/api/groups/*` - Group operations and student assignments
- `/api/attendance/*` - Attendance tracking with bulk operations
- `/api/products/*` - Product catalog for medal redemption
- `/api/stats` - System-wide statistics

**Authentication & Authorization**: Session-based authentication using Passport.js with Local Strategy. Sessions are stored in PostgreSQL via `connect-pg-simple` for persistence across server restarts. Password hashing uses Node.js crypto module with scrypt algorithm and random salts.

**Authorization Layers**: 
- `requireSecureAdmin` - Admin-only endpoints
- `requireSecureTeacher` - Teacher and admin access
- `requireSecureStudentOrOwn` - Students can access their own data
- `canTeacherAccessStudent` - Validates teacher can access students in their assigned groups

**Business Logic Separation**: Core business logic is centralized in the storage layer (`server/storage.ts`), which provides a clean interface for data operations. Route handlers remain thin, focusing on request validation and response formatting.

**Real-time Notifications**: `NotificationService` broadcasts updates to connected WebSocket clients when data changes occur. Notifications include type classification (user_created, attendance_updated, medal_awarded, etc.) and are sent to all connected clients regardless of role for dashboard updates.

**Deployment Strategy**: Dual deployment support:
- Traditional Express server for development and self-hosted production
- Vercel serverless functions in `/api` directory for serverless deployment

## Data Storage

**Database**: PostgreSQL accessed via Neon serverless driver (`@neondatabase/serverless`). Connection pooling is configured differently for serverless vs. traditional deployment:
- Serverless: Single connection with short timeouts (2s connection, 30s idle)
- Traditional: Connection pool with 10 max connections

**ORM**: Drizzle ORM provides type-safe database queries with schema definitions in TypeScript. Schema changes are managed through migrations stored in `/migrations`.

**Schema Design**:

**Users Table**: Unified user model supporting three roles (admin/teacher/student) with role-based fields. Stores hashed passwords, contact information (phone, parent contacts), and medal counts as JSONB.

**Groups Table**: Represents learning groups/classes with schedule stored as JSONB array.

**GroupStudents Junction Table**: Many-to-many relationship between students and groups with join date tracking.

**TeacherGroups Junction Table**: Many-to-many relationship between teachers and groups with status tracking (active/completed) and assignment/completion timestamps.

**Attendance Table**: Records daily attendance for groups with participants stored as JSONB array containing student IDs and status (arrived/late/absent). Includes audit fields for tracking who created/updated records.

**Payments Table**: Tracks student payments with amount, date, and optional notes.

**Products Table**: Catalog of items students can purchase with medals, storing costs for each medal type.

**Purchases Table**: Student purchase history linking to products.

**MedalAwards Table**: Audit log for medal transactions with monthly limits enforced (48 bronze medals per student per month to prevent gaming the system).

**Session Store**: PostgreSQL-backed session storage using `session` table created by `connect-pg-simple`.

**Data Integrity**: Foreign key constraints ensure referential integrity. Unique constraints prevent duplicate assignments (teacher-to-group, student-to-group). Triggers and application-level checks enforce business rules like medal limits.

## Authentication & Authorization

**Session Management**: Express-session with PostgreSQL store provides secure, server-side session management. Sessions persist across server restarts and support both traditional deployment and Vercel serverless environments.

**Security Improvements**: The codebase underwent a security audit that replaced vulnerable base64 cookie parsing with proper signed session validation. Session cookies use signature verification via `cookie-signature` library.

**Password Security**: Passwords are hashed using scrypt with random 16-byte salts. Verification uses timing-safe comparison to prevent timing attacks.

**Role-Based Access Control (RBAC)**: Three-tier role system:
- **Admin**: Full system access including user management, group creation, historical attendance editing
- **Teacher**: Can view assigned groups, mark attendance for current day only, award medals to students in their groups
- **Student**: Can view own data, groups, attendance history, and purchase products

**Teacher Restrictions**: Teachers have intentional limitations to prevent data manipulation:
- Can only mark attendance for today's date (no past/future dates)
- Can only mark attendance once per day per group
- Cannot edit or delete existing attendance records
- Can only award medals to students in groups they're assigned to

**Cross-Role Data Access**: Students can only access their own profile data. Teachers can access student data only for students in their assigned groups. Admins have unrestricted access.

## External Dependencies

**Database Service**: Neon PostgreSQL - Serverless PostgreSQL platform providing connection pooling and SSL connections. The application expects `DATABASE_URL` environment variable for database connectivity.

**Email Service**: SendGrid (`@sendgrid/mail`) integration for email notifications. Currently configured but usage depends on application requirements for notification delivery.

**UI Component Library**: shadcn/ui components based on Radix UI primitives. Provides accessible, customizable components for dialogs, dropdowns, forms, and more.

**Styling**: Tailwind CSS with custom theme configuration including CSS variables for dynamic theming.

**Build Tools**: 
- Vite for frontend bundling with React plugin
- esbuild for backend bundling (production builds)
- tsx for TypeScript execution in development

**Development Tools**: 
- Replit-specific plugins for error overlay and code mapping
- Drizzle Kit for database migrations and schema management

**Session Security**: 
- `cookie-signature` for session cookie signing
- `connect-pg-simple` for PostgreSQL session store

**Real-time Communication**: 
- `ws` (WebSocket) library for bidirectional client-server communication

**Environment Configuration**: Requires environment variables:
- `DATABASE_URL` - PostgreSQL connection string (required)
- `SESSION_SECRET` - Secret for session signing (defaults to fallback in development)
- `NODE_ENV` - Environment identifier (development/production)