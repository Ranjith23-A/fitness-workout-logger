import User from '../models/User.js';
import { sendTokenResponse } from '../middleware/authMiddleware.js';
import { FitnessMetricsService } from '../services/fitnessMetricsService.js';
import { generateVerificationOtp, sendVerificationEmail } from '../utils/emailVerification.js';
import { PASSWORD_REGEX, MAX_PASSWORD_BYTES, MIN_PASSWORD_LENGTH } from '../utils/constants.js';

/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 * @access  Public
 */
export const register = async (req, res, next) => {
  try {
    const {
      name,
      email,
      password,
      age = 25,
      sex = 'male',
      height = 175,
      currentWeight = 70,
      targetWeight = 68,
      activityLevel = 'moderately_active',
      fitnessGoal = 'general_fitness',
      preferredWorkoutTypes = ['cardio', 'strength']
    } = req.body;

    // Check if user with email already exists
    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email address already exists. Please log in.'
      });
    }

    // Initial weight history log
    const initialWeightHistory = [
      {
        weight: Number(currentWeight) || 70,
        date: new Date(),
        note: 'Starting weight on registration'
      }
    ];

    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      age: Number(age) || 25,
      sex: ['male', 'female', 'other'].includes(sex) ? sex : 'male',
      height: Number(height) || 175,
      currentWeight: Number(currentWeight) || 70,
      targetWeight: Number(targetWeight) || 68,
      activityLevel,
      fitnessGoal,
      preferredWorkoutTypes,
      weightHistory: initialWeightHistory
    });

    sendTokenResponse(user, 201, res);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Login existing user
 * @route   POST /api/auth/login
 * @access  Public
 */
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    sendTokenResponse(user, 200, res);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Log out user / clear session cookie
 * @route   POST /api/auth/logout
 * @access  Public
 */
export const logout = (req, res) => {
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 5 * 1000),
    httpOnly: true
  });

  res.status(200).json({
    success: true,
    message: 'User logged out successfully.'
  });
};

/**
 * @desc    Get currently logged in user profile & metrics
 * @route   GET /api/auth/me
 * @access  Private
 */
export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const metrics = FitnessMetricsService.getUserFitnessSummary(user);

    res.status(200).json({
      success: true,
      user,
      metrics
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Request email verification OTP
 * @route   POST /api/auth/verify-request
 * @access  Private
 */
export const requestVerificationOtp = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user.isEmailVerified) {
      return res.status(400).json({
        success: false,
        message: 'Email is already verified.'
      });
    }

    const otp = generateVerificationOtp();
    user.emailVerificationOtp = otp;
    user.emailVerificationExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 mins
    await user.save();

    await sendVerificationEmail({
      toEmail: user.email,
      otp,
      name: user.name
    });

    res.status(200).json({
      success: true,
      message: `Verification code sent to ${user.email}. (Check server console in development)`,
      // In dev mode, return OTP for easy testing
      ...(process.env.NODE_ENV !== 'production' && { devOtp: otp })
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Verify email with OTP
 * @route   POST /api/auth/verify-confirm
 * @access  Private
 */
export const verifyEmail = async (req, res, next) => {
  try {
    const { otp } = req.body;
    if (!otp) {
      return res.status(400).json({ success: false, message: 'Verification OTP is required' });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user.isEmailVerified) {
      return res.status(400).json({ success: false, message: 'Email already verified' });
    }

    if (!user.emailVerificationOtp || user.emailVerificationOtp !== String(otp).trim()) {
      return res.status(400).json({ success: false, message: 'Invalid verification code.' });
    }

    if (new Date() > new Date(user.emailVerificationExpires)) {
      return res.status(400).json({ success: false, message: 'Verification code has expired. Please request a new one.' });
    }

    user.isEmailVerified = true;
    user.emailVerificationOtp = null;
    user.emailVerificationExpires = null;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Email successfully verified!'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Change password
 * @route   PUT /api/auth/change-password
 * @access  Private
 */
export const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'Current and new password are required' });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ success: false, message: 'New passwords do not match' });
    }

    if (newPassword.length < MIN_PASSWORD_LENGTH) {
      return res.status(400).json({ success: false, message: `Password must be at least ${MIN_PASSWORD_LENGTH} characters.` });
    }

    if (Buffer.byteLength(newPassword, 'utf8') > MAX_PASSWORD_BYTES) {
      return res.status(400).json({ success: false, message: `Password cannot exceed ${MAX_PASSWORD_BYTES} UTF-8 bytes.` });
    }

    if (!PASSWORD_REGEX.test(newPassword)) {
      return res.status(400).json({
        success: false,
        message: 'Password must include uppercase, lowercase, number, and special character.'
      });
    }

    const user = await User.findById(req.user._id);
    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Current password is incorrect' });
    }

    user.password = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password changed successfully.'
    });
  } catch (error) {
    next(error);
  }
};
