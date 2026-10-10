import { PASSWORD_REGEX, MAX_PASSWORD_BYTES, MIN_PASSWORD_LENGTH, EMAIL_REGEX } from '../utils/constants.js';

export const validateRegister = (req, res, next) => {
  const { name, email, password, confirmPassword } = req.body;
  const errors = {};

  if (!name || typeof name !== 'string' || name.trim().length < 2) {
    errors.name = 'Full name is required and must be at least 2 characters.';
  }

  if (!email || typeof email !== 'string' || !EMAIL_REGEX.test(email.trim())) {
    errors.email = 'A valid email address is required.';
  }

  if (!password || typeof password !== 'string') {
    errors.password = 'Password is required.';
  } else {
    if (password.length < MIN_PASSWORD_LENGTH) {
      errors.password = `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`;
    } else if (Buffer.byteLength(password, 'utf8') > MAX_PASSWORD_BYTES) {
      errors.password = `Password cannot exceed ${MAX_PASSWORD_BYTES} UTF-8 bytes.`;
    } else if (!PASSWORD_REGEX.test(password)) {
      errors.password = 'Password must include at least one uppercase letter, one lowercase letter, one number, and one special character (e.g. !@#$%^&*).';
    }
  }

  if (confirmPassword !== undefined && password !== confirmPassword) {
    errors.confirmPassword = 'Passwords do not match.';
  }

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors
    });
  }

  next();
};

export const validateLogin = (req, res, next) => {
  const { email, password } = req.body;
  const errors = {};

  if (!email || typeof email !== 'string' || !EMAIL_REGEX.test(email.trim())) {
    errors.email = 'Please provide a valid email address.';
  }

  if (!password || typeof password !== 'string') {
    errors.password = 'Password is required.';
  }

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors
    });
  }

  next();
};

export const validateWorkout = (req, res, next) => {
  const { type, durationMinutes, cardio, strength, exercises, activityCategory } = req.body;
  const errors = {};

  if (!type || !['cardio', 'strength'].includes(type)) {
    errors.type = 'Workout type must be either "cardio" or "strength".';
  }

  const duration = Number(durationMinutes);
  if (!durationMinutes || isNaN(duration) || duration <= 0 || duration > 1440) {
    errors.durationMinutes = 'Duration must be a positive number between 1 and 1440 minutes.';
  }

  if (type === 'cardio') {
    const category = activityCategory || cardio?.activityCategory;
    if (category && typeof category !== 'string') {
      errors.activityCategory = 'Activity category must be a valid string.';
    }
  }

  if (type === 'strength') {
    const exList = exercises || strength?.exercises;
    if (!Array.isArray(exList) || exList.length === 0) {
      errors.exercises = 'Strength workout must contain at least one exercise.';
    } else {
      exList.forEach((ex, idx) => {
        if (!ex.exerciseName || typeof ex.exerciseName !== 'string' || !ex.exerciseName.trim()) {
          errors[`exercises[${idx}].exerciseName`] = `Exercise #${idx + 1} requires a valid name.`;
        }
        if (!Array.isArray(ex.sets) || ex.sets.length === 0) {
          errors[`exercises[${idx}].sets`] = `Exercise #${idx + 1} must include at least one set.`;
        } else {
          ex.sets.forEach((set, sIdx) => {
            if (!set.reps || Number(set.reps) <= 0) {
              errors[`exercises[${idx}].sets[${sIdx}].reps`] = `Set #${sIdx + 1} must have at least 1 rep.`;
            }
          });
        }
      });
    }
  }

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Workout validation failed',
      errors
    });
  }

  next();
};
