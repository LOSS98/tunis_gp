import express from 'express';
import ParticipantController from '../controllers/participantController.js';
import { verifyToken, checkRole } from '../middleware/authMiddleware.js';

const router = express.Router();

// All these routes require authentication
router.use(verifyToken);

// Routes for admins only
router.get('/', checkRole(['admin']), ParticipantController.getAllUsers);
router.get('/:id', checkRole(['admin']), ParticipantController.getUserById);

// Update user - admins can update any user, users can only update their own profile
router.put('/:id', (req, res, next) => {
    const userId = parseInt(req.params.id);

    // If user is updating their own profile OR user is admin, proceed
    if (userId === req.user.userId || req.user.role === 'admin') {
        return next();
    }

    return res.status(403).json({ message: 'Not authorized to update this user' });
}, ParticipantController.updateUser);

export default router;