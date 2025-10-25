# Teens IT School - CRM System

## Overview
This is a full-stack student management and CRM system built for "Teens IT School". The application includes student attendance tracking, group management, payment processing, and medal/achievement systems.

**Tech Stack:**
- Frontend: React with Vite, TypeScript, Tailwind CSS, Radix UI components
- Backend: Express.js with TypeScript
- Database: PostgreSQL with Drizzle ORM
- Real-time: WebSocket support for live notifications
- Authentication: Passport.js with local strategy

## Project Structure
```
├── client/           # React frontend
│   ├── src/
│   │   ├── components/  # Reusable UI components
│   │   ├── pages/       # Application pages (dashboards, login, etc.)
│   │   ├── hooks/       # Custom React hooks
│   │   └── lib/         # Utilities and API client
├── server/          # Express backend
│   ├── index.ts     # Server entry point
│   ├── routes.ts    # API route definitions
│   ├── auth.ts      # Authentication logic
│   └── db.ts        # Database connection
├── shared/          # Shared code between frontend and backend
│   └── schema.ts    # Database schema (Drizzle)
├── migrations/      # Database migration files
└── lib/            # Additional utilities
```

## Key Features
- **Role-Based Access**: Admin, Teacher, and Student roles with different dashboards
- **Attendance Tracking**: Real-time attendance management for groups
- **Group Management**: Create and manage student groups with schedules
- **Payment System**: Track student payments and financial records
- **Medal System**: Award achievements (gold, silver, bronze medals) to students
- **Avatar Builder**: Custom avatar creation for student profiles
- **Real-time Notifications**: WebSocket-based live updates
- **Parent Communication**: Store parent contact information for students

## Development Setup

### Environment Variables
The project requires:
- `DATABASE_URL` - PostgreSQL connection string (already configured in Replit)
- `PORT` - Server port (defaults to 5000)
- `NODE_ENV` - Environment mode (development/production)

### Running Locally
```bash
npm install          # Install dependencies
npm run db:push      # Push database schema
npm run dev          # Start development server (port 5000)
```

### Database Commands
```bash
npm run db:push      # Push schema changes to database
npm run migrate      # Run migrations
npm run seed         # Seed database with sample data
```

### Build & Deploy
```bash
npm run build        # Build for production
npm start            # Start production server
```

## Architecture Notes

### Database Schema
The system uses PostgreSQL with the following main tables:
- `users` - All users (admin, teachers, students) differentiated by role
- `groups` - Student groups/classes
- `group_students` - Junction table for group membership
- `teacher_groups` - Teacher-group assignments
- `attendances` - Attendance records
- `payments` - Payment tracking
- `products` - Available courses/products
- `student_products` - Student enrollments

### API Endpoints
- `/api/auth/*` - Authentication endpoints
- `/api/users/*` - User management
- `/api/groups/*` - Group management
- `/api/attendance/*` - Attendance tracking
- `/api/payments/*` - Payment processing
- `/api/products/*` - Product/course management
- `/api/medals/*` - Medal/achievement system
- `/health` - Health check endpoint

### Frontend Routes
- `/` - Landing/login page
- `/admin-login` - Admin login
- `/teacher-login` - Teacher login
- `/student-login` - Student login
- `/admin-dashboard` - Admin dashboard
- `/teacher-dashboard` - Teacher dashboard
- `/student-dashboard` - Student dashboard

## Configuration

### Vite Configuration
The Vite dev server is configured to:
- Run on `0.0.0.0:5000` to work with Replit's proxy
- Allow all hosts (`allowedHosts: true`)
- Use WebSocket for HMR with proper Replit domain configuration

### Express Configuration
The Express server:
- Serves both API and static files on port 5000
- Uses CORS with credentials support
- Implements session-based authentication
- Includes WebSocket support for real-time updates

## Recent Changes (October 25, 2025)
- Successfully imported from GitHub
- Configured for Replit environment
- Database schema pushed successfully
- Development workflow configured
- Deployment settings configured for autoscale

## Deployment
The project is configured for Replit Autoscale deployment:
- Build command: `npm run build`
- Run command: `npm start`
- Port: 5000 (only port not firewalled)
