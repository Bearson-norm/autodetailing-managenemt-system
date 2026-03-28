import bcrypt from 'bcrypt';
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

async function seedDatabase() {
  const client = await pool.connect();
  
  try {
    console.log('Seeding database with initial users...');
    
    // Generate password hashes
    const consumerHash = await bcrypt.hash('consumer123', 10);
    const adminHash = await bcrypt.hash('admin123', 10);
    const workerHash = await bcrypt.hash('worker123', 10);

    await client.query('BEGIN');

    // Delete existing seed users if they exist
    await client.query(
      `DELETE FROM users WHERE id IN (
        '00000000-0000-0000-0000-000000000001',
        '00000000-0000-0000-0000-000000000002',
        '00000000-0000-0000-0000-000000000003'
      )`
    );

    // Insert seed users
    await client.query(
      `INSERT INTO users (id, username, password_hash, name, role, phone, language) VALUES
       ('00000000-0000-0000-0000-000000000001', 'consumer1', $1, 'John Doe', 'consumer', '081234567890', 'id'),
       ('00000000-0000-0000-0000-000000000002', 'admin1', $2, 'Admin User', 'admin', NULL, 'id'),
       ('00000000-0000-0000-0000-000000000003', 'worker1', $3, 'Worker One', 'worker', NULL, 'id')
       ON CONFLICT (id) DO UPDATE SET
         username = EXCLUDED.username,
         password_hash = EXCLUDED.password_hash,
         name = EXCLUDED.name,
         role = EXCLUDED.role,
         phone = EXCLUDED.phone,
         language = EXCLUDED.language`,
      [consumerHash, adminHash, workerHash]
    );

    await client.query('COMMIT');
    
    console.log('Database seeded successfully!');
    console.log('Default users:');
    console.log('  - consumer1 / consumer123');
    console.log('  - admin1 / admin123');
    console.log('  - worker1 / worker123');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Seeding failed:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

seedDatabase().catch(console.error);
