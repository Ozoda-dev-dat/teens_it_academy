# Teens IT School CRM System

## Overview
A comprehensive Customer Relationship Management (CRM) system designed for Teens IT School. This full-stack application manages students, teachers, groups, attendance tracking, medal awards, and an internal store with products that can be purchased using earned medals.

**Purpose**: Educational institution management with gamification elements
**Current State**: Fully functional and ready for development/production use
**Languages**: Interface in Uzbek, code documentation in English

## Recent Changes (September 19, 2025)
- Successfully imported GitHub project to Replit environment
- Set up PostgreSQL database with complete schema migration
- Configured development workflow on port 5000
- Populated database with initial seed data including admin user and sample content
- Verified all components working correctly (frontend, backend, database, authentication)

## Project Architecture

### Technology Stack
- **Frontend**: React 18 + TypeScript + Vite
- **Backend**: Express.js + TypeScript  
- **Database**: PostgreSQL with Drizzle ORM
- **UI Framework**: Tailwind CSS + Radix UI components
- **Real-time**: WebSocket integration for live updates
- **Authentication**: Passport.js with local strategy
- **State Management**: TanStack React Query

### Directory Structure
```
├── client/          # React frontend application
│   ├── src/
│   │   ├── components/  # Reusable UI components
│   │   ├── pages/       # Route components
│   │   ├── hooks/       # Custom React hooks
│   │   └── lib/         # Utilities and configurations
├── server/          # Express.js backend
│   ├── index.ts     # Main server entry point
│   ├── routes.ts    # API route definitions
│   ├── auth.ts      # Authentication logic
│   ├── db.ts        # Database connection
│   └── seed.ts      # Database seeding script
├── shared/          # Shared TypeScript schemas
├── api/            # API route handlers
└── migrations/     # Database migration files
```

### Key Features
1. **Multi-Role Authentication**: Admin, Teacher, Student roles
2. **Group Management**: Class organization and student enrollment
3. **Attendance Tracking**: Real-time attendance with status tracking
4. **Medal System**: Gamified reward system (Gold, Silver, Bronze)
5. **Internal Store**: Products purchasable with earned medals
6. **Dashboard Analytics**: Statistics and progress tracking
7. **Real-time Updates**: WebSocket-powered live notifications

### Database Schema
- **users**: Multi-role user management (admin/teacher/student)
- **groups**: Class/course organization
- **groupStudents**: Student enrollment in groups
- **teacherGroups**: Teacher assignments to groups
- **attendance**: Session attendance tracking
- **payments**: Student payment records
- **products**: Store inventory management
- **purchases**: Medal-based purchase history
- **medalAwards**: Individual medal award tracking

## Development Setup

### Prerequisites
- PostgreSQL database (automatically provisioned in Replit)
- Node.js 18+ (handled by Replit environment)

### Development Commands
```bash
npm install          # Install dependencies
npm run dev         # Start development server (port 5000)
npm run db:push     # Sync database schema
npm run seed        # Populate initial data
npm run build       # Build for production
npm run start       # Start production server
```

### Demo Accounts
After running `npm run seed`:
- **Administrator**: admin@mail.com / admin2233
- **Students/Teachers**: Create through admin panel

### Environment Variables
- `DATABASE_URL`: PostgreSQL connection string (auto-configured)
- `NODE_ENV`: development/production
- `PORT`: Server port (defaults to 5000)

## User Preferences
- Multi-language ready (currently Uzbek interface)
- Professional education-focused design
- Responsive mobile-first approach
- Accessibility considerations with proper ARIA labels

## Technical Decisions
1. **Single Port Architecture**: Both frontend and backend serve on port 5000 for Replit compatibility
2. **Host Configuration**: Frontend configured with `allowedHosts: true` for Replit proxy support
3. **Database Design**: Unified user table with role-based access instead of separate tables
4. **Real-time Features**: WebSocket integration for live updates across the application
5. **Security**: Proper password hashing, session management, and input validation
6. **Performance**: Query optimization with Drizzle ORM and proper indexing

## Deployment Configuration
- **Target**: Autoscale deployment for stateless web application
- **Build Process**: Vite compilation + server bundling with esbuild
- **Production Optimizations**: Minification, static asset serving, and caching headers

## Notes
- Application is fully functional and ready for educational institution use
- Supports both development and production environments
- Database migrations handled automatically through Drizzle
- Real-time features enhance user experience with live updates
- Medal system provides gamification to encourage student engagement