// server/routes/participantRoutes.js
import express from 'express';
import ParticipantController from '../controllers/participantController.js';
import {
    verifyToken,
    isAdminOrLOC,
    isOwnDataOrAdmin,
    canViewParticipantData
} from '../middleware/authMiddleware.js';

const router = express.Router();

// Public route for password reset
router.post('/reset-password', ParticipantController.resetPassword);

// All other routes require authentication
router.use(verifyToken);

// Routes that require admin or LOC permissions
router.get('/', isAdminOrLOC, ParticipantController.getAllParticipants);
router.get('/role/:roleId', isAdminOrLOC, ParticipantController.getParticipantsByRole);
router.get('/country/:country', canViewParticipantData, ParticipantController.getParticipantsByCountry);

// Routes for specific participant - own data or admin/LOC
router.get('/:id', isOwnDataOrAdmin, ParticipantController.getParticipantById);
router.put('/:id', isOwnDataOrAdmin, ParticipantController.updateParticipant);
router.get('/:id/events', isOwnDataOrAdmin, ParticipantController.getParticipantEvents);
router.get('/:id/upcoming-events', isOwnDataOrAdmin, ParticipantController.getParticipantUpcomingEvents);

// Route for getting participant by BIB - available to staff that can scan QR codes
router.get('/bib/:bib', canViewParticipantData, ParticipantController.getParticipantByBib);

export default router;