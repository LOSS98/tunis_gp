// server/routes/authRoutes.js
import express from 'express';
import AuthController from '../controllers/authController.js';
import {
    verifyToken,
    isAdminOrLOC,
    checkRole
} from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes
router.post('/login', AuthController.login);
router.post('/set-password', AuthController.setPassword);

// Protected routes
router.get('/profile', verifyToken, AuthController.getProfile);
router.get('/roles', verifyToken, AuthController.getAllRoles);

// QR Code generation (requires authentication)
router.get('/generate-qr', verifyToken, AuthController.generateQRCode);

// QR Code validation (public endpoint for scanning)
router.get('/validate-qr/:token', AuthController.validateQRCode);

// Admin routes
router.post('/register', verifyToken, isAdminOrLOC, AuthController.register);

export default router;