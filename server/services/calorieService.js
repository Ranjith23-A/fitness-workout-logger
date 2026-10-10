import { MET_TABLE } from '../utils/constants.js';

/**
 * Service to estimate exercise energy expenditure (calories burned)
 * Compliant with exercise physiology standards and the Compendium of Physical Activities.
 */
export class CalorieService {
  /**
   * Estimate calories for Cardio workout
   * @param {Object} params
   * @param {string} params.activity - Activity key (e.g. 'running', 'cycling')
   * @param {string} params.intensity - 'low' | 'moderate' | 'vigorous'
   * @param {number} params.durationMinutes - Workout duration in minutes
   * @param {number} params.weightKg - User body weight in kg
   * @param {number} [params.speedKmh] - Optional treadmill speed in km/h
   * @param {number} [params.inclinePercent] - Optional treadmill incline %
   * @returns {Object} Calorie estimation details
   */
  static estimateCardioCalories({
    activity = 'other',
    intensity = 'moderate',
    durationMinutes,
    weightKg,
    speedKmh = null,
    inclinePercent = 0
  }) {
    if (!durationMinutes || durationMinutes <= 0) {
      throw new Error('Duration must be greater than 0 minutes');
    }
    if (!weightKg || weightKg <= 0) {
      throw new Error('Valid body weight is required for calorie estimation');
    }

    const normalizedActivity = (activity || 'other').toLowerCase().trim().replace(/\s+/g, '_');
    const normalizedIntensity = ['low', 'moderate', 'vigorous'].includes(intensity?.toLowerCase())
      ? intensity.toLowerCase()
      : 'moderate';

    let met = 4.0;
    let method = 'standard_met';

    // ACSM formula for treadmill if speed is provided
    if (normalizedActivity === 'treadmill' && speedKmh && speedKmh > 0) {
      method = 'acsm_treadmill';
      const speedMpm = (speedKmh * 1000) / 60; // meters per minute
      const gradeFraction = Math.max(0, (inclinePercent || 0) / 100);

      let vo2 = 0;
      if (speedKmh <= 7.5) {
        // Walking equation: VO2 = (0.1 * S) + (1.8 * S * G) + 3.5
        vo2 = (0.1 * speedMpm) + (1.8 * speedMpm * gradeFraction) + 3.5;
      } else {
        // Running equation: VO2 = (0.2 * S) + (0.9 * S * G) + 3.5
        vo2 = (0.2 * speedMpm) + (0.9 * speedMpm * gradeFraction) + 3.5;
      }
      met = parseFloat((vo2 / 3.5).toFixed(2));
      // Clamp MET within reasonable physiological boundaries
      met = Math.max(2.0, Math.min(18.0, met));
    } else {
      // Lookup in MET Table
      const activityTable = MET_TABLE[normalizedActivity] || MET_TABLE.other;
      met = activityTable[normalizedIntensity] || activityTable.moderate || 5.0;
    }

    // Formulas:
    // Gross kcal = MET * 3.5 * weightKg / 200 * durationMinutes
    // Net exercise kcal = (MET - 1) * 3.5 * weightKg / 200 * durationMinutes
    const grossCalories = Math.round((met * 3.5 * weightKg / 200) * durationMinutes);
    const netCalories = Math.max(0, Math.round(((met - 1) * 3.5 * weightKg / 200) * durationMinutes));

    return {
      grossCalories,
      netCalories,
      met,
      calculationMethod: method,
      weightSnapshotKg: parseFloat(Number(weightKg).toFixed(1)),
      durationMinutes: Number(durationMinutes),
      intensity: normalizedIntensity,
      disclaimer: "Calorie values are mathematical estimates based on MET standards and average physiological response. Individual expenditure varies based on body composition, fitness level, and environmental conditions."
    };
  }

  /**
   * Estimate calories for Strength workout
   * @param {Object} params
   * @param {string} params.intensity - 'low' | 'moderate' | 'vigorous'
   * @param {number} params.durationMinutes - Total duration in minutes
   * @param {number} params.weightKg - User weight in kg
   * @returns {Object}
   */
  static estimateStrengthCalories({
    intensity = 'moderate',
    durationMinutes,
    weightKg
  }) {
    if (!durationMinutes || durationMinutes <= 0) {
      throw new Error('Duration must be greater than 0 minutes');
    }
    if (!weightKg || weightKg <= 0) {
      throw new Error('Valid body weight is required for calorie estimation');
    }

    const normalizedIntensity = ['low', 'moderate', 'vigorous'].includes(intensity?.toLowerCase())
      ? intensity.toLowerCase()
      : 'moderate';

    const met = MET_TABLE.strength[normalizedIntensity] || 5.0;

    const grossCalories = Math.round((met * 3.5 * weightKg / 200) * durationMinutes);
    const netCalories = Math.max(0, Math.round(((met - 1) * 3.5 * weightKg / 200) * durationMinutes));

    return {
      grossCalories,
      netCalories,
      met,
      calculationMethod: 'strength_effort_met',
      weightSnapshotKg: parseFloat(Number(weightKg).toFixed(1)),
      durationMinutes: Number(durationMinutes),
      intensity: normalizedIntensity,
      disclaimer: "Calorie values are mathematical estimates based on MET standards for resistance training. Actual energy expenditure varies with rest intervals, exercise intensity, and individual muscle mass."
    };
  }
}
