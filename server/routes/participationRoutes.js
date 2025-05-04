// server/routes/participationRoutes.js
import express from 'express';
import ParticipationController from '../controllers/participationController.js';
import {
    verifyToken,
    canManageEvents
} from '../middleware/authMiddleware.js';

const router = express.Router();

// All routes require authentication
router.use(verifyToken);

// Get all participations
router.get('/', ParticipationController.getAllParticipations);

// Get participations by participant or event
router.get('/participant/:participantId', ParticipationController.getParticipationsByParticipant);
router.get('/event/:eventId', ParticipationController.getParticipationsByEvent);

// Get upcoming events for a participant
router.get('/participant/:participantId/upcoming', ParticipationController.getUpcomingEventsByParticipant);

// Get medalists for an event
router.get('/event/:eventId/medalists', ParticipationController.getMedalistsByEvent);

// CRUD operations on participations - require admin/LOC permissions
router.post('/', canManageEvents, ParticipationController.createParticipation);
router.put('/:participantId/:eventId', canManageEvents, ParticipationController.updateResult);
router.delete('/:participantId/:eventId', canManageEvents, ParticipationController.deleteParticipation);

export default router;