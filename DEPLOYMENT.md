# Vercel Deployment Guide

## Prerequisites

1. **Database Setup**: Set up a hosted PostgreSQL database (Neon, Vercel Postgres, or similar)
2. **Vercel Account**: Create a Vercel account at https://vercel.com

## Deployment Steps

### 1. Database Configuration

**Option A: Neon (Recommended)**
1. Go to https://neon.tech and create a free account
2. Create a new project and database
3. Copy the connection string (it will look like: `postgresql://username:password@host/database`)

**Option B: Vercel Postgres**
1. In your Vercel project dashboard
2. Go to Storage → Create Database → Postgres
3. Copy the connection string

### 2. Deploy to Vercel

1. **Connect Repository**: 
   - Push your code to GitHub/GitLab
   - Import the project in Vercel dashboard

2. **Configure Environment Variables**:
   - In Vercel dashboard, go to Settings → Environment Variables
   - Add: `DATABASE_URL` = your database connection string

3. **Deploy**:
   - Vercel will automatically detect it's a Vite project
   - The build command: `npm run build` (already configured)
   - The output directory: `dist` (already configured)

### 3. Initialize Database Schema

After the first deployment:

```bash
# Run this locally to push schema to your production database
# Make sure DATABASE_URL points to your production database
npm run db:push
```

### 4. Verification

Your deployed app should be available at: `https://your-project-name.vercel.app`

Test the following:
- ✅ Login as admin
- ✅ Create students
- ✅ Assign medals
- ✅ Create groups
- ✅ View statistics

## Architecture Changes

The project has been refactored for Vercel deployment:

### Before (Express.js Server)
```
server/
├── index.ts (Express server)
├── routes.ts (API routes)
└── storage.ts (Database layer)
```

### After (Vercel Serverless)
```
api/ (Serverless functions)
├── auth/
│   ├── login.ts
│   ├── logout.ts
│   └── user.ts
├── students/
│   ├── index.ts
│   ├── [id].ts
│   └── [id]/medals.ts
├── groups/
│   ├── index.ts
│   └── [id].ts
├── products/
│   └── index.ts
└── stats.ts

lib/ (Shared utilities)
├── db.ts (Database connection)
└── storage.ts (Database operations)
```

## Environment Variables Required

- `DATABASE_URL`: PostgreSQL connection string for your hosted database

## Notes

- Authentication uses HTTP-only cookies for security
- Each API route is a separate serverless function
- Database connections are optimized for serverless environments
- All existing functionality is preserved (student management, medals, groups, etc.)

## Troubleshooting

**Build Errors**: Check that all dependencies are properly installed
**Database Errors**: Verify your DATABASE_URL is correct and accessible
**API Errors**: Check Vercel function logs in the dashboard

## Migration from Replit

Your existing data will need to be migrated to the new hosted database. Export from Replit database and import to your new database before going live.