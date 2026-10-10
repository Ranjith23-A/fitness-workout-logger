import jwt from 'jsonwebtoken';
import User from '../models/User.js';

/**
 * Authentication Middleware
 * Supports both Authorization Header (Bearer <token>) and HttpOnly Cookie (`token`).
 * Ensures strict security with tenant isolation.
 */
export const protect = async (req, res, next) => {
  let token = null;

  // 1. Check Bearer token in Authorization header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }
  // 2. Check HttpOnly cookie
  else if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required. No access token provided.'
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'super_secret_jwt_key_fitness_workout_logger_2026_secure');
    
    // Find user in database to ensure account still exists
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'The user belonging to this token no longer exists.'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Your session has expired. Please log in again.'
      });
    }
    return res.status(401).json({
      success: false,
      message: 'Invalid or malformed authentication token.'
    });
  }
};

/**
 * Helper to generate JWT token and configure cookie options
 */
export const sendTokenResponse = (user, statusCode, res) => {
  const token = jwt.sign(
    { id: user._id, email: user.email },
    process.env.JWT_SECRET || 'super_secret_jwt_key_fitness_workout_logger_2026_secure',
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );

  const isProduction = process.env.NODE_ENV === 'production';
  const cookieOptions = {
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'strict' : 'lax'
  };

  res.cookie('token', token, cookieOptions);

  res.status(statusCode).json({
    success: true,
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      age: user.age,
      sex: user.sex,
      height: user.height,
      currentWeight: user.currentWeight,
      targetWeight: user.targetWeight,
      activityLevel: user.activityLevel,
      fitnessGoal: user.fitnessGoal,
      preferredWorkoutTypes: user.preferredWorkoutTypes,
      isEmailVerified: user.isEmailVerified
    }
  });
};
