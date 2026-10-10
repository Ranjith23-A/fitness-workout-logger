import express from 'express';
import {
  getDashboardStats,
  getProgressStats,
  getPersonalRecords
} from '../controllers/statsController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/dashboard', getDashboardStats);
router.get('/progress', getProgressStats);
router.get('/records', getPersonalRecords);

export default router;
