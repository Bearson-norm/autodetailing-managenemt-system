/**
 * Jalankan sekali pada database yang sudah punya schema lama (hanya menambah tabel push).
 * Fresh install: `npm run migrate` sudah menyertakan 002.
 */
import { readFileSync } from 'fs';
import { join } from 'path';
import { Pool } from 'pg';
import * as dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'autodetaailing',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '',
});

async function run() {
  const client = await pool.connect();
  try {
    const sql = readFileSync(join(__dirname, '../../migrations/002_push_subscriptions.sql'), 'utf-8');
    await client.query('BEGIN');
    await client.query(sql);
    await client.query('COMMIT');
    console.log('002_push_subscriptions applied successfully.');
  } catch (e) {
    await client.query('ROLLBACK');
    console.error(e);
    throw e;
  } finally {
    client.release();
    await pool.end();
  }
}

run().catch(() => process.exit(1));
