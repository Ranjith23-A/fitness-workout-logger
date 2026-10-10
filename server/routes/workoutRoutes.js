import express from 'express';
import {
  createWorkout,
  getWorkouts,
  getWorkoutById,
  updateWorkout,
  deleteWorkout
} from '../controllers/workoutController.js';
import { protect } from '../middleware/authMiddleware.js';
import { validateWorkout } from '../middleware/validationMiddleware.js';

const router = express.Router();

router.use(protect); // All workout operations are strictly user-authenticated

router.route('/')
  .post(validateWorkout, createWorkout)
  .get(getWorkouts);

router.route('/:id')
  .get(getWorkoutById)
  .put(validateWorkout, updateWorkout)
  .delete(deleteWorkout);

export default router;
