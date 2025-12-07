import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "@shared/schema";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL must be set!");
}

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false, // 🔑 Neon uchun majburiy
  },
  connectionTimeoutMillis: 15000, // 10 soniya kutadi
  idleTimeoutMillis: 30000,       // bo‘sh ulanishni yopadi
  max: 10                         // pool ulanishlar soni
}).on('error', (err, client) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

export const db = drizzle(pool, { schema });
