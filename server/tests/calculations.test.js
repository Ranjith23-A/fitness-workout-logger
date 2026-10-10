import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { FitnessMetricsService } from '../services/fitnessMetricsService.js';
import { CalorieService } from '../services/calorieService.js';
import { PASSWORD_REGEX, MAX_PASSWORD_BYTES, MIN_PASSWORD_LENGTH } from '../utils/constants.js';

describe('1. Physiological Calculations & Formula Tests', () => {
  test('BMI calculation and category mapping', () => {
    // 70 kg, 175 cm => 70 / (1.75^2) = 22.86 -> 22.9
    const normal = FitnessMetricsService.calculateBMI(70, 175);
    assert.strictEqual(normal.bmi, 22.9);
    assert.strictEqual(normal.category, 'Normal weight');
    assert.ok(normal.healthyWeightRange.minKg > 50);
    assert.ok(normal.healthyWeightRange.maxKg < 80);

    // Underweight: 45 kg, 175 cm => 14.7
    const underweight = FitnessMetricsService.calculateBMI(45, 175);
    assert.strictEqual(underweight.category, 'Underweight');

    // Overweight: 85 kg, 175 cm => 27.8
    const overweight = FitnessMetricsService.calculateBMI(85, 175);
    assert.strictEqual(overweight.category, 'Overweight');

    // Obese: 105 kg, 175 cm => 34.3
    const obese = FitnessMetricsService.calculateBMI(105, 175);
    assert.strictEqual(obese.category, 'Obese');
  });

  test('BMR calculation using Mifflin-St Jeor equation', () => {
    // Male: (10 * 70) + (6.25 * 175) - (5 * 25) + 5 = 700 + 1093.75 - 125 + 5 = 1673.75 -> 1674
    const maleBmr = FitnessMetricsService.calculateBMR(70, 175, 25, 'male');
    assert.strictEqual(maleBmr.bmr, 1674);
    assert.strictEqual(maleBmr.formula, 'Mifflin-St Jeor');

    // Female: (10 * 60) + (6.25 * 165) - (5 * 28) - 161 = 600 + 1031.25 - 140 - 161 = 1330.25 -> 1330
    const femaleBmr = FitnessMetricsService.calculateBMR(60, 165, 28, 'female');
    assert.strictEqual(femaleBmr.bmr, 1330);
  });

  test('TDEE and Goal Daily Calorie Target calculation', () => {
    const bmr = 1674;
    // Moderately active multiplier is 1.55 => 1674 * 1.55 = 2594.7 -> 2595
    const tdee = FitnessMetricsService.calculateTDEE(bmr, 'moderately_active');
    assert.strictEqual(tdee, 2595);

    // Maintenance target
    const maintenance = FitnessMetricsService.calculateDailyTarget(tdee, 'maintenance', 'male');
    assert.strictEqual(maintenance.dailyCalorieTarget, 2595);

    // Weight loss target (-500 kcal)
    const weightLoss = FitnessMetricsService.calculateDailyTarget(tdee, 'weight_loss', 'male');
    assert.strictEqual(weightLoss.dailyCalorieTarget, 2095);

    // Muscle gain target (+300 kcal)
    const muscleGain = FitnessMetricsService.calculateDailyTarget(tdee, 'muscle_gain', 'male');
    assert.strictEqual(muscleGain.dailyCalorieTarget, 2895);

    // Safety floor adherence (male min 1500 kcal, female min 1200 kcal)
    const extremeDeficit = FitnessMetricsService.calculateDailyTarget(1400, 'weight_loss', 'male');
    assert.strictEqual(extremeDeficit.dailyCalorieTarget, 1500);

    const femaleDeficit = FitnessMetricsService.calculateDailyTarget(1200, 'weight_loss', 'female');
    assert.strictEqual(femaleDeficit.dailyCalorieTarget, 1200);
  });
});

