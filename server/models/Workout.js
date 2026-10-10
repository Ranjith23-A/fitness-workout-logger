import mongoose from 'mongoose';

// Schema for individual sets in strength exercises
const strengthSetSchema = new mongoose.Schema(
  {
    setNumber: {
      type: Number,
      required: true,
      min: 1
    },
    reps: {
      type: Number,
      required: [true, 'Reps per set is required'],
      min: [1, 'Reps must be at least 1']
    },
    weightKg: {
      type: Number,
      default: 0,
      min: [0, 'Weight cannot be negative']
    },
    isBodyweight: {
      type: Boolean,
      default: false
    },
    completed: {
      type: Boolean,
      default: true
    }
  },
  { _id: true }
);

// Schema for individual exercises in a strength workout
const strengthExerciseSchema = new mongoose.Schema(
  {
    exerciseName: {
      type: String,
      required: [true, 'Exercise name is required'],
      trim: true
    },
    muscleGroup: {
      type: String,
      enum: ['Chest', 'Back', 'Legs', 'Shoulders', 'Arms', 'Core', 'Full Body', 'Other'],
      default: 'Full Body'
    },
    restTimeSeconds: {
      type: Number,
      default: 60,
      min: 0,
      max: 600
    },
    effortRpe: {
      type: Number,
      min: 1,
      max: 10,
      default: 7
    },
    isBodyweight: {
      type: Boolean,
      default: false
    },
    sets: [strengthSetSchema],
    totalVolumeKg: {
      type: Number,
      default: 0
    }
  },
  { _id: true }
);

const calorieDetailSchema = new mongoose.Schema(
  {
    grossCalories: {
      type: Number,
      required: true,
      min: 0
    },
    netCalories: {
      type: Number,
      required: true,
      min: 0
    },
    met: {
      type: Number,
      required: true
    },
    calculationMethod: {
      type: String,
      required: true
    },
    weightSnapshotKg: {
      type: Number,
      required: true
    },
    disclaimer: {
      type: String,
      default: 'Estimated calories based on standard metabolic equivalent (MET) equations. Individual variance is normal.'
    }
  },
  { _id: false }
);

const workoutSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    type: {
      type: String,
      required: [true, 'Workout type is required'],
      enum: ['cardio', 'strength'],
      index: true
    },
    date: {
      type: Date,
      default: Date.now,
      index: true
    },
    durationMinutes: {
      type: Number,
      required: [true, 'Duration in minutes is required'],
      min: [1, 'Duration must be at least 1 minute'],
      max: [1440, 'Duration cannot exceed 24 hours']
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [1000, 'Notes cannot exceed 1000 characters'],
      default: ''
    },
    calories: {
      type: calorieDetailSchema,
      required: true
    },

    // --- Cardio Specific Fields ---
    activityName: {
      type: String,
      trim: true
    },
    activityCategory: {
      type: String,
      enum: [
        'walking',
        'running',
        'cycling',
        'treadmill',
        'swimming',
        'elliptical',
        'rowing',
        'stair_climbing',
        'jump_rope',
        'other'
      ]
    },
    distanceKm: {
      type: Number,
      min: [0, 'Distance cannot be negative'],
      default: null
    },
    intensity: {
      type: String,
      enum: ['low', 'moderate', 'vigorous'],
      default: 'moderate'
    },
    averageHeartRate: {
      type: Number,
      min: [30, 'Average heart rate must be reasonable (>30 bpm)'],
      max: [240, 'Average heart rate must be reasonable (<240 bpm)'],
      default: null
    },
    speedKmh: {
      type: Number,
      min: 0,
      default: null
    },
    inclinePercent: {
      type: Number,
      min: 0,
      max: 40,
      default: null
    },

    // --- Strength Specific Fields ---
    workoutName: {
      type: String,
      trim: true
    },
    exercises: [strengthExerciseSchema],
    totalVolumeKg: {
      type: Number,
      default: 0,
      min: 0
    }
  },
  {
    timestamps: true
  }
);

// Pre-save hook: compute strength volume if strength workout
workoutSchema.pre('save', function (next) {
  if (this.type === 'strength' && this.exercises && this.exercises.length > 0) {
    let grandVolume = 0;
    this.exercises.forEach((ex) => {
      let exVol = 0;
      if (ex.sets && ex.sets.length > 0) {
        ex.sets.forEach((set) => {
          if (set.completed !== false) {
            // For bodyweight exercises without added weight, external load volume is 0
            const load = set.isBodyweight ? (set.weightKg || 0) : (set.weightKg || 0);
            exVol += (set.reps || 0) * load;
          }
        });
      }
      ex.totalVolumeKg = Math.round(exVol);
      grandVolume += exVol;
    });
    this.totalVolumeKg = Math.round(grandVolume);
  }
  next();
});

// Indexes for high-performance dashboard, history, and analytics queries
workoutSchema.index({ user: 1, date: -1 });
workoutSchema.index({ user: 1, type: 1, date: -1 });

const Workout = mongoose.model('Workout', workoutSchema);
export default Workout;
