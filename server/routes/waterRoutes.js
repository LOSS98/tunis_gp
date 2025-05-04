// server/routes/waterRoutes.js
import express from 'express';
import WaterController from '../controllers/waterController.js';
import {
    verifyToken,
    canManageWater,
    isAdminOrLOC
} from '../middleware/authMiddleware.js';

const router = express.Router();

// All routes require authentication
router.use(verifyToken);

// Routes for staff that can manage water (LOC, volunteer, admin)
router.post('/add', canManageWater, WaterController.addBottles);
router.get('/participant/:bib', canManageWater, WaterController.getWaterHistoryByParticipant);

// Routes for admin and LOC
router.get('/', isAdminOrLOC, WaterController.getAllWaterHistory);
router.get('/country/:country', isAdminOrLOC, WaterController.getWaterHistoryByCountry);
router.get('/totals/country', isAdminOrLOC, WaterController.getTotalBottlesByCountry);
router.post('/add/country', isAdminOrLOC, WaterController.addBottlesToCountry);
router.post('/add/all', isAdminOrLOC, WaterController.addBottlesToAllParticipants);

export default router;