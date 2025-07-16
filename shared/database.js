import { Pool } from 'pg';

const pool = new Pool({
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  host: process.env.PGHOST,
  database: process.env.PGDATABASE,
  port: parseInt(process.env.PGPORT || '5432', 10),
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1); // Exit the process if a critical error occurs on the pool
});

export const getDbClient = () => {
  return pool.connect();
};

// Optional: Add a function to gracefully close the pool on application shutdown
export const closeDbPool = async () => {
  await pool.end();
  console.log('Database connection pool closed.');
};