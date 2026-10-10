import mongoose from 'mongoose';

const milestoneSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    targetDate: {
      type: Date
    },
    isCompleted: {
      type: Boolean,
      default: false
    },
    notes: {
      type: String,
      default: ''
    }
  },
  { _id: true }
);

const goalSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true
    },
    targetWeight: {
      type: Number,
      min: [20, 'Target weight must be at least 20 kg'],
      max: [400, 'Target weight cannot exceed 400 kg']
    },
    dailyWorkoutDurationMinutes: {
      type: Number,
      default: 45,
      min: [5, 'Daily workout duration must be at least 5 minutes'],
      max: [300, 'Daily workout duration cannot exceed 300 minutes']
    },
    weeklyWorkoutFrequencyDays: {
      type: Number,
      default: 4,
      min: [1, 'Weekly workout frequency must be at least 1 day'],
      max: [7, 'Weekly workout frequency cannot exceed 7 days']
    },
    dailyCalorieTarget: {
      type: Number,
      min: 1000,
      max: 10000
    },
    weeklyCalorieBurnTarget: {
      type: Number,
      default: 2000,
      min: 100,
      max: 20000
    },
    milestones: [milestoneSchema]
  },
  {
    timestamps: true
  }
);

const Goal = mongoose.model('Goal', goalSchema);
export default Goal;
