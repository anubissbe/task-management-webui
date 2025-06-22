const { Pool } = require('pg');

async function checkSchema() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgresql://username:password@localhost:5432/database'
  });

  try {
    console.log('Connecting to database...');
    const client = await pool.connect();
    
    console.log('Checking existing tables...');
    const tablesResult = await client.query(`
      SELECT table_name, table_schema 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);
    
    console.log('Existing tables:', tablesResult.rows);
    
    // Check if users table exists
    if (tablesResult.rows.find(t => t.table_name === 'users')) {
      console.log('\nUsers table already exists. Checking columns...');
      const columnsResult = await client.query(`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns 
        WHERE table_name = 'users' AND table_schema = 'public'
        ORDER BY ordinal_position
      `);
      console.log('Users table columns:', columnsResult.rows);
    }
    
    client.release();
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await pool.end();
  }
}

checkSchema();