# Teens IT School CRM

## Overview
A CRM (Customer Relationship Management) system for Teens IT School - an educational platform for teaching programming, robotics, and modern technologies to youth. The application supports multiple user roles (Administrator, Teacher, Student) with role-based dashboards and features.

## Tech Stack
- **Frontend**: React 18 with TypeScript, Vite, TailwindCSS
- **Backend**: Express.js with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Passport.js with local strategy
- **Real-time**: WebSocket support

## Project Structure
```
├── client/           # React frontend
│   ├── src/
│   │   ├── components/  # UI components (shadcn/ui)
│   │   ├── hooks/       # Custom React hooks
│   │   ├── lib/         # Utilities and API client
│   │   └── pages/       # Page components
│   └── public/          # Static assets
├── server/           # Express backend
│   ├── index.ts      # Server entry point
│   ├── routes.ts     # API routes
│   ├── db.ts         # Database connection
│   ├── storage.ts    # Data access layer
│   └── auth.ts       # Authentication setup
├── shared/           # Shared types and schema
│   └── schema.ts     # Drizzle database schema
└── migrations/       # Database migrations
```

## Development
- **Start**: `npm run dev` - Runs both frontend and backend on port 5000
- **Database Push**: `npm run db:push` - Push schema changes to database
- **Seed**: `npm run seed` - Seed database with initial data
- **Build**: `npm run build` - Build for production

## Environment Variables
- `DATABASE_URL` - PostgreSQL connection string (auto-configured by Replit)

## Deployment
Configured for autoscale deployment:
- Build: `npm run build`
- Start: `npm run start`

## Recent Changes
- January 2026: Initial import and Replit environment setup
