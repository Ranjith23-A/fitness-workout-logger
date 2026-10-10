import { BMI_CATEGORIES, ACTIVITY_MULTIPLIERS, FITNESS_GOALS } from '../utils/constants.js';

export class FitnessMetricsService {
  /**
   * Calculate Body Mass Index (BMI)
   * @param {number} weightKg - Body weight in kg
   * @param {number} heightCm - Height in cm
   * @returns {Object} BMI value, category, healthy weight range
   */
  static calculateBMI(weightKg, heightCm) {
    if (!weightKg || weightKg <= 0 || !heightCm || heightCm <= 0) {
      return null;
    }

    const heightM = heightCm / 100;
    const bmiValue = parseFloat((weightKg / (heightM * heightM)).toFixed(1));

    const categoryObj = BMI_CATEGORIES.find(
      (c) => bmiValue >= c.min && bmiValue <= c.max
    ) || BMI_CATEGORIES[BMI_CATEGORIES.length - 1];

    // Healthy weight range (BMI 18.5 - 24.9)
    const minHealthyKg = parseFloat((18.5 * heightM * heightM).toFixed(1));
    const maxHealthyKg = parseFloat((24.9 * heightM * heightM).toFixed(1));

    return {
      bmi: bmiValue,
      category: categoryObj.category,
      color: categoryObj.color,
      description: categoryObj.description,
      healthyWeightRange: {
        minKg: minHealthyKg,
        maxKg: maxHealthyKg
      },
      disclaimer: "Standard WHO adult BMI is an epidemiological screening indicator. It does not distinguish between muscle and fat mass, nor is it calibrated for children, pregnant women, or competitive athletes."
    };
  }

  /**
   * Calculate Basal Metabolic Rate (BMR) using Mifflin-St Jeor equation
   * @param {number} weightKg
   * @param {number} heightCm
   * @param {number} age
   * @param {string} sex - 'male' | 'female'
   * @returns {Object}
   */
  static calculateBMR(weightKg, heightCm, age, sex = 'male') {
    if (!weightKg || !heightCm || !age || weightKg <= 0 || heightCm <= 0 || age <= 0) {
      return null;
    }

    const isFemale = String(sex).toLowerCase() === 'female';
    // Mifflin-St Jeor formula:
    // Men: (10 * weight) + (6.25 * height) - (5 * age) + 5
    // Women: (10 * weight) + (6.25 * height) - (5 * age) - 161
    const base = (10 * weightKg) + (6.25 * heightCm) - (5 * age);
    const bmrValue = Math.round(isFemale ? base - 161 : base + 5);

    return {
      bmr: Math.max(500, bmrValue),
      formula: 'Mifflin-St Jeor',
      disclaimer: "Estimated resting metabolic rate assumes typical body composition and basal conditions. Individual metabolic rates vary by organ mass, hormones, and genetics."
    };
  }

  /**
   * Calculate Total Daily Energy Expenditure (TDEE)
   * @param {number} bmr
   * @param {string} activityLevel
   * @returns {number|null}
   */
  static calculateTDEE(bmr, activityLevel = 'sedentary') {
    if (!bmr || bmr <= 0) return null;
    const factor = ACTIVITY_MULTIPLIERS[activityLevel] || ACTIVITY_MULTIPLIERS.sedentary;
    return Math.round(bmr * factor);
  }

  /**
   * Derive daily recommended calorie target based on goal and TDEE
   * @param {number} tdee
   * @param {string} goal
   * @param {string} sex
   * @returns {Object|null}
   */
  static calculateDailyTarget(tdee, goal = 'maintenance', sex = 'male') {
    if (!tdee || tdee <= 0) return null;

    const goalConfig = FITNESS_GOALS[goal] || FITNESS_GOALS.maintenance;
    const adjustment = goalConfig.calorieAdjustment;

    let target = tdee + adjustment;

    // Safety floors: 1200 kcal for females, 1500 kcal for males (safe clinical standard)
    const safetyFloor = String(sex).toLowerCase() === 'female' ? 1200 : 1500;
    if (goal === 'weight_loss' && target < safetyFloor) {
      target = safetyFloor;
    }

    return {
      dailyCalorieTarget: target,
      goal: goalConfig.label,
      goalAdjustment: adjustment,
      description: goalConfig.description,
      note: "Daily calorie targets reflect base daily energy targets including your baseline activity level. Do not double-count logged workout calories if your activity factor already reflects your typical exercise frequency."
    };
  }

  /**
   * Calculate comprehensive fitness summary from user data
   * @param {Object} user
   * @returns {Object}
   */
  static getUserFitnessSummary(user) {
    if (!user) return null;

    const { height, currentWeight, age, sex, activityLevel, fitnessGoal, weightHistory = [] } = user;

    const bmiData = this.calculateBMI(currentWeight, height);
    const bmrData = this.calculateBMR(currentWeight, height, age, sex);
    const tdee = bmrData ? this.calculateTDEE(bmrData.bmr, activityLevel) : null;
    const targetData = tdee ? this.calculateDailyTarget(tdee, fitnessGoal, sex) : null;

    // Check previous weight for BMI comparison
    let previousBmi = null;
    let weightDiff = null;
    if (weightHistory && weightHistory.length > 1) {
      // Sort by date descending
      const sortedHistory = [...weightHistory].sort((a, b) => new Date(b.date) - new Date(a.date));
      // First is current/most recent, second is previous
      const prevEntry = sortedHistory[1];
      if (prevEntry && prevEntry.weight && height) {
        const prevBmiData = this.calculateBMI(prevEntry.weight, height);
        previousBmi = prevBmiData?.bmi || null;
        weightDiff = parseFloat((currentWeight - prevEntry.weight).toFixed(1));
      }
    }

    return {
      bmi: bmiData ? bmiData.bmi : null,
      bmiCategory: bmiData ? bmiData.category : null,
      bmiColor: bmiData ? bmiData.color : null,
      previousBmi,
      weightDiff,
      healthyWeightRange: bmiData?.healthyWeightRange || null,
      bmr: bmrData ? bmrData.bmr : null,
      tdee,
      dailyCalorieTarget: targetData ? targetData.dailyCalorieTarget : null,
      goalDetails: targetData,
      weightKg: currentWeight,
      heightCm: height,
      age,
      sex,
      activityLevel,
      fitnessGoal
    };
  }
}
