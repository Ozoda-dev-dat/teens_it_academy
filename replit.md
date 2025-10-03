# Teens IT School CRM

## Overview
A comprehensive Customer Relationship Management (CRM) system designed for an IT school. The application manages students, teachers, groups, attendance tracking, a medal reward system, and an e-commerce marketplace where students can purchase products using earned medals.

## Tech Stack
- **Frontend**: React 18 with TypeScript, Vite, TailwindCSS, Radix UI components
- **Backend**: Express.js with TypeScript
- **Database**: PostgreSQL (Neon) with Drizzle ORM
- **Authentication**: Passport.js with express-session (server-side sessions)
- **Real-time**: WebSocket server for live notifications
- **Deployment**: Replit Autoscale

## Project Structure
```
├── client/              # React frontend
│   ├── src/
│   │   ├── components/  # Reusable UI components
│   │   ├── pages/       # Page components (dashboards, login)
│   │   ├── hooks/       # Custom React hooks (auth, websocket)
│   │   └── lib/         # Utilities and API client
│   └── index.html
├── server/              # Express backend
│   ├── index.ts         # Main server entry point
│   ├── routes.ts        # API route definitions
│   ├── auth.ts          # Authentication configuration
│   ├── db.ts            # Database connection
│   ├── notifications.ts # WebSocket notification service
│   └── storage.ts       # Data access layer
├── shared/              # Shared types and schemas
│   └── schema.ts        # Drizzle schema definitions
├── lib/                 # Shared backend utilities
├── migrations/          # Database migrations
└── api/                 # Vercel serverless API routes (legacy)
```

## Key Features
1. **Multi-role Authentication**: Separate login flows for Admin, Teacher, and Student
2. **Group Management**: Create and manage student groups with assigned teachers
3. **Attendance Tracking**: Teachers mark daily attendance with automatic bronze medal awards
4. **Medal System**: Three-tier reward system (gold, silver, bronze) with monthly limits
5. **E-commerce**: Students purchase products using earned medals
6. **Real-time Updates**: WebSocket notifications for important events
7. **Dashboard Analytics**: Role-specific dashboards with stats and charts

## Development Setup
The application runs on port 5000 serving both the frontend and backend API.

### Environment Variables
- `DATABASE_URL`: PostgreSQL connection string (Neon database)
- `SESSION_SECRET`: Secret for session encryption (optional, has default)
- `NODE_ENV`: Set to 'development' for dev mode, 'production' for deployment

### Running Locally
```bash
npm install
npm run db:push  # Run database migrations
npm run dev      # Start development server
```

### Database Migrations
```bash
npm run db:push    # Push schema changes to database
npm run migrate    # Run migrations
npm run seed       # Seed database with sample data
```

## Deployment Configuration
- **Type**: Autoscale (stateless web application)
- **Build**: `npm run build` (builds both frontend and backend)
- **Run**: `npm start` (runs production server)
- **Port**: 5000 (frontend and backend combined)

## Recent Changes (October 2025)
- Imported from GitHub repository
- Configured for Replit environment
- Set up PostgreSQL database with Drizzle ORM
- Configured development workflow on port 5000
- Set up deployment configuration for Autoscale
- Vite config already includes proper host settings (0.0.0.0, allowedHosts: true)

## API Structure
All API routes are prefixed with `/api`:
- `/api/auth/*` - Authentication endpoints
- `/api/students/*` - Student management
- `/api/teachers/*` - Teacher management
- `/api/groups/*` - Group management
- `/api/attendance/*` - Attendance tracking
- `/api/products/*` - Product management
- `/api/stats` - Dashboard statistics
- `/ws` - WebSocket connection endpoint

## User Roles
1. **Admin**: Full system access, manage all users, groups, and system settings
2. **Teacher**: Manage assigned groups, mark attendance, award medals
3. **Student**: View personal dashboard, attendance, medals, and purchase products
