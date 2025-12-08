# Teens IT School - CRM System

## Overview
This is a comprehensive CRM system for managing an IT school, built with TypeScript, React, and Express. The system handles student management, attendance tracking, teacher assignments, group management, and a medal-based rewards system with product purchases.

**Current Status**: Successfully configured for Replit environment
**Last Updated**: December 8, 2025

## Project Architecture

### Tech Stack
- **Frontend**: React 18 + Vite + TypeScript
- **UI Components**: Radix UI + Tailwind CSS
- **Backend**: Express.js with TypeScript
- **Database**: PostgreSQL (via Neon) with Drizzle ORM
- **Authentication**: Passport.js with local strategy
- **Real-time**: WebSocket support
- **State Management**: TanStack Query (React Query)

### Project Structure
```
├── client/                 # React frontend application
│   ├── src/
│   │   ├── components/    # UI components (Radix UI based)
│   │   ├── pages/         # Page components
│   │   ├── hooks/         # React hooks
│   │   └── lib/           # Utilities and API client
│   └── public/            # Static assets
├── server/                # Express backend
│   ├── index.ts          # Main server file
│   ├── routes.ts         # API route definitions
│   ├── auth.ts           # Authentication logic
│   ├── db.ts             # Database connection
│   └── notifications.ts  # WebSocket notifications
├── api/                  # API endpoint handlers
│   ├── admin/           # Admin endpoints
│   ├── auth/            # Authentication endpoints
│   ├── groups/          # Group management
│   ├── students/        # Student management
│   └── teachers/        # Teacher endpoints
├── shared/              # Shared code between client/server
│   └── schema.ts       # Database schema definitions
└── migrations/         # Database migrations
```

### Database Schema
The application uses the following main tables:
- **users**: Students, teachers, and administrators (role-based)
- **groups**: Study groups/classes
- **attendance**: Class attendance records
- **products**: Items available for purchase with medals
- **purchases**: Student purchase requests
- **payments**: Payment tracking
- **group_students**: Student-group relationships
- **teacher_groups**: Teacher-group assignments

## Development Setup

### Prerequisites
- Node.js 18+ (already configured in Replit)
- PostgreSQL database (automatically provisioned)

### Running Locally
The development server is configured to run on port 5000:
```bash
npm run dev
```

This starts:
- Express backend server
- Vite dev server with HMR
- WebSocket server for real-time updates

### Database Commands
```bash
# Push schema changes to database
npm run db:push

# Run migrations
npm run migrate

# Seed initial data
npm run seed
```

## Deployment

### Build Process
```bash
npm run build
```
This will:
1. Push database schema changes
2. Build the React frontend (outputs to `dist/public`)
3. Bundle the Express server (outputs to `dist/index.js`)

### Production Server
```bash
npm start
```

### Deployment Configuration
- **Type**: Autoscale deployment
- **Build Command**: `npm run build`
- **Run Command**: `npm start`
- **Port**: 5000 (both frontend and backend)

## User Roles

The system supports three user roles:

1. **Administrator**
   - Full system access
   - Manage users, groups, attendance
   - Approve/reject product purchases
   - View statistics and reports

2. **Teacher**
   - Manage assigned groups
   - Take attendance
   - View student information
   - Award medals to students

3. **Student**
   - View their dashboard
   - Check attendance records
   - View medal balance
   - Purchase products with medals

## Features

### Core Functionality
- ✅ Multi-role authentication system
- ✅ Student and teacher management
- ✅ Group/class management
- ✅ Attendance tracking with bulk editing
- ✅ Medal-based reward system (gold, silver, bronze)
- ✅ Product catalog with medal pricing
- ✅ Purchase request workflow
- ✅ Real-time notifications via WebSocket
- ✅ Dashboard analytics
- ✅ Avatar customization

### Real-time Features
The application uses WebSocket for real-time updates:
- Live attendance updates
- Purchase request notifications
- Medal award notifications
- User status changes

## Environment Configuration

### Required Environment Variables
- `DATABASE_URL`: PostgreSQL connection string (auto-configured)
- `NODE_ENV`: Environment (development/production)
- `PORT`: Server port (default: 5000)

### Database Configuration
The application is configured to work with Replit's PostgreSQL database using SSL connection. The database connection is managed through Drizzle ORM.

## Replit-Specific Configuration

### Vite Configuration
- Host: `0.0.0.0` (required for Replit)
- Port: `5000`
- `allowedHosts: true` (enables proxy access)
- HMR configured for Replit domains

### Workflow
- **Name**: Start application
- **Command**: `npm run dev`
- **Port**: 5000
- **Type**: webview (serves both frontend and API)

## Security Notes

- Authentication via Passport.js with session management
- Password hashing for user credentials
- Role-based access control (RBAC)
- SSL/TLS for database connections
- CORS configured for Replit environment
- Trust proxy enabled for accurate client IPs

## Troubleshooting

### Common Issues

**Database Connection Errors**
- Ensure `DATABASE_URL` environment variable is set
- Check database is running via Replit database panel

**Port Already in Use**
- Replit automatically manages port 5000
- Restart the workflow if needed

**Build Failures**
- Run `npm install` to ensure all dependencies are installed
- Check TypeScript compilation with `npm run check`

## Recent Changes
- December 8, 2025: Initial Replit environment setup
  - Created PostgreSQL database
  - Configured workflow for dev server
  - Set up deployment configuration
  - Verified application runs successfully
