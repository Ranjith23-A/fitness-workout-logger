// Constants and reference standards for Fitness & Workout Logger

export const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;
export const MAX_PASSWORD_BYTES = 72;
export const MIN_PASSWORD_LENGTH = 8;

export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Compendium of Physical Activities MET Reference Values
export const MET_TABLE = {
  walking: {
    low: 2.8,
    moderate: 3.5,
    vigorous: 4.5
  },
  running: {
    low: 7.0,
    moderate: 9.8,
    vigorous: 11.5
  },
  cycling: {
    low: 5.5,
    moderate: 7.5,
    vigorous: 10.0
  },
  treadmill: {
    low: 3.5,
    moderate: 7.0,
    vigorous: 10.5
  },
  swimming: {
    low: 6.0,
    moderate: 7.0,
    vigorous: 9.8
  },
  elliptical: {
    low: 5.0,
    moderate: 6.5,
    vigorous: 8.0
  },
  rowing: {
    low: 4.8,
    moderate: 7.0,
    vigorous: 8.5
  },
  stair_climbing: {
    low: 4.0,
    moderate: 6.0,
    vigorous: 8.8
  },
  jump_rope: {
    low: 8.8,
    moderate: 11.8,
    vigorous: 12.3
  },
  other: {
    low: 4.0,
    moderate: 6.0,
    vigorous: 8.0
  },
  strength: {
    low: 3.5,
    moderate: 5.0,
    vigorous: 6.0
  }
};

// Activity level multipliers for TDEE estimation (Mifflin-St Jeor / Harris-Benedict)
export const ACTIVITY_MULTIPLIERS = {
  sedentary: 1.2,
  lightly_active: 1.375,
  moderately_active: 1.55,
  very_active: 1.725,
  extra_active: 1.9
};

export const FITNESS_GOALS = {
  weight_loss: {
    label: "Weight Loss",
    calorieAdjustment: -500, // conservative ~0.5kg/week deficit
    description: "Moderate calorie deficit aiming for steady, sustainable fat loss"
  },
  maintenance: {
    label: "Weight Maintenance",
    calorieAdjustment: 0,
    description: "Equilibrium energy intake matching estimated daily expenditure"
  },
  muscle_gain: {
    label: "Muscle Gain",
    calorieAdjustment: 300, // conservative lean bulking surplus
    description: "Slight calorie surplus to support muscular hypertrophy and recovery"
  },
  general_fitness: {
    label: "General Fitness",
    calorieAdjustment: 0,
    description: "Health and endurance maintenance with balanced energy availability"
  }
};

// Standard WHO / CDC Adult BMI Categories
export const BMI_CATEGORIES = [
  { min: 0, max: 18.49, category: "Underweight", color: "#38bdf8", description: "Below standard weight range" },
  { min: 18.5, max: 24.99, category: "Normal weight", color: "#10b981", description: "Standard healthy weight range" },
  { min: 25.0, max: 29.99, category: "Overweight", color: "#f59e0b", description: "Above standard weight range" },
  { min: 30.0, max: 999, category: "Obese", color: "#ef4444", description: "Significantly above standard weight range" }
];
