import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { PASSWORD_REGEX, MAX_PASSWORD_BYTES, MIN_PASSWORD_LENGTH, EMAIL_REGEX } from '../utils/constants.js';

const weightEntrySchema = new mongoose.Schema(
  {
    weight: {
      type: Number,
      required: [true, 'Weight is required'],
      min: [20, 'Weight must be at least 20 kg'],
      max: [400, 'Weight cannot exceed 400 kg']
    },
    date: {
      type: Date,
      default: Date.now
    },
    note: {
      type: String,
      trim: true,
      maxlength: [200, 'Note cannot exceed 200 characters'],
      default: ''
    }
  },
  { _id: true }
);

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [70, 'Name cannot exceed 70 characters']
    },
    email: {
      type: String,
      required: [true, 'Email address is required'],
      unique: true,
      trim: true,
      lowercase: true,
      validate: {
        validator: function (v) {
          return EMAIL_REGEX.test(v);
        },
        message: 'Please provide a valid email address'
      }
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [MIN_PASSWORD_LENGTH, 'Password must be at least 8 characters']
    },
    isEmailVerified: {
      type: Boolean,
      default: false
    },
    emailVerificationOtp: {
      type: String,
      default: null
    },
    emailVerificationExpires: {
      type: Date,
      default: null
    },
    // Fitness Profile Attributes
    age: {
      type: Number,
      min: [10, 'Age must be at least 10'],
      max: [120, 'Age cannot exceed 120'],
      default: 25
    },
    sex: {
      type: String,
      enum: {
        values: ['male', 'female', 'other'],
        message: 'Sex must be either male, female, or other'
      },
      default: 'male'
    },
    height: {
      type: Number,
      min: [50, 'Height must be at least 50 cm'],
      max: [280, 'Height cannot exceed 280 cm'],
      default: 175
    },
    currentWeight: {
      type: Number,
      min: [20, 'Current weight must be at least 20 kg'],
      max: [400, 'Current weight cannot exceed 400 kg'],
      default: 70
    },
    targetWeight: {
      type: Number,
      min: [20, 'Target weight must be at least 20 kg'],
      max: [400, 'Target weight cannot exceed 400 kg'],
      default: 68
    },
    activityLevel: {
      type: String,
      enum: ['sedentary', 'lightly_active', 'moderately_active', 'very_active', 'extra_active'],
      default: 'moderately_active'
    },
    fitnessGoal: {
      type: String,
      enum: ['weight_loss', 'maintenance', 'muscle_gain', 'general_fitness'],
      default: 'general_fitness'
    },
    preferredWorkoutTypes: {
      type: [String],
      default: ['cardio', 'strength']
    },
    weightHistory: [weightEntrySchema]
  },
  {
    timestamps: true
  }
);

// Pre-save hook: Hash password and ensure UTF-8 byte boundary check
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }

  // Validate byte length for bcrypt safety
  const byteLength = Buffer.byteLength(this.password, 'utf8');
  if (byteLength > MAX_PASSWORD_BYTES) {
    return next(new Error(`Password exceeds maximum limit of ${MAX_PASSWORD_BYTES} UTF-8 bytes`));
  }

  // Validate regex requirements
  if (!PASSWORD_REGEX.test(this.password)) {
    return next(
      new Error(
        'Password must contain at least 8 characters, including 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character'
      )
    );
  }

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// Method to verify password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Safe JSON serialization: omit password and internal verification tokens
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.emailVerificationOtp;
  delete obj.emailVerificationExpires;
  return obj;
};

const User = mongoose.model('User', userSchema);
export default User;
