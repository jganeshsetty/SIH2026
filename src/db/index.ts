// src/db/index.ts
import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';
import * as schema from './schema.ts';

const { Pool } = pg;

declare global {
  var _postgresPool: pg.Pool | undefined;
}

export const createPool = () => {
  if (!global._postgresPool) {
    const connectionString = process.env.DATABASE_URL;
    
    if (connectionString) {
      const needsSsl = process.env.NODE_ENV === 'production' || 
                       connectionString.includes('sslmode=require') || 
                       connectionString.includes('neon.tech') || 
                       connectionString.includes('supabase') ||
                       connectionString.includes('render.com');

      global._postgresPool = new Pool({
        connectionString,
        max: 10,
        connectionTimeoutMillis: 15000,
        ssl: needsSsl ? { rejectUnauthorized: false } : false,
      });
    } else {
      global._postgresPool = new Pool({
        host: process.env.SQL_HOST || 'localhost',
        user: process.env.SQL_USER || 'farmora',
        password: process.env.SQL_PASSWORD || 'Ganesh@2008',
        database: process.env.SQL_DB_NAME || 'farmora',
        port: process.env.SQL_PORT ? parseInt(process.env.SQL_PORT) : 5432,
        max: 10,
        connectionTimeoutMillis: 15000,
      });
    }

    global._postgresPool.on('error', (err) => {
      console.error('Unexpected error on idle SQL pool client:', err);
    });
  }
  return global._postgresPool;
};

const pool = createPool();
export const db = drizzle(pool, { schema });
