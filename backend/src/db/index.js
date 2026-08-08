import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import config from '../utils/config.js';
import logger from '../utils/logger.js';
import * as schema from './schema.js';

if (!config.databaseUrl) {
  logger.error('DATABASE_URL is not set');
  process.exit(1);
}

const sql = neon(config.databaseUrl);
const db = drizzle(sql, { schema });

/**
 * Test the database connection.
 * Returns true if the connection is successful.
 */
export async function testConnection() {
  try {
    const result = await sql`SELECT NOW() as now`;
    logger.info('Database connected successfully', {
      timestamp: result[0].now,
    });
    return true;
  } catch (error) {
    logger.error('Database connection failed', {
      error: error.message,
    });
    return false;
  }
}

export { sql, db };
export default db;
