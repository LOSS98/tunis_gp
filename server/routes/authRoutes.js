import express from 'express';
import AuthController from '../controllers/authController.js';
import { verifyToken, checkRole } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes
router.post('/register', AuthController.register);
router.post('/login', AuthController.login);

// Protected routes
router.get('/profile', verifyToken, AuthController.getProfile);
router.get('/roles', verifyToken, AuthController.getAllRoles);

// Admin route - only admins can register users with specific roles
router.post('/admin/register', verifyToken, checkRole(['admin']), AuthController.register);

export default router;