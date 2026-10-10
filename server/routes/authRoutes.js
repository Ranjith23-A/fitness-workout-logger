import express from 'express';
import {
  register,
  login,
  logout,
  getMe,
  requestVerificationOtp,
  verifyEmail,
  changePassword
} from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';
import { validateRegister, validateLogin } from '../middleware/validationMiddleware.js';

const router = express.Router();

router.post('/register', validateRegister, register);
router.post('/login', validateLogin, login);
router.post('/logout', logout);
router.get('/me', protect, getMe);
router.post('/verify-request', protect, requestVerificationOtp);
router.post('/verify-confirm', protect, verifyEmail);
router.put('/change-password', protect, changePassword);

export default router;
