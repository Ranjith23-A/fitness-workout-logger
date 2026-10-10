import Workout from '../models/Workout.js';
import User from '../models/User.js';
import Goal from '../models/Goal.js';
import { FitnessMetricsService } from '../services/fitnessMetricsService.js';

/**
 * @desc    Get comprehensive dashboard statistics
 * @route   GET /api/stats/dashboard
 * @access  Private
 */
export const getDashboardStats = async (req, res, next) => {
  try {
    const userId = req.user._id;

    // Load user and goal in parallel
    const [user, goal, workouts] = await Promise.all([
      User.findById(userId),
      Goal.findOne({ user: userId }),
      Workout.find({ user: userId }).sort({ date: -1 })
    ]);

    const metrics = FitnessMetricsService.getUserFitnessSummary(user);

    // Date boundaries
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
    const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // 1. Today's stats
    const todayWorkouts = workouts.filter((w) => {
      const d = new Date(w.date);
      return d >= startOfToday && d <= endOfToday;
    });

    const todayCalories = todayWorkouts.reduce((sum, w) => sum + (w.calories?.grossCalories || 0), 0);
    const todayDuration = todayWorkouts.reduce((sum, w) => sum + (w.durationMinutes || 0), 0);
    const todayWorkoutCount = todayWorkouts.length;

    // 2. Weekly stats (last 7 rolling days)
    const weekWorkouts = workouts.filter((w) => new Date(w.date) >= sevenDaysAgo);
    const weeklyWorkoutCount = weekWorkouts.length;
    const weeklyCalories = weekWorkouts.reduce((sum, w) => sum + (w.calories?.grossCalories || 0), 0);
    const weeklyDuration = weekWorkouts.reduce((sum, w) => sum + (w.durationMinutes || 0), 0);

    // 3. Monthly stats (last 30 rolling days)
    const monthWorkouts = workouts.filter((w) => new Date(w.date) >= thirtyDaysAgo);
    const monthlyWorkoutCount = monthWorkouts.length;
    const monthlyCalories = monthWorkouts.reduce((sum, w) => sum + (w.calories?.grossCalories || 0), 0);
    const monthlyDuration = monthWorkouts.reduce((sum, w) => sum + (w.durationMinutes || 0), 0);

    // 4. Activity goals & targets
    const targetDailyDuration = goal?.dailyWorkoutDurationMinutes || 45;
    const targetWeeklyFrequency = goal?.weeklyWorkoutFrequencyDays || 4;
    const targetDailyCalories = metrics?.dailyCalorieTarget || goal?.dailyCalorieTarget || 2200;

    const dailyDurationProgress = Math.min(100, Math.round((todayDuration / targetDailyDuration) * 100));
    const weeklyFrequencyProgress = Math.min(100, Math.round((weeklyWorkoutCount / targetWeeklyFrequency) * 100));

    // 5. Weight progress
    const currentWeight = user.currentWeight || 70;
    const targetWeight = user.targetWeight || goal?.targetWeight || 68;
    const startingWeight = user.weightHistory && user.weightHistory.length > 0
      ? user.weightHistory[0].weight
      : currentWeight;

    const weightDelta = parseFloat((currentWeight - targetWeight).toFixed(1));
    const totalToLoseOrGain = Math.abs(startingWeight - targetWeight) || 1;
    const weightAchieved = Math.abs(startingWeight - currentWeight);
    const weightProgressPercent = Math.min(100, Math.max(0, Math.round((weightAchieved / totalToLoseOrGain) * 100)));

    // 6. Streak calculation (consecutive calendar days)
    let streak = 0;
    if (workouts.length > 0) {
      // Map all unique workout calendar dates in YYYY-MM-DD
      const workoutDates = new Set(
        workouts.map((w) => {
          const d = new Date(w.date);
          return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        })
      );

      const checkDate = new Date();
      const todayStr = `${checkDate.getFullYear()}-${String(checkDate.getMonth() + 1).padStart(2, '0')}-${String(checkDate.getDate()).padStart(2, '0')}`;

      // Check if worked out today
      let hasToday = workoutDates.has(todayStr);
      let pointer = new Date(checkDate);

      if (!hasToday) {
        // If not today, check if yesterday had a workout to keep streak alive
        pointer.setDate(pointer.getDate() - 1);
        const yestStr = `${pointer.getFullYear()}-${String(pointer.getMonth() + 1).padStart(2, '0')}-${String(pointer.getDate()).padStart(2, '0')}`;
        if (workoutDates.has(yestStr)) {
          streak = 1;
          pointer.setDate(pointer.getDate() - 1);
        }
      } else {
        streak = 1;
        pointer.setDate(pointer.getDate() - 1);
      }

      if (streak > 0) {
        while (true) {
          const pStr = `${pointer.getFullYear()}-${String(pointer.getMonth() + 1).padStart(2, '0')}-${String(pointer.getDate()).padStart(2, '0')}`;
          if (workoutDates.has(pStr)) {
            streak++;
            pointer.setDate(pointer.getDate() - 1);
          } else {
            break;
          }
        }
      }
    }

    // 7. Weekly Activity Chart Data (last 7 days by day name)
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const weeklyChart = [];

    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const startDay = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0);
      const endDay = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);
      const dateKey = `${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}`;

      const dayWorkouts = workouts.filter((w) => {
        const wd = new Date(w.date);
        return wd >= startDay && wd <= endDay;
      });

      weeklyChart.push({
        day: dayNames[d.getDay()],
        date: dateKey,
        calories: dayWorkouts.reduce((sum, w) => sum + (w.calories?.grossCalories || 0), 0),
        duration: dayWorkouts.reduce((sum, w) => sum + (w.durationMinutes || 0), 0),
        workoutsCount: dayWorkouts.length
      });
    }

    // 8. Workout Type Distribution
    const cardioCount = workouts.filter((w) => w.type === 'cardio').length;
    const strengthCount = workouts.filter((w) => w.type === 'strength').length;
    const cardioCalories = workouts
      .filter((w) => w.type === 'cardio')
      .reduce((sum, w) => sum + (w.calories?.grossCalories || 0), 0);
    const strengthCalories = workouts
      .filter((w) => w.type === 'strength')
      .reduce((sum, w) => sum + (w.calories?.grossCalories || 0), 0);

    const typeDistribution = [
      { name: 'Cardio', count: cardioCount, calories: cardioCalories, color: '#06b6d4' },
      { name: 'Strength', count: strengthCount, calories: strengthCalories, color: '#10b981' }
    ];

    // 9. Strength Volume Trends (last 10 strength workouts)
    const strengthVolumeTrends = workouts
      .filter((w) => w.type === 'strength')
      .slice(0, 10)
      .reverse()
      .map((w) => {
        const d = new Date(w.date);
        return {
          date: `${d.getMonth() + 1}/${d.getDate()}`,
          name: w.workoutName || 'Strength',
          volumeKg: w.totalVolumeKg || 0,
          duration: w.durationMinutes || 0
        };
      });

    // 10. Recent workouts (last 5)
    const recentWorkouts = workouts.slice(0, 5);

    res.status(200).json({
      success: true,
      stats: {
        today: {
          calories: todayCalories,
          durationMinutes: todayDuration,
          count: todayWorkoutCount,
          targetDurationMinutes: targetDailyDuration,
          durationProgressPercent: dailyDurationProgress,
          targetCalories: targetDailyCalories
        },
        weekly: {
          workoutCount: weeklyWorkoutCount,
          calories: weeklyCalories,
          durationMinutes: weeklyDuration,
          frequencyTarget: targetWeeklyFrequency,
          frequencyProgressPercent: weeklyFrequencyProgress
        },
        monthly: {
          workoutCount: monthlyWorkoutCount,
          calories: monthlyCalories,
          durationMinutes: monthlyDuration
        },
        streak,
        weight: {
          current: currentWeight,
          target: targetWeight,
          starting: startingWeight,
          delta: weightDelta,
          progressPercent: weightProgressPercent
        },
        metrics,
        charts: {
          weeklyActivity: weeklyChart,
          typeDistribution,
          strengthVolumeTrends
        },
        recentWorkouts
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get progress tracking data and historical trends
 * @route   GET /api/stats/progress
 * @access  Private
 */
export const getProgressStats = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const [user, workouts] = await Promise.all([
      User.findById(userId),
      Workout.find({ user: userId }).sort({ date: 1 })
    ]);

    // 1. Weight & BMI trend from weightHistory
    const weightHistory = (user.weightHistory || [])
      .slice()
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .map((entry) => {
        const d = new Date(entry.date);
        const bmiData = FitnessMetricsService.calculateBMI(entry.weight, user.height);
        return {
          date: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`,
          formattedDate: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          weight: entry.weight,
          bmi: bmiData?.bmi || null,
          note: entry.note || ''
        };
      });

    // 2. Cardio progress trends (distance & duration)
    const cardioTrends = workouts
      .filter((w) => w.type === 'cardio')
      .map((w) => {
        const d = new Date(w.date);
        return {
          date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          activity: w.activityName || w.activityCategory,
          durationMinutes: w.durationMinutes,
          distanceKm: w.distanceKm || 0,
          calories: w.calories?.grossCalories || 0
        };
      });

    // 3. Strength Volume trends
    const strengthTrends = workouts
      .filter((w) => w.type === 'strength')
      .map((w) => {
        const d = new Date(w.date);
        return {
          date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          name: w.workoutName || 'Strength',
          totalVolumeKg: w.totalVolumeKg || 0,
          durationMinutes: w.durationMinutes,
          calories: w.calories?.grossCalories || 0
        };
      });

    // 4. Aggregates
    const totalWorkouts = workouts.length;
    const totalCalories = workouts.reduce((sum, w) => sum + (w.calories?.grossCalories || 0), 0);
    const totalMinutes = workouts.reduce((sum, w) => sum + (w.durationMinutes || 0), 0);
    const totalHours = parseFloat((totalMinutes / 60).toFixed(1));

    res.status(200).json({
      success: true,
      progress: {
        summary: {
          totalWorkouts,
          totalCalories,
          totalMinutes,
          totalHours
        },
        weightHistory,
        cardioTrends,
        strengthTrends
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Calculate real Personal Records (PRs) from logged workouts
 * @route   GET /api/stats/records
 * @access  Private
 */
export const getPersonalRecords = async (req, res, next) => {
  try {
    const workouts = await Workout.find({ user: req.user._id });

    // 1. Strength exercise PRs (max weight lifted and max volume per exercise)
    const exercisePRs = {};

    workouts.forEach((w) => {
      if (w.type === 'strength' && Array.isArray(w.exercises)) {
        w.exercises.forEach((ex) => {
          const name = ex.exerciseName?.trim();
          if (!name) return;

          if (!exercisePRs[name]) {
            exercisePRs[name] = {
              exerciseName: name,
              muscleGroup: ex.muscleGroup,
              maxWeightKg: 0,
              maxRepsAtMaxWeight: 0,
              maxSingleSetVolume: 0,
              dateAchieved: w.date
            };
          }

          if (Array.isArray(ex.sets)) {
            ex.sets.forEach((set) => {
              const weight = Number(set.weightKg) || 0;
              const reps = Number(set.reps) || 0;
              const setVol = weight * reps;

              if (weight > exercisePRs[name].maxWeightKg) {
                exercisePRs[name].maxWeightKg = weight;
                exercisePRs[name].maxRepsAtMaxWeight = reps;
                exercisePRs[name].dateAchieved = w.date;
              }

              if (setVol > exercisePRs[name].maxSingleSetVolume) {
                exercisePRs[name].maxSingleSetVolume = setVol;
              }
            });
          }
        });
      }
    });

    const topExercisePRs = Object.values(exercisePRs).sort((a, b) => b.maxWeightKg - a.maxWeightKg);

    // 2. Cardio Records
    let maxCardioDistance = { value: 0, activity: 'N/A', date: null };
    let maxCardioDuration = { value: 0, activity: 'N/A', date: null };
    let maxSingleWorkoutCalories = { value: 0, activity: 'N/A', type: 'N/A', date: null };
    let maxStrengthVolumeSession = { value: 0, name: 'N/A', date: null };

    workouts.forEach((w) => {
      const grossCal = w.calories?.grossCalories || 0;
      if (grossCal > maxSingleWorkoutCalories.value) {
        maxSingleWorkoutCalories = {
          value: grossCal,
          activity: w.activityName || w.workoutName || 'Workout',
          type: w.type,
          date: w.date
        };
      }

      if (w.type === 'cardio') {
        if (w.distanceKm && w.distanceKm > maxCardioDistance.value) {
          maxCardioDistance = {
            value: w.distanceKm,
            activity: w.activityName || w.activityCategory,
            date: w.date
          };
        }
        if (w.durationMinutes > maxCardioDuration.value) {
          maxCardioDuration = {
            value: w.durationMinutes,
            activity: w.activityName || w.activityCategory,
            date: w.date
          };
        }
      }

      if (w.type === 'strength') {
        const vol = w.totalVolumeKg || 0;
        if (vol > maxStrengthVolumeSession.value) {
          maxStrengthVolumeSession = {
            value: vol,
            name: w.workoutName || 'Strength Session',
            date: w.date
          };
        }
      }
    });

    res.status(200).json({
      success: true,
      records: {
        exercisePRs: topExercisePRs,
        maxCardioDistance,
        maxCardioDuration,
        maxSingleWorkoutCalories,
        maxStrengthVolumeSession
      }
    });
  } catch (error) {
    next(error);
  }
};
