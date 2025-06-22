import { Pool, QueryResult } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

export class DatabaseService {
  private pool: Pool;

  constructor() {
    this.pool = pool;
  }

  async query(text: string, params?: any[]): Promise<QueryResult> {
    try {
      const client = await this.pool.connect();
      const result = await client.query(text, params);
      client.release();
      return result;
    } catch (error) {
      console.error('Database query error:', error);
      throw error;
    }
  }
}

export async function testConnection(): Promise<void> {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT NOW()');
    console.log('Database connected at:', result.rows[0].now);
    client.release();
  } catch (err) {
    console.error('Database connection error:', err);
    throw err;
  }
}