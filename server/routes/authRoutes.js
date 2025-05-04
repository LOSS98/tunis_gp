// server/routes/authRoutes.js
import express from 'express';
import AuthController from '../controllers/authController.js';
import {
    verifyToken,
    isAdminOrLOC,
    checkRole
} from '../middleware/authMiddleware.js';

const router = express.Router();

// Route pour créer le premier administrateur (sans authentification)
// À SUPPRIMER après création du premier admin !
router.get('/setup-admin-temp', async (req, res) => {
    try {
        // Paramètres hardcodés pour l'admin
        const adminData = {
            firstName: "Khalil",
            lastName: "Mzoughi",
            email: "khalil.mzoughikm@gmail.com",
            password: "khalil",
            role_id: 1 // ID du rôle admin
        };

        // Utiliser la logique de création d'utilisateur
        const result = await AuthController.register({
            body: adminData,
            path: '/setup-admin'
        }, res);

    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Public routes
router.post('/login', AuthController.login);
router.post('/set-password', AuthController.setPassword);

// Route d'enregistrement pour admin (nécessite une authentification admin)
router.post('/admin/register', verifyToken, isAdminOrLOC, AuthController.register);

// Enregistrement normal (vérifie les invitations)
router.post('/register', AuthController.register);

// Protected routes
router.get('/profile', verifyToken, AuthController.getProfile);
router.get('/roles', verifyToken, AuthController.getAllRoles);

// QR Code generation (requires authentication)
router.get('/generate-qr', verifyToken, AuthController.generateQRCode);

// QR Code validation (public endpoint for scanning)
router.get('/validate-qr/:token', AuthController.validateQRCode);

export default router;