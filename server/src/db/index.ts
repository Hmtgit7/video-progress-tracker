// server/src/db/index.ts
import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

// Create a new pool instance with the connection details from environment variables
const pool = new Pool({
    user: process.env.PGUSER,
    host: process.env.PGHOST,
    database: process.env.PGDATABASE,
    password: process.env.PGPASSWORD,
    port: parseInt(process.env.PGPORT || '5432'),
});

// Test the database connection
pool.connect()
    .then(() => console.log('Connected to PostgreSQL database'))
    .catch((err) => console.error('Error connecting to database:', err));

export default pool;