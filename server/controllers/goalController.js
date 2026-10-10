import Goal from '../models/Goal.js';
import User from '../models/User.js';

/**
 * @desc    Get user goals
 * @route   GET /api/goals
 * @access  Private
 */
export const getGoals = async (req, res, next) => {
  try {
    let goal = await Goal.findOne({ user: req.user._id });

    if (!goal) {
      const user = await User.findById(req.user._id);
      goal = await Goal.create({
        user: req.user._id,
        targetWeight: user?.targetWeight || 68,
        dailyWorkoutDurationMinutes: 45,
        weeklyWorkoutFrequencyDays: 4,
        dailyCalorieTarget: 2200,
        weeklyCalorieBurnTarget: 2000,
        milestones: [
          {
            title: 'Complete 10 workouts this month',
            targetDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            isCompleted: false,
            notes: 'Consistent training routine habit building'
          }
        ]
      });
    }

    res.status(200).json({
      success: true,
      goal
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create or update user goals
 * @route   POST /api/goals or PUT /api/goals
 * @access  Private
 */
export const updateGoals = async (req, res, next) => {
  try {
    const {
      targetWeight,
      dailyWorkoutDurationMinutes,
      weeklyWorkoutFrequencyDays,
      dailyCalorieTarget,
      weeklyCalorieBurnTarget,
      milestones
    } = req.body;

    let goal = await Goal.findOne({ user: req.user._id });

    if (!goal) {
      goal = new Goal({ user: req.user._id });
    }

    if (targetWeight !== undefined) goal.targetWeight = Number(targetWeight);
    if (dailyWorkoutDurationMinutes !== undefined) {
      goal.dailyWorkoutDurationMinutes = Number(dailyWorkoutDurationMinutes);
    }
    if (weeklyWorkoutFrequencyDays !== undefined) {
      goal.weeklyWorkoutFrequencyDays = Number(weeklyWorkoutFrequencyDays);
    }
    if (dailyCalorieTarget !== undefined) goal.dailyCalorieTarget = Number(dailyCalorieTarget);
    if (weeklyCalorieBurnTarget !== undefined) {
      goal.weeklyCalorieBurnTarget = Number(weeklyCalorieBurnTarget);
    }
    if (Array.isArray(milestones)) goal.milestones = milestones;

    await goal.save();

    // Also sync targetWeight to User model if provided
    if (targetWeight !== undefined) {
      await User.findByIdAndUpdate(req.user._id, { targetWeight: Number(targetWeight) });
    }

    res.status(200).json({
      success: true,
      message: 'Goals updated successfully',
      goal
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Toggle milestone completion
 * @route   PATCH /api/goals/milestone/:milestoneId/toggle
 * @access  Private
 */
export const toggleMilestone = async (req, res, next) => {
  try {
    const { milestoneId } = req.params;
    const goal = await Goal.findOne({ user: req.user._id });

    if (!goal) {
      return res.status(404).json({ success: false, message: 'Goal profile not found' });
    }

    const milestone = goal.milestones.id(milestoneId);
    if (!milestone) {
      return res.status(404).json({ success: false, message: 'Milestone not found' });
    }

    milestone.isCompleted = !milestone.isCompleted;
    await goal.save();

    res.status(200).json({
      success: true,
      message: `Milestone marked as ${milestone.isCompleted ? 'completed' : 'active'}`,
      goal
    });
  } catch (error) {
    next(error);
  }
};
