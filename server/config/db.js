import pkg from 'pg';
import dotenv from 'dotenv';

const { Pool } = pkg;
dotenv.config();

const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
});

// Test connection
pool.connect((err, client, done) => {
    if (err) {
        console.error('Database connection error:', err);
    } else {
        console.log('PostgreSQL connection successful');
    }
});

export const query = (text, params) => pool.query(text, params);