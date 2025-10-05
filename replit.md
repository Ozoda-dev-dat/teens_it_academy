# Teens IT School Management System

## Overview
A comprehensive web application for managing an IT school with features for administrators, teachers, and students. Built with React, Express, PostgreSQL, and real-time WebSocket notifications.

## Recent Changes (Oct 5, 2025)
- Fixed teacher and student login forms to accept auto-generated credentials
- Auto-generated logins are 5 digits + 1 letter (e.g., "223246G")
- Added case-insensitive login normalization (converts to uppercase)
- Updated UI labels from "Email" to "Login" for clarity

## Previous Changes (Oct 4, 2025)
- Initial project setup in Replit environment
- Created PostgreSQL database and applied schema migrations
- Seeded database with initial admin user and sample data
- Configured development workflow
- Set up deployment configuration

## Project Architecture

### Frontend (React + Vite)
- **Location**: `/client/src`
- **Tech Stack**: React 18, Wouter (routing), TanStack Query, Shadcn UI components
- **Port**: 5000 (serves both frontend and API in development)
- **Key Features**:
  - Role-based dashboards (Admin, Teacher, Student)
  - Real-time updates via WebSocket
  - Medal system for student rewards
  - Attendance tracking
  - Marketplace for students

### Backend (Express + Node.js)
- **Location**: `/server`
- **Tech Stack**: Express, TypeScript, Drizzle ORM, WebSocket
- **Database**: PostgreSQL (Neon)
- **Authentication**: Server-side sessions with connect-pg-simple
- **Key Routes**:
  - `/api/auth/*` - Authentication
  - `/api/students/*` - Student management
  - `/api/teachers/*` - Teacher management
  - `/api/groups/*` - Group management
  - `/api/attendance/*` - Attendance tracking
  - `/api/products/*` - Marketplace products
  - `/ws` - WebSocket endpoint for real-time updates

### Database Schema
- **users**: Students, teachers, and administrators with roles
- **groups**: Class groups with schedules
- **group_students**: Many-to-many relationship for student enrollment
- **teacher_groups**: Teacher assignments to groups
- **attendance**: Daily attendance records
- **payments**: Student payment tracking
- **products**: Marketplace items
- **purchases**: Student purchase history
- **medal_awards**: Medal award tracking

## Development

### Environment Variables
- `DATABASE_URL`: PostgreSQL connection string (required)
- `SESSION_SECRET`: Session encryption secret (required)
- `NODE_ENV`: development/production
- `PORT`: Server port (defaults to 5000)

### Available Scripts
- `npm run dev`: Start development server
- `npm run build`: Build for production
- `npm start`: Start production server
- `npm run db:push`: Apply database schema changes
- `npm run seed`: Seed database with initial data
- `npm run check`: Type check TypeScript

### Demo Accounts
- **Admin**: admin@mail.com / admin2233
- **Students**: Create through admin panel

## User Roles

### Administrator
- Manage students and teachers
- Create and manage groups
- Track attendance
- Award medals to students
- Manage marketplace products
- View analytics and statistics

### Teacher
- View assigned groups
- Record attendance
- Award medals within monthly limits

### Student
- View attendance history
- Check medal balance
- Purchase items from marketplace
- View profile and groups

## Real-time Features
The application uses WebSocket connections to broadcast updates for:
- User creation/updates
- Group changes
- Attendance records
- Medal awards
- Product updates
- Statistics updates

## Deployment
- **Target**: VM (requires persistent state for WebSocket connections)
- **Build**: Compiles frontend with Vite and bundles backend with esbuild
- **Run**: Production server with optimized build

## Security
- Password hashing with scrypt
- Server-side session management
- Role-based access control
- SQL injection prevention via Drizzle ORM
- HTTPS required in production
