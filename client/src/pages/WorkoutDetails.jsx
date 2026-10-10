import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Calendar,
  Clock,
  Flame,
  Dumbbell,
  Activity,
  Edit2,
  Trash2,
  Save,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import api from '../api/axios';
import ConfirmModal from '../components/ConfirmModal';
import { formatDuration } from '../utils/calculations';

const WorkoutDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [workout, setWorkout] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Edit fields
  const [editDuration, setEditDuration] = useState('');
  const [editIntensity, setEditIntensity] = useState('');
  const [editNotes, setEditNotes] = useState('');
  const [editDistance, setEditDistance] = useState('');

  const fetchWorkout = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.get(`/workouts/${id}`);
      if (res.data.success) {
        const w = res.data.workout;
        setWorkout(w);
        setEditDuration(w.durationMinutes);
        setEditIntensity(w.intensity || 'moderate');
        setEditNotes(w.notes || '');
        setEditDistance(w.distanceKm || '');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Could not load workout details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkout();
  }, [id]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setSaveLoading(true);
    try {
      const res = await api.put(`/workouts/${id}`, {
        durationMinutes: Number(editDuration),
        intensity: editIntensity,
        notes: editNotes,
        distanceKm: editDistance ? Number(editDistance) : null
      });

      if (res.data.success) {
        setWorkout(res.data.workout);
        setIsEditing(false);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update workout');
    } finally {
      setSaveLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/workouts/${id}`);
      navigate('/history');
    } catch (err) {
      alert('Failed to delete workout');
    }
  };

  if (loading) {
    return (
      <div className="loading-spinner" style={{ minHeight: '60vh' }}>
        <div className="spinner" />
        <p>Loading workout session...</p>
      </div>
    );
  }

  if (error || !workout) {
    return (
      <div className="alert alert-danger" style={{ margin: '30px 0' }}>
        <AlertCircle size={20} />
        <div>
          <p>{error || 'Workout not found'}</p>
          <Link to="/history" className="btn btn-secondary btn-sm" style={{ marginTop: '8px' }}>
            Back to Workout History
          </Link>
        </div>
      </div>
    );
  }

  const isCardio = workout.type === 'cardio';

  return (
    <div style={{ maxWidth: '860px', margin: '0 auto' }}>
      <div style={{ marginBottom: '20px' }}>
        <Link to="/history" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          <ArrowLeft size={16} /> Back to Workout History
        </Link>
      </div>

      <div className="page-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h1 className="page-title">
              {isCardio ? <Activity size={26} color="var(--accent-secondary)" /> : <Dumbbell size={26} color="var(--accent-primary)" />}
              {isCardio ? (workout.activityName || workout.activityCategory) : (workout.workoutName || 'Strength Session')}
            </h1>
            <span className={`badge ${isCardio ? 'badge-secondary' : 'badge-primary'}`}>
              {workout.type}
            </span>
          </div>
          <p className="page-subtitle">
            Logged on {new Date(workout.date).toLocaleString('en-US', { dateStyle: 'full', timeStyle: 'short' })}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="btn btn-secondary"
          >
            <Edit2 size={16} /> {isEditing ? 'Cancel Edit' : 'Edit Workout'}
          </button>
          <button
            onClick={() => setShowDeleteModal(true)}
            className="btn btn-danger"
          >
            <Trash2 size={16} /> Delete
          </button>
        </div>
      </div>

      {isEditing ? (
        <form onSubmit={handleUpdate} className="card" style={{ marginBottom: '24px' }}>
          <h3 className="card-title">Edit Workout Information</h3>
          <div className="grid grid-cols-3">
            <div className="form-group">
              <label className="form-label">Duration (Minutes)</label>
              <input
                type="number"
                min="1"
                className="form-control"
                value={editDuration}
                onChange={(e) => setEditDuration(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Effort / Intensity</label>
              <select
                className="form-control"
                value={editIntensity}
                onChange={(e) => setEditIntensity(e.target.value)}
              >
                <option value="low">Low</option>
                <option value="moderate">Moderate</option>
                <option value="vigorous">Vigorous</option>
              </select>
            </div>

            {isCardio && (
              <div className="form-group">
                <label className="form-label">Distance (km)</label>
                <input
                  type="number"
                  step="0.01"
                  className="form-control"
                  value={editDistance}
                  onChange={(e) => setEditDistance(e.target.value)}
                />
              </div>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">Session Notes</label>
            <textarea
              className="form-control"
              rows="3"
              value={editNotes}
              onChange={(e) => setEditNotes(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <button type="button" onClick={() => setIsEditing(false)} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={saveLoading}>
              <Save size={16} /> {saveLoading ? 'Saving...' : 'Save & Recalculate'}
            </button>
          </div>
        </form>
      ) : null}

      {/* Metrics Highlights Card */}
      <div className="grid grid-cols-3" style={{ marginBottom: '24px' }}>
        <div className="card" style={{ textAlign: 'center' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Active Duration</span>
          <p style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '4px' }}>
            {formatDuration(workout.durationMinutes)}
          </p>
        </div>

        <div className="card" style={{ textAlign: 'center' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Gross Calorie Burn</span>
          <p style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--accent-primary)', marginTop: '4px' }}>
            {workout.calories?.grossCalories || 0} kcal
          </p>
        </div>

        <div className="card" style={{ textAlign: 'center' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            {isCardio ? 'Distance' : 'Total Volume Lifted'}
          </span>
          <p style={{ fontSize: '1.75rem', fontWeight: 800, color: isCardio ? 'var(--accent-secondary)' : 'var(--accent-primary)', marginTop: '4px' }}>
            {isCardio ? `${workout.distanceKm || 0} km` : `${workout.totalVolumeKg || 0} kg`}
          </p>
        </div>
      </div>

      {/* Strength Exercise Breakdown (if strength) */}
      {!isCardio && workout.exercises && workout.exercises.length > 0 && (
        <div className="card" style={{ marginBottom: '24px' }}>
          <h3 className="card-title">Exercise Breakdown &amp; Sets</h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {workout.exercises.map((ex, i) => (
              <div
                key={i}
                style={{
                  padding: '16px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--bg-secondary)',
                  border: '1px solid var(--border-color)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <div>
                    <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                      {ex.exerciseName}
                    </h4>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      Muscle Group: <strong style={{ color: 'var(--accent-primary)' }}>{ex.muscleGroup}</strong> &bull; Rest: {ex.restTimeSeconds}s &bull; RPE: {ex.effortRpe}
                    </span>
                  </div>

                  <div className="badge badge-primary">
                    Exercise Volume: {ex.totalVolumeKg || 0} kg
                  </div>
                </div>

                <div className="table-wrapper">
                  <table className="custom-table">
                    <thead>
                      <tr>
                        <th>Set #</th>
                        <th>Reps</th>
                        <th>Weight (kg)</th>
                        <th>Type</th>
                        <th>Set Volume</th>
                      </tr>
                    </thead>
                    <tbody>
                      {ex.sets && ex.sets.map((s, sI) => {
                        const load = s.isBodyweight ? 0 : s.weightKg;
                        return (
                          <tr key={sI}>
                            <td>Set {s.setNumber || sI + 1}</td>
                            <td>{s.reps} reps</td>
                            <td>{s.isBodyweight ? '0 (BW)' : `${s.weightKg} kg`}</td>
                            <td>
                              <span className={`badge ${s.isBodyweight ? 'badge-amber' : 'badge-blue'}`}>
                                {s.isBodyweight ? 'Bodyweight' : 'External Load'}
                              </span>
                            </td>
                            <td style={{ fontWeight: 600 }}>
                              {s.reps * load} kg
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Authoritative Server Calculation Audit Details */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <h3 className="card-title">Physiological Calorie Audit &amp; Calculation Method</h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '14px', fontSize: '0.875rem' }}>
          <div>
            <span style={{ color: 'var(--text-muted)' }}>Calculation Method:</span>
            <p style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
              {workout.calories?.calculationMethod || 'standard_met'}
            </p>
          </div>

          <div>
            <span style={{ color: 'var(--text-muted)' }}>MET Reference Value:</span>
            <p style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
              {workout.calories?.met || 'N/A'} METs
            </p>
          </div>

          <div>
            <span style={{ color: 'var(--text-muted)' }}>User Weight Snapshot:</span>
            <p style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
              {workout.calories?.weightSnapshotKg || 70} kg
            </p>
          </div>

          <div>
            <span style={{ color: 'var(--text-muted)' }}>Net Exercise Calories (Excluding BMR):</span>
            <p style={{ fontWeight: 600, color: 'var(--accent-primary)' }}>
              {workout.calories?.netCalories || 0} kcal
            </p>
          </div>
        </div>

        <div style={{ marginTop: '16px', padding: '12px', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--bg-secondary)', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          {workout.calories?.disclaimer}
        </div>
      </div>

      {workout.notes && (
        <div className="card">
          <h3 className="card-title">Workout Notes</h3>
          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            {workout.notes}
          </p>
        </div>
      )}

      <ConfirmModal
        isOpen={showDeleteModal}
        title="Delete Workout"
        message="Are you sure you want to delete this workout? This action cannot be reversed."
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteModal(false)}
      />
    </div>
  );
};

export default WorkoutDetails;
