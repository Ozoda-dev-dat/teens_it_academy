# Teens IT School - Learning Management System

## Project Overview
This is a full-stack web application for managing a programming school called "Teens IT School". It's a comprehensive Learning Management System (LMS) with attendance tracking, student management, and gamification features through medals.

**Current Status**: Successfully set up and running in Replit environment
**Last Updated**: September 29, 2025

## Architecture
- **Frontend**: React 18 with TypeScript, Vite build tool, Tailwind CSS + Radix UI components
- **Backend**: Express.js with TypeScript, WebSocket support for real-time notifications
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Authentication**: Passport.js with local strategy and session management

## Key Features
- Multi-role system (Admin, Teacher, Student)
- Attendance tracking and management
- Medal/achievement system for gamification
- Real-time notifications via WebSocket
- Responsive design with modern UI components
- Group/class management
- Payment tracking
- Product management (reward store)

## Tech Stack
- **Runtime**: Node.js 18+
- **Frontend Framework**: React 18.3.1 with Wouter for routing
- **UI Library**: Radix UI components with Tailwind CSS
- **Backend Framework**: Express 4.21.2
- **Database**: PostgreSQL with Drizzle ORM 0.39.1
- **Build Tool**: Vite 5.4.19
- **Type Safety**: TypeScript 5.6.3
- **State Management**: React Query (TanStack Query)

## Project Structure
```
/
├── client/           # React frontend
│   ├── src/
│   │   ├── components/  # Reusable UI components
│   │   ├── pages/      # Page components
│   │   ├── hooks/      # Custom React hooks
│   │   └── lib/        # Utilities and API client
│   └── public/         # Static assets
├── server/           # Express backend
│   ├── index.ts       # Main server entry point
│   ├── routes.ts      # API route definitions
│   └── ...
├── shared/           # Shared types and schemas
│   └── schema.ts     # Database schema definitions
├── api/             # API endpoint handlers
├── lib/             # Shared utilities
└── migrations/      # Database migrations
```

## Development Setup
The project is configured for Replit environment with:
- Server runs on port 5000 (frontend and backend integrated)
- Database credentials auto-configured via environment variables
- Hot reload enabled for development
- Vite dev server properly configured to allow all hosts (required for Replit proxy)

## Configuration Files
- `vite.config.ts`: Frontend build configuration with Replit-specific settings
- `drizzle.config.ts`: Database ORM configuration
- `package.json`: Dependencies and scripts
- `tailwind.config.ts`: Styling configuration

## Database Schema
The database includes tables for:
- `users`: Multi-role user management (admin, teacher, student)
- `groups`: Class/group organization
- `attendance`: Attendance tracking with detailed participant data
- `payments`: Payment history and tracking
- `products`: Reward store items
- `purchases`: Medal-based purchases
- `medal_awards`: Achievement/medal tracking system

## Current Status
✅ **Setup Complete**: All dependencies installed and configured
✅ **Database**: Schema pushed and ready
✅ **Development Server**: Running on port 5000
✅ **Frontend**: React app loading correctly with role-based navigation
✅ **Backend**: API endpoints responding (authentication required)
✅ **Deployment**: Configured for production with autoscale

## Recent Changes
- September 29, 2025: Initial Replit environment setup completed
- Database migrations applied successfully
- Development workflow configured and running
- Production deployment settings configured

## Next Steps for Development
1. Test authentication flows for different user roles
2. Verify real-time WebSocket functionality
3. Test attendance tracking features
4. Validate medal system functionality
5. Review payment processing integration (if applicable)

## Languages Used
- Interface appears to be in Uzbek language
- Code and comments primarily in English
- Multi-language support may be implemented

## Notes
- The application uses session-based authentication
- WebSocket integration for real-time updates
- Comprehensive type safety throughout the stack
- Production-ready error handling and logging