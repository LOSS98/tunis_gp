// server/routes/eventRoutes.js
import express from 'express';
import EventController from '../controllers/eventController.js';
import {
    verifyToken,
    canManageEvents
} from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes - anyone can view published start lists and results
router.get('/start-lists', EventController.getPublishedStartLists);
router.get('/results', EventController.getPublishedResults);
router.get('/upcoming', EventController.getUpcomingEvents);

// All other routes require authentication
router.use(verifyToken);

// Get all events (authenticated users)
router.get('/', EventController.getAllEvents);
router.get('/:id', EventController.getEventById);
router.get('/date/:date', EventController.getEventsByDate);
router.get('/class/:className', EventController.getEventsByClass);
router.get('/:id/participants', EventController.getEventParticipants);

// Routes that require event management rights (admin/LOC)
router.post('/', canManageEvents, EventController.createEvent);
router.put('/:id', canManageEvents, EventController.updateEvent);
router.delete('/:id', canManageEvents, EventController.deleteEvent);

export default router;