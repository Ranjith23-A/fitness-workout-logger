// Frontend calculation utilities mirroring authoritative backend calculations

export const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;
export const MAX_PASSWORD_BYTES = 72;

export const evaluatePasswordStrength = (password = '') => {
  if (!password) {
    return {
      score: 0,
      label: 'Too short',
      color: '#6b7280',
      hasLength: false,
      hasUpper: false,
      hasLower: false,
      hasNumber: false,
      hasSpecial: false,
      isByteSafe: true
    };
  }

  const hasLength = password.length >= 8;
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
  const byteCount = new TextEncoder().encode(password).length;
  const isByteSafe = byteCount <= MAX_PASSWORD_BYTES;

  let checksPassed = 0;
  if (hasLength) checksPassed++;
  if (hasUpper) checksPassed++;
  if (hasLower) checksPassed++;
  if (hasNumber) checksPassed++;
  if (hasSpecial) checksPassed++;

  let label = 'Weak';
  let color = '#ef4444'; // Red
  let score = 1;

  if (checksPassed === 5 && isByteSafe) {
    label = 'Strong';
    color = '#10b981'; // Green
    score = 4;
  } else if (checksPassed >= 4) {
    label = 'Good';
    color = '#3b82f6'; // Blue
    score = 3;
  } else if (checksPassed >= 3) {
    label = 'Fair';
    color = '#f59e0b'; // Amber
    score = 2;
  }

  return {
    score,
    label,
    color,
    hasLength,
    hasUpper,
    hasLower,
    hasNumber,
    hasSpecial,
    isByteSafe,
    byteCount,
    isValid: checksPassed === 5 && isByteSafe
  };
};

export const MET_TABLE = {
  walking: { low: 2.8, moderate: 3.5, vigorous: 4.5 },
  running: { low: 7.0, moderate: 9.8, vigorous: 11.5 },
  cycling: { low: 5.5, moderate: 7.5, vigorous: 10.0 },
  treadmill: { low: 3.5, moderate: 7.0, vigorous: 10.5 },
  swimming: { low: 6.0, moderate: 7.0, vigorous: 9.8 },
  elliptical: { low: 5.0, moderate: 6.5, vigorous: 8.0 },
  rowing: { low: 4.8, moderate: 7.0, vigorous: 8.5 },
  stair_climbing: { low: 4.0, moderate: 6.0, vigorous: 8.8 },
  jump_rope: { low: 8.8, moderate: 11.8, vigorous: 12.3 },
  other: { low: 4.0, moderate: 6.0, vigorous: 8.0 },
  strength: { low: 3.5, moderate: 5.0, vigorous: 6.0 }
};

export const ACTIVITY_MULTIPLIERS = {
  sedentary: 1.2,
  lightly_active: 1.375,
  moderately_active: 1.55,
  very_active: 1.725,
  extra_active: 1.9
};

export const calculateBMI = (weightKg, heightCm) => {
  if (!weightKg || !heightCm || weightKg <= 0 || heightCm <= 0) return null;
  const m = heightCm / 100;
  const bmi = parseFloat((weightKg / (m * m)).toFixed(1));

  let category = 'Normal weight';
  let color = '#10b981';
  if (bmi < 18.5) {
    category = 'Underweight';
    color = '#38bdf8';
  } else if (bmi >= 25 && bmi < 30) {
    category = 'Overweight';
    color = '#f59e0b';
  } else if (bmi >= 30) {
    category = 'Obese';
    color = '#ef4444';
  }

  const minHealthyKg = parseFloat((18.5 * m * m).toFixed(1));
  const maxHealthyKg = parseFloat((24.9 * m * m).toFixed(1));

  return { bmi, category, color, minHealthyKg, maxHealthyKg };
};

export const calculateBMR = (weightKg, heightCm, age, sex = 'male') => {
  if (!weightKg || !heightCm || !age) return null;
  const base = (10 * weightKg) + (6.25 * heightCm) - (5 * age);
  const isFemale = String(sex).toLowerCase() === 'female';
  return Math.round(isFemale ? base - 161 : base + 5);
};

export const calculateTDEE = (bmr, activityLevel = 'sedentary') => {
  if (!bmr) return null;
  const factor = ACTIVITY_MULTIPLIERS[activityLevel] || 1.2;
  return Math.round(bmr * factor);
};

export const estimateCardioCalories = ({
  activity = 'other',
  intensity = 'moderate',
  durationMinutes = 30,
  weightKg = 70,
  speedKmh = null,
  inclinePercent = 0
}) => {
  if (!durationMinutes || durationMinutes <= 0 || !weightKg || weightKg <= 0) {
    return { grossCalories: 0, netCalories: 0, met: 0 };
  }

  let met = 4.0;
  const actKey = (activity || 'other').toLowerCase().replace(/\s+/g, '_');
  const intKey = ['low', 'moderate', 'vigorous'].includes(intensity) ? intensity : 'moderate';

  if (actKey === 'treadmill' && speedKmh && Number(speedKmh) > 0) {
    const s = (Number(speedKmh) * 1000) / 60;
    const grade = Math.max(0, (Number(inclinePercent) || 0) / 100);
    const vo2 = Number(speedKmh) <= 7.5 ? (0.1 * s) + (1.8 * s * grade) + 3.5 : (0.2 * s) + (0.9 * s * grade) + 3.5;
    met = parseFloat((vo2 / 3.5).toFixed(2));
  } else {
    const act = MET_TABLE[actKey] || MET_TABLE.other;
    met = act[intKey] || act.moderate || 5.0;
  }

  const grossCalories = Math.round((met * 3.5 * weightKg / 200) * durationMinutes);
  const netCalories = Math.max(0, Math.round(((met - 1) * 3.5 * weightKg / 200) * durationMinutes));

  return { grossCalories, netCalories, met };
};

export const estimateStrengthCalories = ({
  intensity = 'moderate',
  durationMinutes = 45,
  weightKg = 70
}) => {
  if (!durationMinutes || durationMinutes <= 0 || !weightKg || weightKg <= 0) {
    return { grossCalories: 0, netCalories: 0, met: 0 };
  }
  const intKey = ['low', 'moderate', 'vigorous'].includes(intensity) ? intensity : 'moderate';
  const met = MET_TABLE.strength[intKey] || 5.0;

  const grossCalories = Math.round((met * 3.5 * weightKg / 200) * durationMinutes);
  const netCalories = Math.max(0, Math.round(((met - 1) * 3.5 * weightKg / 200) * durationMinutes));

  return { grossCalories, netCalories, met };
};

export const formatDuration = (minutes) => {
  if (!minutes) return '0 min';
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m} min`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
};
