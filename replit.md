# Teens IT School CRM System

## Overview

A comprehensive Customer Relationship Management (CRM) system built for Teens IT School to manage students, teachers, groups, attendance tracking, medal rewards, and product purchases. The application features role-based dashboards (Admin, Teacher, Student) with real-time updates via WebSockets and secure session-based authentication.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Technology Stack:**
- **Framework:** React 18 with TypeScript
- **Build Tool:** Vite (with HMR and custom Replit plugins)
- **UI Components:** shadcn/ui (Radix UI primitives) with Tailwind CSS
- **State Management:** TanStack Query (React Query) for server state
- **Routing:** Wouter (lightweight client-side routing)
- **Form Handling:** React Hook Form with Zod validation
- **Real-time Updates:** WebSocket client for live notifications

**Design Decisions:**
- Component-based architecture using shadcn/ui for consistency
- Tailwind CSS with custom design tokens (CSS variables for theming)
- Path aliases (`@/`, `@shared/`, `@assets/`) for clean imports
- Protected routes with role-based access control
- Optimistic UI updates with React Query mutations

### Backend Architecture

**Technology Stack:**
- **Runtime:** Node.js (>=18.0.0) with Express.js
- **Language:** TypeScript with ESM modules
- **Database ORM:** Drizzle ORM
- **Authentication:** Passport.js with express-session
- **Password Hashing:** Node.js crypto (scrypt)
- **Real-time:** WebSocket server for live notifications
- **Email:** SendGrid integration

**API Design:**
- RESTful API endpoints organized by resource
- Hybrid deployment: Express server for development, Vercel serverless functions for API routes
- Session-based authentication with PostgreSQL session store
- Role-based middleware (admin, teacher, student access controls)
- Secure session validation using signed cookies (connect.sid)

**Key Architectural Patterns:**
- **Separation of Concerns:** API routes in `/api` directory, server logic in `/server`, shared types in `/shared`
- **Session Security:** Migrated from vulnerable base64 cookies to server-side PostgreSQL sessions
- **Real-time Notifications:** WebSocket broadcast service for medal awards, attendance updates, and stats changes
- **Transaction Safety:** Atomic medal awards with monthly limits enforcement
- **Teacher Restrictions:** Teachers can only mark attendance for current day on scheduled class days

### Database Architecture

**Provider:** PostgreSQL (via Neon serverless)

**Schema Design:**
- **users:** Polymorphic user table (admin/teacher/student roles), stores medals as JSONB
- **groups:** Class groups with schedule stored as JSONB array
- **groupStudents:** Many-to-many relationship between groups and students
- **teacherGroups:** Teacher-group assignments with status tracking (active/completed)
- **attendance:** Daily attendance records with participants as JSONB array
- **payments:** Student payment tracking
- **products:** Virtual store products purchasable with medals
- **purchases:** Purchase requests requiring admin approval
- **medalAwards:** Audit trail for medal awards with monthly limit tracking

**Database Decisions:**
- Drizzle ORM chosen for type-safe queries and schema migrations
- JSONB fields for flexible data (medals, schedules, attendance participants, avatar configs)
- Unique constraints to prevent duplicate assignments and attendance records
- Session store integrated with PostgreSQL for serverless compatibility
- Connection pooling optimized for serverless (max: 1 connection, short timeouts)

### Authentication & Authorization

**Implementation:**
- Passport.js Local Strategy with email/password authentication
- Server-side sessions stored in PostgreSQL (connect-pg-simple)
- Signed session cookies (connect.sid) with configurable secret
- Role-based access control with middleware guards (`requireSecureAdmin`, `requireSecureTeacher`, `requireSecureStudentOrOwn`)
- Session validation includes signature verification and database lookup

**Security Features:**
- Password hashing with scrypt (salt + hash stored)
- HTTP-only cookies (secure flag for production)
- CSRF protection via SameSite cookie attribute
- Teacher access validation (can only access assigned groups/students)
- Admin-only operations for sensitive actions (creating users, awarding medals manually)

### Real-time Communication

**WebSocket Service:**
- Broadcast notifications for: user/group/attendance/payment/medal events
- Client connection tracking with userId/role metadata
- Automatic reconnection with exponential backoff
- Frontend hook (`useWebSocket`) with connection state management
- Notifications trigger React Query cache invalidations for instant UI updates

## External Dependencies

### Third-party Services
- **Database:** Neon PostgreSQL (serverless Postgres via `@neondatabase/serverless`)
- **Email:** SendGrid API (`@sendgrid/mail`) for transactional emails
- **Deployment:** Vercel serverless functions (production), Express (development)
- **Session Store:** PostgreSQL via `connect-pg-simple`

### Key NPM Packages
- **UI Framework:** React 18, Wouter, TanStack Query
- **Forms & Validation:** React Hook Form, Zod, @hookform/resolvers
- **UI Components:** Radix UI primitives (@radix-ui/*), Tailwind CSS
- **Backend:** Express, Passport, Drizzle ORM, pg (PostgreSQL driver)
- **Real-time:** ws (WebSocket library)
- **Build Tools:** Vite, esbuild, tsx (TypeScript execution)

### Environment Variables Required
- `DATABASE_URL`: PostgreSQL connection string (required)
- `SESSION_SECRET`: Secret key for signing session cookies (defaults to hardcoded value)
- `SENDGRID_API_KEY`: For email notifications (optional)
- `NODE_ENV`: Environment mode (development/production)

### API Integrations
- SendGrid for email delivery (purchase confirmations, notifications)
- PostgreSQL for data persistence and session storage
- WebSocket protocol for real-time browser updates