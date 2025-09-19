import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "@shared/schema";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL must be set. Did you forget to provision a database?");
}

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false, // 🔑 Neon SSL uchun kerak
  },
  connectionTimeoutMillis: 10000, // 10s kutadi
  idleTimeoutMillis: 30000,       // bo‘sh connectionni yopadi
  max: 10                         // maksimal pool ulanishlar
});

export const db = drizzle(pool, { schema });
