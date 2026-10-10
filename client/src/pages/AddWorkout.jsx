import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Flame,
  Clock,
  Heart,
  Plus,
  Trash2,
  Dumbbell,
  Activity,
  CheckCircle2,
  AlertCircle,
  HelpCircle
} from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { estimateCardioCalories, estimateStrengthCalories } from '../utils/calculations';

const AddWorkout = () => {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();

  const [workoutType, setWorkoutType] = useState('cardio'); // 'cardio' | 'strength'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // General fields
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 16));
  const [durationMinutes, setDurationMinutes] = useState(30);
  const [intensity, setIntensity] = useState('moderate');
  const [notes, setNotes] = useState('');

  // Cardio fields
  const [activityCategory, setActivityCategory] = useState('running');
  const [activityName, setActivityName] = useState('Outdoor Run');
  const [distanceKm, setDistanceKm] = useState(5.0);
  const [averageHeartRate, setAverageHeartRate] = useState('');
  const [speedKmh, setSpeedKmh] = useState('');
  const [inclinePercent, setInclinePercent] = useState('');

  // Strength fields
  const [workoutName, setWorkoutName] = useState('Upper Body Hypertrophy');
  const [exercises, setExercises] = useState([
    {
      exerciseName: 'Barbell Bench Press',
      muscleGroup: 'Chest',
      restTimeSeconds: 90,
      effortRpe: 8,
      isBodyweight: false,
      sets: [
        { setNumber: 1, reps: 10, weightKg: 60, isBodyweight: false },
        { setNumber: 2, reps: 8, weightKg: 70, isBodyweight: false },
        { setNumber: 3, reps: 6, weightKg: 80, isBodyweight: false }
      ]
    }
  ]);

  const userWeight = user?.currentWeight || 70;

  // Real-time live calorie preview
  const liveCalories = useMemo(() => {
    if (workoutType === 'cardio') {
      return estimateCardioCalories({
        activity: activityCategory,
        intensity,
        durationMinutes: Number(durationMinutes) || 0,
        weightKg: userWeight,
        speedKmh: speedKmh ? Number(speedKmh) : null,
        inclinePercent: inclinePercent ? Number(inclinePercent) : 0
      });
    } else {
      return estimateStrengthCalories({
        intensity,
        durationMinutes: Number(durationMinutes) || 0,
        weightKg: userWeight
      });
    }
  }, [workoutType, activityCategory, intensity, durationMinutes, userWeight, speedKmh, inclinePercent]);

  // Live total volume preview for strength
  const liveTotalVolume = useMemo(() => {
    if (workoutType !== 'strength') return 0;
    let vol = 0;
    exercises.forEach((ex) => {
      ex.sets.forEach((s) => {
        const load = s.isBodyweight ? 0 : Number(s.weightKg) || 0;
        vol += (Number(s.reps) || 0) * load;
      });
    });
    return Math.round(vol);
  }, [workoutType, exercises]);

  // Exercise manipulation helpers
  const handleAddExercise = () => {
    setExercises([
      ...exercises,
      {
        exerciseName: 'Dumbbell Shoulder Press',
        muscleGroup: 'Shoulders',
        restTimeSeconds: 60,
        effortRpe: 7,
        isBodyweight: false,
        sets: [{ setNumber: 1, reps: 10, weightKg: 16, isBodyweight: false }]
      }
    ]);
  };

  const handleRemoveExercise = (idx) => {
    if (exercises.length <= 1) {
      setError('A strength workout must include at least one exercise.');
      return;
    }
    setExercises(exercises.filter((_, i) => i !== idx));
  };

  const handleExerciseChange = (idx, field, value) => {
    const updated = [...exercises];
    updated[idx][field] = value;
    setExercises(updated);
  };

  const handleAddSet = (exIdx) => {
    const updated = [...exercises];
    const targetEx = updated[exIdx];
    const prevSet = targetEx.sets[targetEx.sets.length - 1];
    targetEx.sets.push({
      setNumber: targetEx.sets.length + 1,
      reps: prevSet ? prevSet.reps : 10,
      weightKg: prevSet ? prevSet.weightKg : 20,
      isBodyweight: targetEx.isBodyweight || false
    });
    setExercises(updated);
  };

  const handleRemoveSet = (exIdx, setIdx) => {
    const updated = [...exercises];
    if (updated[exIdx].sets.length <= 1) return;
    updated[exIdx].sets = updated[exIdx].sets.filter((_, sIndex) => sIndex !== setIdx);
    // Renumber sets
    updated[exIdx].sets.forEach((s, i) => (s.setNumber = i + 1));
    setExercises(updated);
  };

  const handleSetChange = (exIdx, setIdx, field, value) => {
    const updated = [...exercises];
    updated[exIdx].sets[setIdx][field] = value;
    setExercises(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const payload = {
        type: workoutType,
        date: new Date(date).toISOString(),
        durationMinutes: Number(durationMinutes),
        intensity,
        notes: notes.trim(),
        ...(workoutType === 'cardio'
          ? {
              activityName: activityName.trim() || activityCategory,
              activityCategory,
              distanceKm: distanceKm ? Number(distanceKm) : null,
              averageHeartRate: averageHeartRate ? Number(averageHeartRate) : null,
              speedKmh: speedKmh ? Number(speedKmh) : null,
              inclinePercent: inclinePercent ? Number(inclinePercent) : null
            }
          : {
              workoutName: workoutName.trim() || 'Strength Session',
              exercises
            })
      };

      const res = await api.post('/workouts', payload);
      if (res.data.success) {
        setSuccess('Workout logged successfully!');
        await refreshUser();
        setTimeout(() => {
          navigate('/history');
        }, 800);
      }
    } catch (err) {
      setError(
        err.response?.data?.message || 'Failed to save workout. Please verify your entries.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '980px', margin: '0 auto' }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <Plus size={26} color="var(--accent-primary)" />
            Log Workout
          </h1>
          <p className="page-subtitle">
            Record cardio endurance or strength training with automatic physiological MET estimation
          </p>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="alert alert-success">
          <CheckCircle2 size={18} />
          <span>{success}</span>
        </div>
      )}

      {/* Workout Type Selector Tabs */}
      <div
        style={{
          display: 'flex',
          backgroundColor: 'var(--bg-secondary)',
          padding: '6px',
          borderRadius: 'var(--radius-lg)',
          marginBottom: '24px',
          border: '1px solid var(--border-color)'
        }}
      >
        <button
          type="button"
          onClick={() => setWorkoutType('cardio')}
          style={{
            flex: 1,
            padding: '12px',
            borderRadius: 'var(--radius-md)',
            fontWeight: 700,
            fontSize: '1rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            backgroundColor: workoutType === 'cardio' ? 'var(--accent-secondary)' : 'transparent',
            color: workoutType === 'cardio' ? '#ffffff' : 'var(--text-secondary)',
            transition: 'all 0.2s'
          }}
        >
          <Activity size={20} />
          <span>Cardio Workout</span>
        </button>

        <button
          type="button"
          onClick={() => setWorkoutType('strength')}
          style={{
            flex: 1,
            padding: '12px',
            borderRadius: 'var(--radius-md)',
            fontWeight: 700,
            fontSize: '1rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            backgroundColor: workoutType === 'strength' ? 'var(--accent-primary)' : 'transparent',
            color: workoutType === 'strength' ? '#ffffff' : 'var(--text-secondary)',
            transition: 'all 0.2s'
          }}
        >
          <Dumbbell size={20} />
          <span>Strength Workout</span>
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Common Workout Meta Header Card */}
        <div className="card" style={{ marginBottom: '24px' }}>
          <h3 className="card-title">Session Schedule &amp; Effort</h3>

          <div className="grid grid-cols-3">
            <div className="form-group">
              <label className="form-label">Date and Time</label>
              <input
                type="datetime-local"
                className="form-control"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Duration (Minutes)</label>
              <input
                type="number"
                min="1"
                max="1440"
                className="form-control"
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Intensity / Effort</label>
              <select
                className="form-control"
                value={intensity}
                onChange={(e) => setIntensity(e.target.value)}
              >
                <option value="low">Low (Light conversation pace / long rest)</option>
                <option value="moderate">Moderate (Elevated HR / solid effort)</option>
                <option value="vigorous">Vigorous (High intensity / circuit / sprinting)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Cardio Workout Form */}
        {workoutType === 'cardio' ? (
          <div className="card" style={{ marginBottom: '24px' }}>
            <h3 className="card-title">Cardio Activity Details</h3>

            <div className="grid grid-cols-2">
              <div className="form-group">
                <label className="form-label">Activity Category</label>
                <select
                  className="form-control"
                  value={activityCategory}
                  onChange={(e) => {
                    setActivityCategory(e.target.value);
                    setActivityName(`${e.target.value.charAt(0).toUpperCase() + e.target.value.slice(1).replace('_', ' ')} Workout`);
                  }}
                >
                  <option value="running">Running</option>
                  <option value="walking">Walking</option>
                  <option value="cycling">Cycling</option>
                  <option value="treadmill">Treadmill</option>
                  <option value="swimming">Swimming</option>
                  <option value="elliptical">Elliptical</option>
                  <option value="rowing">Rowing</option>
                  <option value="stair_climbing">Stair Climbing</option>
                  <option value="jump_rope">Jump Rope</option>
                  <option value="other">Other Cardio</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Activity / Workout Name</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. Morning River Run"
                  value={activityName}
                  onChange={(e) => setActivityName(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-3">
              <div className="form-group">
                <label className="form-label">Distance (km, optional)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  className="form-control"
                  placeholder="e.g. 5.2"
                  value={distanceKm}
                  onChange={(e) => setDistanceKm(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Avg Heart Rate (bpm, optional)</label>
                <input
                  type="number"
                  min="30"
                  max="240"
                  className="form-control"
                  placeholder="e.g. 148"
                  value={averageHeartRate}
                  onChange={(e) => setAverageHeartRate(e.target.value)}
                />
              </div>

              {activityCategory === 'treadmill' && (
                <>
                  <div className="form-group">
                    <label className="form-label">Treadmill Speed (km/h)</label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      className="form-control"
                      placeholder="e.g. 9.5"
                      value={speedKmh}
                      onChange={(e) => setSpeedKmh(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Incline (%)</label>
                    <input
                      type="number"
                      step="0.5"
                      min="0"
                      max="30"
                      className="form-control"
                      placeholder="e.g. 2.0"
                      value={inclinePercent}
                      onChange={(e) => setInclinePercent(e.target.value)}
                    />
                  </div>
                </>
              )}
            </div>
          </div>
        ) : (
          /* Strength Workout Form */
          <div className="card" style={{ marginBottom: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 className="card-title" style={{ marginBottom: 0 }}>Exercises &amp; Sets</h3>
              <div className="badge badge-primary" style={{ fontSize: '0.85rem' }}>
                Total Volume: {liveTotalVolume} kg
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Workout Routine Name</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. Push Day (Chest &amp; Triceps)"
                value={workoutName}
                onChange={(e) => setWorkoutName(e.target.value)}
                required
              />
            </div>

            {/* Exercise List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '16px' }}>
              {exercises.map((exercise, exIdx) => (
                <div
                  key={exIdx}
                  style={{
                    padding: '16px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--bg-secondary)',
                    border: '1px solid var(--border-color)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <span style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--accent-primary)' }}>
                      Exercise #{exIdx + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveExercise(exIdx)}
                      className="btn btn-secondary btn-sm"
                      style={{ color: 'var(--accent-red)' }}
                    >
                      <Trash2 size={15} /> Remove
                    </button>
                  </div>

                  <div className="grid grid-cols-3" style={{ marginBottom: '14px' }}>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">Exercise Name</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="e.g. Barbell Squat"
                        value={exercise.exerciseName}
                        onChange={(e) => handleExerciseChange(exIdx, 'exerciseName', e.target.value)}
                        required
                      />
                    </div>

                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">Muscle Group</label>
                      <select
                        className="form-control"
                        value={exercise.muscleGroup}
                        onChange={(e) => handleExerciseChange(exIdx, 'muscleGroup', e.target.value)}
                      >
                        <option value="Chest">Chest</option>
                        <option value="Back">Back</option>
                        <option value="Legs">Legs</option>
                        <option value="Shoulders">Shoulders</option>
                        <option value="Arms">Arms</option>
                        <option value="Core">Core</option>
                        <option value="Full Body">Full Body</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">Rest Time (Seconds)</label>
                      <input
                        type="number"
                        min="0"
                        max="600"
                        className="form-control"
                        value={exercise.restTimeSeconds}
                        onChange={(e) => handleExerciseChange(exIdx, 'restTimeSeconds', Number(e.target.value))}
                      />
                    </div>
                  </div>

                  {/* Sets Builder Table */}
                  <div style={{ marginTop: '12px' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                      Sets Breakdown
                    </span>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px' }}>
                      {exercise.sets.map((set, sIdx) => (
                        <div
                          key={sIdx}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            backgroundColor: 'var(--bg-input)',
                            padding: '8px 12px',
                            borderRadius: 'var(--radius-sm)'
                          }}
                        >
                          <span style={{ fontSize: '0.85rem', fontWeight: 600, width: '45px', color: 'var(--text-muted)' }}>
                            Set {sIdx + 1}
                          </span>

                          <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <input
                              type="number"
                              min="1"
                              className="form-control"
                              style={{ padding: '6px 10px', fontSize: '0.875rem' }}
                              placeholder="Reps"
                              value={set.reps}
                              onChange={(e) => handleSetChange(exIdx, sIdx, 'reps', Number(e.target.value))}
                              required
                            />
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>reps</span>
                          </div>

                          <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <input
                              type="number"
                              min="0"
                              step="0.5"
                              disabled={set.isBodyweight}
                              className="form-control"
                              style={{ padding: '6px 10px', fontSize: '0.875rem' }}
                              placeholder="kg"
                              value={set.isBodyweight ? 0 : set.weightKg}
                              onChange={(e) => handleSetChange(exIdx, sIdx, 'weightKg', Number(e.target.value))}
                            />
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>kg</span>
                          </div>

                          <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                            <input
                              type="checkbox"
                              checked={set.isBodyweight}
                              onChange={(e) => handleSetChange(exIdx, sIdx, 'isBodyweight', e.target.checked)}
                            />
                            <span>Bodyweight</span>
                          </label>

                          {exercise.sets.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveSet(exIdx, sIdx)}
                              style={{ color: 'var(--text-muted)' }}
                              title="Delete set"
                            >
                              <Trash2 size={15} />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={() => handleAddSet(exIdx)}
                      className="btn btn-secondary btn-sm"
                      style={{ marginTop: '10px' }}
                    >
                      <Plus size={14} /> Add Set
                    </button>
                  </div>
                </div>
              ))}

              <button
                type="button"
                onClick={handleAddExercise}
                className="btn btn-secondary"
                style={{ alignSelf: 'flex-start' }}
              >
                <Plus size={16} /> Add Another Exercise
              </button>
            </div>
          </div>
        )}

        {/* Live Calorie Preview & Notes Card */}
        <div className="card" style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                Authoritative Server Calorie Estimation
              </span>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px', marginTop: '6px' }}>
                <span style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--accent-primary)' }}>
                  ~{liveCalories.grossCalories} kcal
                </span>
                <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                  (Net exercise burn: ~{liveCalories.netCalories} kcal &bull; MET: {liveCalories.met})
                </span>
              </div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                * Calculated from your current recorded weight ({userWeight} kg) and Compendium of Physical Activities MET standard.
              </p>
            </div>

            <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: 'var(--accent-primary-light)', color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Flame size={24} />
            </div>
          </div>

          <div className="form-group" style={{ marginTop: '20px', marginBottom: 0 }}>
            <label className="form-label">Workout Notes (optional)</label>
            <textarea
              className="form-control"
              rows="3"
              placeholder="How did you feel? Energy levels, soreness, personal breakthroughs..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginBottom: '32px' }}>
          <button
            type="button"
            onClick={() => navigate('/history')}
            className="btn btn-secondary"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn-primary btn-lg"
            disabled={loading}
          >
            {loading ? 'Saving to Database...' : 'Save Workout Record'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddWorkout;
