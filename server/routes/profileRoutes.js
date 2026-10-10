import express from 'express';
import {
  getProfile,
  updateProfile,
  addWeightEntry,
  deleteWeightEntry
} from '../controllers/profileController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect); // All profile routes require authentication

router.get('/', getProfile);
router.put('/', updateProfile);
router.post('/weight', addWeightEntry);
router.delete('/weight/:entryId', deleteWeightEntry);

export default router;
