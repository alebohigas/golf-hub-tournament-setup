/**
 * Database Connection Test Script
 * Run with: npm run db:test
 * Verifies MySQL connectivity and basic table access
 */

import { pool, testConnection } from '../db';

const run = async () => {
  console.log('🔌 Testing MySQL connection...\n');
  
  const connected = await testConnection();
  
  if (!connected) {
    console.log('\n❌ Could not connect. Check your .env configuration.');
    process.exit(1);
  }

  try {
    // List tables
    const [tables] = await pool.query('SHOW TABLES');
    console.log('\n📋 Tables found:');
    (tables as any[]).forEach(t => {
      const tableName = Object.values(t)[0];
      console.log(`   - ${tableName}`);
    });
  } catch (err) {
    console.error('Error listing tables:', err);
  }

  await pool.end();
  console.log('\n✅ Connection test complete');
};

run();