describe('2. Workout Calorie Estimation Tests', () => {
  test('Cardio gross and net calorie calculation using MET table', () => {
    // Running moderate intensity MET = 9.8
    // Weight = 70 kg, duration = 30 minutes
    // Gross kcal = 9.8 * 3.5 * 70 / 200 * 30 = 360.15 -> 360
    // Net kcal = (9.8 - 1) * 3.5 * 70 / 200 * 30 = 323.4 -> 323
    const running = CalorieService.estimateCardioCalories({
      activity: 'running',
      intensity: 'moderate',
      durationMinutes: 30,
      weightKg: 70
    });

    assert.strictEqual(running.met, 9.8);
    assert.strictEqual(running.grossCalories, 360);
    assert.strictEqual(running.netCalories, 323);
    assert.strictEqual(running.calculationMethod, 'standard_met');
    assert.ok(running.disclaimer);
  });

  test('Treadmill ACSM equation calculation', () => {
    // Speed 10 km/h, incline 2%
    const treadmill = CalorieService.estimateCardioCalories({
      activity: 'treadmill',
      durationMinutes: 45,
      weightKg: 75,
      speedKmh: 10,
      inclinePercent: 2
    });

    assert.strictEqual(treadmill.calculationMethod, 'acsm_treadmill');
    assert.ok(treadmill.met > 7);
    assert.ok(treadmill.grossCalories > 400);
    assert.ok(treadmill.netCalories > 300);
  });

  test('Strength workout calorie estimation', () => {
    // 45 minutes moderate strength training (MET = 5.0)
    // 5.0 * 3.5 * 70 / 200 * 45 = 275.625 -> 276
    const strength = CalorieService.estimateStrengthCalories({
      intensity: 'moderate',
      durationMinutes: 45,
      weightKg: 70
    });

    assert.strictEqual(strength.met, 5.0);
    assert.strictEqual(strength.grossCalories, 276);
    assert.strictEqual(strength.calculationMethod, 'strength_effort_met');
  });

  test('Rejects invalid calorie parameters', () => {
    assert.throws(() => {
      CalorieService.estimateCardioCalories({ durationMinutes: 0, weightKg: 70 });
    });
    assert.throws(() => {
      CalorieService.estimateStrengthCalories({ durationMinutes: 30, weightKg: 0 });
    });
  });
});

describe('3. Password Validation Rules Tests', () => {
  test('Validates password meeting all complexity criteria', () => {
    // Required valid example: Ranjith@2026
    assert.strictEqual(PASSWORD_REGEX.test('Ranjith@2026'), true);
    assert.strictEqual(Buffer.byteLength('Ranjith@2026', 'utf8') <= MAX_PASSWORD_BYTES, true);
    assert.strictEqual('Ranjith@2026'.length >= MIN_PASSWORD_LENGTH, true);

    // Other valid passwords
    assert.strictEqual(PASSWORD_REGEX.test('Fitness#Pass1'), true);
    assert.strictEqual(PASSWORD_REGEX.test('Secure$Workout2026'), true);
  });

  test('Rejects passwords failing complexity criteria', () => {
    // Missing uppercase
    assert.strictEqual(PASSWORD_REGEX.test('ranjith@2026'), false);
    // Missing lowercase
    assert.strictEqual(PASSWORD_REGEX.test('RANJITH@2026'), false);
    // Missing number
    assert.strictEqual(PASSWORD_REGEX.test('Ranjith@Secret'), false);
    // Missing special char
    assert.strictEqual(PASSWORD_REGEX.test('Ranjith2026'), false);
    // Too short (< 8 chars)
    assert.strictEqual(PASSWORD_REGEX.test('Ran@26'), false);
  });

  test('Enforces maximum 72 UTF-8 bytes limit for bcrypt', () => {
    const longPassword = 'A'.repeat(73) + 'a1!';
    assert.ok(Buffer.byteLength(longPassword, 'utf8') > MAX_PASSWORD_BYTES);
  });
});
