// Dans un nouveau fichier server/routes/invitationRoutes.js
import express from 'express';
import { verifyToken, isAdminOrLOC } from '../middleware/authMiddleware.js';
import InvitationController from '../controllers/invitationController.js';

const router = express.Router();

// Toutes les routes nécessitent une authentification
router.use(verifyToken);

// Routes pour les administrateurs et le LOC
router.post('/', isAdminOrLOC, InvitationController.createInvitation);
router.get('/', isAdminOrLOC, InvitationController.getAllInvitations);
router.delete('/:id', isAdminOrLOC, InvitationController.deleteInvitation);

export default router;