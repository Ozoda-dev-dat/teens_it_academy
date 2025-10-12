# Teens IT School CRM System

## Overview

This is a comprehensive CRM (Customer Relationship Management) system built for Teens IT School, designed to manage students, teachers, groups, attendance tracking, medals/rewards, payments, and a student marketplace. The application provides role-based dashboards for administrators, teachers, and students with real-time updates via WebSocket connections.

**Tech Stack:**
- **Frontend:** React with TypeScript, Vite, Wouter (routing), TanStack Query, Shadcn UI components, Tailwind CSS
- **Backend:** Express.js with TypeScript, Passport.js authentication
- **Database:** PostgreSQL with Drizzle ORM
- **Real-time:** WebSocket for live notifications
- **Deployment:** Vercel serverless functions (API routes)

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Component Framework:** React with TypeScript using a component-based architecture with Shadcn UI (Radix UI primitives)

**State Management:**
- TanStack Query for server state management with automatic caching and refetching
- React Context API for authentication state (AuthContext)
- Local component state for UI interactions

**Routing:**
- Wouter for lightweight client-side routing
- Protected routes with role-based access control (admin, teacher, student)
- Automatic redirects based on authentication status and user roles

**Design System:**
- Tailwind CSS with custom theme variables for consistent styling
- Shadcn UI component library for pre-built accessible components
- Custom fonts: Inter (sans-serif), Georgia (serif), Menlo (monospace)

### Backend Architecture

**API Design:** RESTful API with two deployment strategies:
1. Express.js server for development (`/server` directory)
2. Vercel serverless functions for production (`/api` directory)

**Authentication & Authorization:**
- Passport.js with Local Strategy for credential-based authentication
- Session-based authentication with PostgreSQL session store (connect-pg-simple)
- Password hashing using Node.js scrypt algorithm with salt
- Role-based access control (RBAC) with three roles: admin, teacher, student
- Secure session validation using signed cookies and server-side session storage

**Key Security Measures:**
- Server-side session validation (migrated from insecure base64 cookies)
- Session secrets stored in environment variables
- SQL injection protection via Drizzle ORM parameterized queries
- CORS configuration for cross-origin requests in Replit environment

### Database Schema

**Core Entities:**
- **Users:** Stores all user types (admin/teacher/student) with role field, credentials, profile info, medals, and avatar configuration
- **Groups:** Course/class groups with name, description, schedule (JSON)
- **GroupStudents:** Many-to-many relationship between students and groups
- **TeacherGroups:** Teacher assignments to groups with status tracking (active/completed)
- **Attendance:** Daily attendance records with participants array (studentId + status)
- **Payments:** Student payment records with amount, status, date
- **Products:** Marketplace items purchasable with medals
- **Purchases:** Student purchase records with approval workflow
- **MedalAwards:** Transaction log for medal awards with monthly limits

**Relationships:**
- Users can be students in multiple groups (GroupStudents)
- Teachers can be assigned to multiple groups (TeacherGroups)
- Attendance records belong to groups and reference student participants
- Payments link to students
- Purchases link students to products

**Medal System:**
- Three medal types: gold, silver, bronze
- Stored as JSONB in users table: `{gold: 0, silver: 0, bronze: 0}`
- Monthly bronze medal limit of 48 per student enforced via MedalAwards table
- Atomic medal transactions to prevent race conditions

### Real-time Updates

**WebSocket Implementation:**
- Custom WebSocket server integrated with Express
- Real-time notifications for CRUD operations on users, groups, attendance, payments, products
- Medal award broadcasts for celebration animations
- Stats updates pushed to all connected admin clients
- Session-based WebSocket authentication

**Notification Types:**
- user_created, user_updated, user_deleted
- group_created, group_updated, group_deleted
- attendance_created, attendance_updated
- payment_created, payment_updated
- product_created, product_updated, product_deleted
- medal_awarded
- stats_updated

### Role-Based Features

**Admin Dashboard:**
- Full CRUD for students, teachers, groups
- Attendance management (create/edit/delete for any date)
- Payment tracking
- Product/marketplace management
- Medal awarding system
- Statistics overview
- Bulk operations support

**Teacher Dashboard:**
- View assigned groups and students
- Mark attendance (TODAY ONLY restriction)
- View attendance history for assigned groups
- Award medals to students in assigned groups (with monthly limits)
- Cannot modify past attendance or create future records

**Student Dashboard:**
- View personal profile with medals
- Custom avatar builder with persistence
- Browse marketplace products
- Purchase items using medals (approval workflow)
- View purchase history

## External Dependencies

**Database:**
- PostgreSQL via Neon serverless (@neondatabase/serverless)
- Connection pooling for serverless optimization
- SSL enabled for production connections

**Authentication:**
- Passport.js with passport-local strategy
- express-session with connect-pg-simple for PostgreSQL session storage
- cookie-signature for session cookie signing

**Email Service:**
- SendGrid API integration (@sendgrid/mail) for notifications

**UI Framework:**
- Radix UI primitives for accessible components
- Chart.js for data visualization
- Tailwind CSS for styling with PostCSS

**Development Tools:**
- Vite for build tooling with React plugin
- Drizzle Kit for database migrations
- TypeScript for type safety
- ESBuild for server bundling

**Deployment:**
- Replit Autoscale deployment (configured)
- Environment variables: DATABASE_URL, SESSION_SECRET, SENDGRID_API_KEY
- Node.js >=18.0.0 required
- Build command: `npm run build`
- Run command: `npm start`

**Key Configuration Files:**
- `drizzle.config.ts` - Database schema and migration settings
- `vite.config.ts` - Frontend build configuration with path aliases
- `tsconfig.json` - TypeScript compiler options with path mappings
- `components.json` - Shadcn UI configuration