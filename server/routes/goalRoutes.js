import express from 'express';
import {
  getGoals,
  updateGoals,
  toggleMilestone
} from '../controllers/goalController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getGoals)
  .post(updateGoals)
  .put(updateGoals);

router.patch('/milestone/:milestoneId/toggle', toggleMilestone);

export default router;
