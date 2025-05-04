// server/app.js
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import schedule from 'node-schedule';

// Import routes
import authRoutes from './routes/authRoutes.js';
import participantRoutes from './routes/participantRoutes.js';
import eventRoutes from './routes/eventRoutes.js';
import participationRoutes from './routes/participationRoutes.js';
import waterRoutes from './routes/waterRoutes.js';

// Import models for scheduled tasks
import IdentificationCodeModel from './models/identificationCodeModel.js';

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/participants', participantRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/participations', participationRoutes);
app.use('/api/water', waterRoutes);

// Base route
app.get('/', (req, res) => {
    res.send('GP Tunis Authentication and Tracking API');
});

// Schedule task to clean up expired identification codes every 5 minutes
schedule.scheduleJob('*/5 * * * *', async function() {
    try {
        await IdentificationCodeModel.deleteExpiredCodes();
        console.log('Expired identification codes cleaned up');
    } catch (error) {
        console.error('Error cleaning up expired identification codes:', error);
    }
});

export default app;