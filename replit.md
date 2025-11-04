# Teens IT School Management System

## Overview
A comprehensive school management system designed for IT schools to manage students, teachers, groups, attendance tracking, and a gamified medal rewards system. Built with React, Express, PostgreSQL, and WebSockets for real-time updates.

**Last Updated:** November 4, 2025

## Project Architecture

### Tech Stack
- **Frontend**: React 18 + Vite + TypeScript + Tailwind CSS
- **Backend**: Express.js + TypeScript
- **Database**: PostgreSQL (Neon) with Drizzle ORM
- **Real-time**: WebSocket (ws library)
- **Authentication**: Passport.js with express-session (PostgreSQL store)
- **UI Components**: Radix UI + shadcn/ui

### Project Structure
```
├── client/              # React frontend
│   ├── src/
│   │   ├── components/  # Reusable UI components
│   │   ├── pages/       # Main application pages
│   │   ├── hooks/       # Custom React hooks
│   │   └── lib/         # Utilities and API client
├── server/              # Express backend
│   ├── index.ts         # Server entry point
│   ├── routes.ts        # API routes
│   ├── auth.ts          # Authentication setup
│   ├── notifications.ts # WebSocket service
│   └── storage.ts       # Database operations
├── shared/              # Shared code between client/server
│   └── schema.ts        # Database schema and types
├── lib/                 # Server-side libraries
│   ├── auth.ts          # Auth utilities
│   ├── secure-auth.ts   # Session validation
│   └── storage.ts       # Storage interface
└── migrations/          # Database migrations
```

## Core Features

### User Roles
1. **Admin**: Full system access - manage users, groups, products, finances, attendance
2. **Teacher**: Manage assigned groups, mark attendance, award medals to students
3. **Student**: View profile, medals, purchase products with medals

### Key Functionality
- **User Management**: Create/manage students, teachers, admins
- **Group Management**: Organize students into groups with schedules
- **Attendance Tracking**: Daily attendance with monthly calendar view
- **Medal System**: 
  - Gold, Silver, Bronze medals
  - Automatic bronze medals for attendance
  - Monthly limits (48 bronze, 16 silver, 8 gold)
  - Teacher-awarded medals
- **E-commerce/Rewards**: Students purchase products using medals
- **Real-time Updates**: WebSocket notifications for all major events
- **Avatar System**: Customizable student avatars
- **Statistics Dashboard**: Track students, groups, medals, finances

## Development Setup

### Environment Variables Required
- `DATABASE_URL` - PostgreSQL connection string (auto-configured by Replit)
- `SESSION_SECRET` - Secret for session encryption (auto-configured)
- `PORT` - Server port (defaults to 5000)
- `NODE_ENV` - Environment (development/production)

### Database
- PostgreSQL database provisioned via Replit Database tool
- Drizzle ORM for type-safe database operations
- Migrations stored in `/migrations` directory

### Running Locally
```bash
npm install           # Install dependencies
npm run db:push       # Apply database schema
npm run seed          # Seed database with demo data
npm run dev           # Start development server
```

### Demo Credentials
**Administrator:**
- Email: admin@mail.com
- Password: admin2233

Students and teachers can be created through the admin panel.

## Deployment

### Configuration
- **Type**: Autoscale (stateless web application)
- **Build**: `npm run build` (builds frontend + backend)
- **Start**: `npm start` (production server)

### Important Notes
- Frontend runs on port 5000 (only exposed port)
- Backend API served on same port as frontend
- WebSocket server at `/ws` endpoint
- Sessions stored in PostgreSQL (not memory)
- Vite configured for Replit proxy with `allowedHosts: true`

## Recent Changes
- **Nov 4, 2025**: Initial import to Replit
  - Configured PostgreSQL database
  - Applied database schema
  - Seeded initial data
  - Set up development workflow on port 5000
  - Configured autoscale deployment
  - Verified WebSocket functionality

## Known Issues
- Vite HMR WebSocket connection warnings in console (cosmetic, doesn't affect functionality)
- npm audit shows 8 vulnerabilities (6 moderate, 2 high) - review and update if needed

## Additional Notes
- Application text is in Uzbek language
- Medal system has monthly reset functionality
- Attendance automatically awards +1 bronze medal per attended session
- Purchase requests require admin approval
- Real-time notifications broadcast to authenticated users only
