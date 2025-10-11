# IT School Management System

## Overview
This is a comprehensive web application for managing an IT school. The platform facilitates student engagement, progress tracking, and administrative tasks through gamification and real-time updates.

## Core Features

### User Management
- **Multi-role system**: Admin, Teacher, and Student roles
- **User profiles**: Customizable avatars and profile information
- **Parent information**: Track parent contact details for students

### Course Management
- **Groups**: Create and manage student groups/classes
- **Scheduling**: Define class schedules for each group
- **Teacher assignments**: Assign teachers to groups

### Attendance System
- **Real-time tracking**: Teachers can mark attendance with status (arrived, late, absent)
- **Historical data**: View attendance records by date
- **Bulk editing**: Efficient attendance management

### Gamification - Medal System
- **Three medal types**: Gold, Silver, Bronze
- **Teacher awards**: Teachers can award medals to students
- **Monthly limits**: Built-in controls to prevent medal abuse
- **Purchase power**: Students can use medals to buy items

### E-commerce Marketplace
- **Product catalog**: Items like t-shirts, stickers, books
- **Medal-based pricing**: Products cost medals instead of money
- **Purchase approval**: Admin approval system for purchases

### Analytics & Reporting
- **Dashboard statistics**: Overview of students, groups, medals, payments
- **Teacher dashboard**: View assigned groups and attendance
- **Student dashboard**: Track own progress and medals

### Real-time Features
- **WebSocket integration**: Live notifications for events
- **Instant updates**: Medal awards, attendance changes, new users

## Project Structure

```
├── client/              # React frontend (Vite)
│   ├── src/
│   │   ├── components/  # UI components (Radix UI based)
│   │   ├── pages/       # Page components
│   │   ├── hooks/       # Custom React hooks
│   │   └── lib/         # Utilities and API client
│   └── public/          # Static assets
├── server/              # Express backend
│   ├── index.ts         # Server entry point
│   ├── routes.ts        # API routes
│   ├── auth.ts          # Authentication logic
│   └── notifications.ts # WebSocket notifications
├── api/                 # API endpoint handlers
├── shared/              # Shared types and schema
│   └── schema.ts        # Drizzle ORM schema
├── migrations/          # Database migrations
└── lib/                 # Shared utilities
```

## Technology Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for build tooling
- **Wouter** for routing
- **TanStack Query** for data fetching
- **Radix UI** components
- **Tailwind CSS** for styling
- **Chart.js** & **Recharts** for data visualization

### Backend
- **Express.js** server
- **PostgreSQL** database (Neon)
- **Drizzle ORM** for database operations
- **Passport.js** for authentication
- **WebSocket (ws)** for real-time updates

### Development Tools
- **TypeScript** for type safety
- **Drizzle Kit** for migrations
- **TSX** for TypeScript execution

## Environment Setup

### Database
- PostgreSQL database with Drizzle ORM
- Connection via `DATABASE_URL` environment variable
- Automatic schema sync with `npm run db:push`

### Server Configuration
- **Frontend port**: 5000 (Vite dev server)
- **Backend**: Embedded in same Express server
- **Host**: 0.0.0.0 for Replit compatibility
- **Proxy trust**: Configured for production deployment

## Development Workflow

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run db:push` - Sync database schema
- `npm run seed` - Seed database with initial data
- `npm run check` - TypeScript type checking

### Database Management
- Schema defined in `shared/schema.ts`
- Migrations in `migrations/` directory
- Use Drizzle Kit for schema changes

## Key Implementation Details

### Authentication
- Session-based auth with Passport.js
- Role-based access control
- Secure password hashing
- Session storage in database (PostgreSQL)

### Real-time Updates
- WebSocket server for live notifications
- Event types: user changes, attendance, medals, products
- Broadcasts to relevant users based on role

### Medal System Rules
- Monthly earning limits per student
- Teacher award restrictions
- Purchase validation against available medals
- Admin oversight and approval system

## Recent Changes
- December 2024: Initial setup for Replit environment
- Configured Vite for Replit proxy compatibility
- Set up PostgreSQL database with Drizzle ORM
- Installed missing TypeScript definitions (@types/cors)

## User Preferences
None specified yet.

## Notes
- The application uses server-side sessions for security
- CORS is configured for localhost development
- WebSocket notifications provide real-time updates across the platform
- Avatar customization is stored as JSON configuration
