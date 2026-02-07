/**
 * Database Connection Pool
 * Creates and exports a MySQL2 connection pool for all routes
 * Uses environment variables for configuration
 */

import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

// ============= Pool Configuration =============
/** MySQL connection pool - reuses connections for performance */
export const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'golf_tournament',
  /** Maximum simultaneous connections */
  connectionLimit: 10,
  /** Wait for connection if pool is full */
  waitForConnections: true,
  /** Max queue size when pool is full */
  queueLimit: 0,
  /** Enable named placeholders for cleaner queries */
  namedPlaceholders: true,
});

/**
 * Test database connectivity
 * @returns true if connection succeeds
 */
export const testConnection = async (): Promise<boolean> => {
  try {
    const connection = await pool.getConnection();
    console.log('✅ MySQL connection successful');
    connection.release();
    return true;
  } catch (error) {
    console.error('❌ MySQL connection failed:', error);
    return false;
  }
};
