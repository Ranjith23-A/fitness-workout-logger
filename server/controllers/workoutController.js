import Workout from '../models/Workout.js';
import User from '../models/User.js';
import { CalorieService } from '../services/calorieService.js';

/**
 * @desc    Create a new workout (Cardio or Strength)
 * @route   POST /api/workouts
 * @access  Private
 */
export const createWorkout = async (req, res, next) => {
  try {
    const {
      type,
      date,
      durationMinutes,
      notes,
      // Cardio fields
      activityName,
      activityCategory,
      distanceKm,
      intensity = 'moderate',
      averageHeartRate,
      speedKmh,
      inclinePercent,
      // Strength fields
      workoutName,
      exercises
    } = req.body;

    const user = await User.findById(req.user._id);
    const weightKg = user?.currentWeight || 70;

    let calorieData;

    if (type === 'cardio') {
      calorieData = CalorieService.estimateCardioCalories({
        activity: activityCategory || 'other',
        intensity,
        durationMinutes: Number(durationMinutes),
        weightKg,
        speedKmh: speedKmh ? Number(speedKmh) : null,
        inclinePercent: inclinePercent ? Number(inclinePercent) : 0
      });
    } else if (type === 'strength') {
      calorieData = CalorieService.estimateStrengthCalories({
        intensity,
        durationMinutes: Number(durationMinutes),
        weightKg
      });
    } else {
      return res.status(400).json({ success: false, message: 'Invalid workout type. Must be "cardio" or "strength".' });
    }

    const workout = new Workout({
      user: req.user._id,
      type,
      date: date ? new Date(date) : new Date(),
      durationMinutes: Number(durationMinutes),
      notes: notes || '',
      calories: calorieData,
      intensity,
      // Cardio
      ...(type === 'cardio' && {
        activityName: activityName || activityCategory || 'Cardio Workout',
        activityCategory: activityCategory || 'other',
        distanceKm: distanceKm !== undefined && distanceKm !== null && distanceKm !== '' ? Number(distanceKm) : null,
        averageHeartRate: averageHeartRate ? Number(averageHeartRate) : null,
        speedKmh: speedKmh ? Number(speedKmh) : null,
        inclinePercent: inclinePercent ? Number(inclinePercent) : null
      }),
      // Strength
      ...(type === 'strength' && {
        workoutName: workoutName || 'Strength Session',
        exercises: Array.isArray(exercises)
          ? exercises.map((ex) => ({
              exerciseName: ex.exerciseName || 'Exercise',
              muscleGroup: ex.muscleGroup || 'Full Body',
              restTimeSeconds: Number(ex.restTimeSeconds) || 60,
              effortRpe: Number(ex.effortRpe) || 7,
              isBodyweight: Boolean(ex.isBodyweight),
              sets: (ex.sets || []).map((s, idx) => ({
                setNumber: s.setNumber || idx + 1,
                reps: Number(s.reps) || 10,
                weightKg: s.isBodyweight ? 0 : Number(s.weightKg) || 0,
                isBodyweight: Boolean(s.isBodyweight || ex.isBodyweight),
                completed: s.completed !== false
              }))
            }))
          : []
      })
    });

    await workout.save();

    res.status(201).json({
      success: true,
      message: `${type.toUpperCase()} workout logged successfully!`,
      workout
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get workouts with filters, search, and sorting
 * @route   GET /api/workouts
 * @access  Private
 */
export const getWorkouts = async (req, res, next) => {
  try {
    const {
      type,
      timeRange,
      startDate,
      endDate,
      search,
      sortBy = 'newest',
      page = 1,
      limit = 50
    } = req.query;

    const query = { user: req.user._id };

    // 1. Type filter
    if (type && type !== 'all') {
      query.type = type.toLowerCase();
    }

    // 2. Date / Time range filter
    const now = new Date();
    if (timeRange === 'today') {
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
      const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
      query.date = { $gte: startOfDay, $lte: endOfDay };
    } else if (timeRange === '7days') {
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      query.date = { $gte: sevenDaysAgo };
    } else if (timeRange === '30days') {
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      query.date = { $gte: thirtyDaysAgo };
    } else if (timeRange === 'custom' || startDate || endDate) {
      query.date = {};
      if (startDate) {
        query.date.$gte = new Date(startDate);
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.date.$lte = end;
      }
    }

    // 3. Search filter
    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { activityName: searchRegex },
        { activityCategory: searchRegex },
        { workoutName: searchRegex },
        { notes: searchRegex },
        { 'exercises.exerciseName': searchRegex },
        { 'exercises.muscleGroup': searchRegex }
      ];
    }

    // 4. Sorting
    let sortOptions = { date: -1 };
    if (sortBy === 'oldest') {
      sortOptions = { date: 1 };
    } else if (sortBy === 'duration') {
      sortOptions = { durationMinutes: -1, date: -1 };
    } else if (sortBy === 'calories') {
      sortOptions = { 'calories.grossCalories': -1, date: -1 };
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, parseInt(limit, 10) || 50);
    const skip = (pageNum - 1) * limitNum;

    const [total, rawWorkouts] = await Promise.all([
      Workout.countDocuments(query),
      Workout.find(query).sort(sortOptions).skip(skip).limit(limitNum)
    ]);

    // Normalize legacy fields safely
    const workouts = rawWorkouts.map((w) => {
      const obj = w.toObject();
      return {
        ...obj,
        activityName: obj.activityName || obj.workoutName || (obj.type === 'cardio' ? 'Cardio Workout' : 'Strength Session'),
        workoutName: obj.workoutName || obj.activityName || 'Workout',
        durationMinutes: obj.durationMinutes || 0,
        calories: obj.calories || {
          grossCalories: 0,
          netCalories: 0,
          met: 0,
          calculationMethod: 'legacy',
          weightSnapshotKg: 70
        },
        exercises: obj.exercises || []
      };
    });

    res.status(200).json({
      success: true,
      workouts,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum) || 1
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single workout by ID
 * @route   GET /api/workouts/:id
 * @access  Private
 */
export const getWorkoutById = async (req, res, next) => {
  try {
    const workout = await Workout.findById(req.params.id);

    if (!workout) {
      return res.status(404).json({ success: false, message: 'Workout not found.' });
    }

    // Tenant Isolation Check
    if (workout.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Unauthorized. You do not have permission to view this workout.' });
    }

    res.status(200).json({
      success: true,
      workout
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update a workout
 * @route   PUT /api/workouts/:id
 * @access  Private
 */
export const updateWorkout = async (req, res, next) => {
  try {
    const workout = await Workout.findById(req.params.id);

    if (!workout) {
      return res.status(404).json({ success: false, message: 'Workout not found.' });
    }

    // Ownership check
    if (workout.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Unauthorized. You cannot edit another user\'s workout.' });
    }

    const {
      type = workout.type,
      date,
      durationMinutes,
      notes,
      intensity,
      // Cardio
      activityName,
      activityCategory,
      distanceKm,
      averageHeartRate,
      speedKmh,
      inclinePercent,
      // Strength
      workoutName,
      exercises
    } = req.body;

    const user = await User.findById(req.user._id);
    const weightKg = user?.currentWeight || workout.calories?.weightSnapshotKg || 70;
    const newDuration = durationMinutes !== undefined ? Number(durationMinutes) : workout.durationMinutes;
    const newIntensity = intensity || workout.intensity || 'moderate';

    // Recalculate calories authoritatively
    let calorieData;
    if (type === 'cardio') {
      calorieData = CalorieService.estimateCardioCalories({
        activity: activityCategory || workout.activityCategory || 'other',
        intensity: newIntensity,
        durationMinutes: newDuration,
        weightKg,
        speedKmh: speedKmh !== undefined ? Number(speedKmh) : workout.speedKmh,
        inclinePercent: inclinePercent !== undefined ? Number(inclinePercent) : workout.inclinePercent
      });
    } else {
      calorieData = CalorieService.estimateStrengthCalories({
        intensity: newIntensity,
        durationMinutes: newDuration,
        weightKg
      });
    }

    workout.type = type;
    if (date) workout.date = new Date(date);
    workout.durationMinutes = newDuration;
    if (notes !== undefined) workout.notes = notes;
    workout.intensity = newIntensity;
    workout.calories = calorieData;

    if (type === 'cardio') {
      if (activityName !== undefined) workout.activityName = activityName;
      if (activityCategory !== undefined) workout.activityCategory = activityCategory;
      workout.distanceKm = distanceKm !== undefined && distanceKm !== null && distanceKm !== '' ? Number(distanceKm) : null;
      workout.averageHeartRate = averageHeartRate ? Number(averageHeartRate) : null;
      workout.speedKmh = speedKmh ? Number(speedKmh) : null;
      workout.inclinePercent = inclinePercent ? Number(inclinePercent) : null;
      workout.workoutName = undefined;
      workout.exercises = [];
    } else {
      if (workoutName !== undefined) workout.workoutName = workoutName;
      if (Array.isArray(exercises)) {
        workout.exercises = exercises.map((ex) => ({
          exerciseName: ex.exerciseName || 'Exercise',
          muscleGroup: ex.muscleGroup || 'Full Body',
          restTimeSeconds: Number(ex.restTimeSeconds) || 60,
          effortRpe: Number(ex.effortRpe) || 7,
          isBodyweight: Boolean(ex.isBodyweight),
          sets: (ex.sets || []).map((s, idx) => ({
            setNumber: s.setNumber || idx + 1,
            reps: Number(s.reps) || 10,
            weightKg: s.isBodyweight ? 0 : Number(s.weightKg) || 0,
            isBodyweight: Boolean(s.isBodyweight || ex.isBodyweight),
            completed: s.completed !== false
          }))
        }));
      }
      workout.activityCategory = undefined;
      workout.distanceKm = null;
      workout.speedKmh = null;
      workout.inclinePercent = null;
    }

    await workout.save();

    res.status(200).json({
      success: true,
      message: 'Workout updated successfully',
      workout
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a workout
 * @route   DELETE /api/workouts/:id
 * @access  Private
 */
export const deleteWorkout = async (req, res, next) => {
  try {
    const workout = await Workout.findById(req.params.id);

    if (!workout) {
      return res.status(404).json({ success: false, message: 'Workout not found.' });
    }

    // Ownership check
    if (workout.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Unauthorized. You cannot delete another user\'s workout.' });
    }

    await workout.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Workout deleted successfully.'
    });
  } catch (error) {
    next(error);
  }
};
