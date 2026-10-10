import User from '../models/User.js';
import { FitnessMetricsService } from '../services/fitnessMetricsService.js';

/**
 * @desc    Get user fitness profile and computed physiological metrics
 * @route   GET /api/profile
 * @access  Private
 */
export const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const metrics = FitnessMetricsService.getUserFitnessSummary(user);

    res.status(200).json({
      success: true,
      profile: {
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
        weightHistory: user.weightHistory.sort((a, b) => new Date(b.date) - new Date(a.date))
      },
      metrics
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update user fitness profile
 * @route   PUT /api/profile
 * @access  Private
 */
export const updateProfile = async (req, res, next) => {
  try {
    const {
      name,
      age,
      sex,
      height,
      currentWeight,
      targetWeight,
      activityLevel,
      fitnessGoal,
      preferredWorkoutTypes
    } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (name) user.name = name.trim();
    if (age !== undefined) user.age = Number(age);
    if (sex && ['male', 'female', 'other'].includes(sex)) user.sex = sex;
    if (height !== undefined) user.height = Number(height);
    if (targetWeight !== undefined) user.targetWeight = Number(targetWeight);
    if (activityLevel) user.activityLevel = activityLevel;
    if (fitnessGoal) user.fitnessGoal = fitnessGoal;
    if (Array.isArray(preferredWorkoutTypes)) user.preferredWorkoutTypes = preferredWorkoutTypes;

    // Check if current weight changed, and log into weightHistory
    if (currentWeight !== undefined && Number(currentWeight) !== user.currentWeight) {
      const newWeight = Number(currentWeight);
      user.currentWeight = newWeight;
      user.weightHistory.push({
        weight: newWeight,
        date: new Date(),
        note: 'Updated via profile settings'
      });
    }

    await user.save();

    const metrics = FitnessMetricsService.getUserFitnessSummary(user);

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      profile: {
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
        weightHistory: user.weightHistory.sort((a, b) => new Date(b.date) - new Date(a.date))
      },
      metrics
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Record historical weight entry
 * @route   POST /api/profile/weight
 * @access  Private
 */
export const addWeightEntry = async (req, res, next) => {
  try {
    const { weight, date, note } = req.body;

    const numericWeight = Number(weight);
    if (!weight || isNaN(numericWeight) || numericWeight < 20 || numericWeight > 400) {
      return res.status(400).json({
        success: false,
        message: 'Valid weight in kg between 20 and 400 is required.'
      });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const entryDate = date ? new Date(date) : new Date();

    user.weightHistory.push({
      weight: numericWeight,
      date: entryDate,
      note: note ? String(note).trim() : ''
    });

    // Update current weight if new entry is today or latest
    user.currentWeight = numericWeight;

    await user.save();

    const metrics = FitnessMetricsService.getUserFitnessSummary(user);

    res.status(201).json({
      success: true,
      message: 'Weight entry recorded successfully',
      weightHistory: user.weightHistory.sort((a, b) => new Date(b.date) - new Date(a.date)),
      metrics
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a weight entry
 * @route   DELETE /api/profile/weight/:entryId
 * @access  Private
 */
export const deleteWeightEntry = async (req, res, next) => {
  try {
    const { entryId } = req.params;
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const initialLength = user.weightHistory.length;
    user.weightHistory = user.weightHistory.filter((entry) => entry._id.toString() !== entryId);

    if (user.weightHistory.length === initialLength) {
      return res.status(404).json({ success: false, message: 'Weight entry not found' });
    }

    // Update currentWeight to latest remaining entry if any
    if (user.weightHistory.length > 0) {
      const sorted = [...user.weightHistory].sort((a, b) => new Date(b.date) - new Date(a.date));
      user.currentWeight = sorted[0].weight;
    }

    await user.save();

    const metrics = FitnessMetricsService.getUserFitnessSummary(user);

    res.status(200).json({
      success: true,
      message: 'Weight entry deleted',
      weightHistory: user.weightHistory.sort((a, b) => new Date(b.date) - new Date(a.date)),
      metrics
    });
  } catch (error) {
    next(error);
  }
};
