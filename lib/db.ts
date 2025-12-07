import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from "../shared/schema";

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Please add your database connection string to environment variables.",
  );
}

// Create a connection pool for serverless functions
export const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL,
  ssl: true,
  // Optimize for serverless
  max: 1,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

export const db = drizzle(pool, { schema });