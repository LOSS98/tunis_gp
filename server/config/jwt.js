import dotenv from 'dotenv';

dotenv.config();

export default {
    secret: process.env.JWT_SECRET || 'fallback_secret_key',
    expiresIn: '24h' // Token validity duration
};