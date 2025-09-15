# Student Management System

## Project Overview
This is a full-stack web application built with React frontend and Express backend for managing students, teachers, groups, attendance tracking, and a medal/reward system. The application is designed for educational institutions to track student attendance and engagement.

## Architecture
- **Frontend**: React with TypeScript, using Vite as the build tool
- **Backend**: Express.js with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **UI Components**: Radix UI with Tailwind CSS
- **Authentication**: Passport.js with local strategy

## Key Features
- Multi-role authentication (Admin, Teacher, Student)
- Student and teacher management
- Group creation and assignment
- Attendance tracking
- Medal/reward system for students
- Product purchase system using medals
- Dashboard views for different user roles

## Project Structure
```
├── client/          # React frontend
│   ├── src/
│   │   ├── components/  # UI components
│   │   ├── pages/       # Application pages
│   │   ├── hooks/       # Custom React hooks
│   │   └── lib/         # Utilities and API client
├── server/          # Express backend
│   ├── auth.ts      # Authentication setup
│   ├── routes.ts    # API route definitions
│   ├── storage.ts   # Database operations
│   └── index.ts     # Server entry point
├── shared/          # Shared types and schemas
│   └── schema.ts    # Drizzle database schema
├── api/             # API route handlers (alternative structure)
└── lib/             # Shared utilities
```

## Development Setup
The application is configured to run in the Replit environment:

1. **Database**: PostgreSQL database is provisioned with DATABASE_URL environment variable
2. **Development Server**: Runs on port 5000 with Vite dev server
3. **Host Configuration**: Set to 0.0.0.0 to work with Replit's proxy system
4. **Dependencies**: All required packages are installed via npm

## API Endpoints
The application provides comprehensive REST API endpoints:
- `/api/auth/*` - Authentication (login, logout, user info)
- `/api/students/*` - Student management
- `/api/teachers/*` - Teacher management  
- `/api/groups/*` - Group management
- `/api/attendance/*` - Attendance tracking
- `/api/products/*` - Product management
- `/api/purchases/*` - Purchase transactions
- `/api/payments/*` - Payment tracking

## Database Schema
Key entities:
- **users**: Stores students, teachers, and admins with role-based access
- **groups**: Educational groups/classes
- **attendance**: Daily attendance records
- **products**: Items available for purchase with medals
- **purchases**: Transaction history
- **payments**: Payment tracking

## User Roles
1. **Admin**: Full system access, can manage all entities
2. **Teacher**: Can manage assigned groups and track attendance
3. **Student**: Can view own profile, attendance, and purchase products

## Technology Stack
- **Frontend**: React 18, TypeScript, Tailwind CSS, Radix UI, React Query
- **Backend**: Express 4, TypeScript, Passport.js
- **Database**: PostgreSQL with Drizzle ORM
- **Build Tools**: Vite, ESBuild
- **Development**: TSX for TypeScript execution

## Deployment
Configured for Replit deployment:
- **Target**: Autoscale (stateless web application)
- **Build**: `npm run build` - builds frontend and backend
- **Run**: `npm start` - starts production server
- **Port**: 5000 (configured for Replit environment)

## Recent Changes
- ✅ Dependencies installed successfully
- ✅ Database migrations applied with Drizzle
- ✅ Development server configured and running
- ✅ Vite dev server properly configured for Replit proxy
- ✅ Deployment configuration set up for autoscale