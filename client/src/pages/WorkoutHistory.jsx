import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  History as HistoryIcon,
  Search,
  Filter,
  Plus,
  Trash2,
  Edit2,
  Calendar,
  Clock,
  Flame,
  Dumbbell,
  Activity,
  Layers,
  ArrowUpDown,
  AlertCircle
} from 'lucide-react';
import api from '../api/axios';
import ConfirmModal from '../components/ConfirmModal';
import { formatDuration } from '../utils/calculations';

const WorkoutHistory = () => {
  const navigate = useNavigate();

  const [workouts, setWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters state
  const [typeFilter, setTypeFilter] = useState('all'); // 'all' | 'cardio' | 'strength'
  const [timeRange, setTimeRange] = useState('all'); // 'all' | 'today' | '7days' | '30days' | 'custom'
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('newest'); // 'newest' | 'oldest' | 'duration' | 'calories'

  // Delete modal state
  const [deleteId, setDeleteId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchWorkouts = async () => {
    try {
      setLoading(true);
      setError('');

      const params = new URLSearchParams();
      if (typeFilter !== 'all') params.append('type', typeFilter);
      if (timeRange !== 'all') params.append('timeRange', timeRange);
      if (timeRange === 'custom') {
        if (startDate) params.append('startDate', startDate);
        if (endDate) params.append('endDate', endDate);
      }
      if (search.trim()) params.append('search', search.trim());
      if (sortBy) params.append('sortBy', sortBy);

      const res = await api.get(`/workouts?${params.toString()}`);
      if (res.data.success) {
        setWorkouts(res.data.workouts || []);
      }
    } catch (err) {
      console.error('Failed to fetch workouts:', err);
      setError('Unable to load workout history from database. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchWorkouts();
    }, 200);
    return () => clearTimeout(timer);
  }, [typeFilter, timeRange, startDate, endDate, search, sortBy]);

  const handleDeleteConfirm = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      await api.delete(`/workouts/${deleteId}`);
      setWorkouts(workouts.filter((w) => w._id !== deleteId));
      setDeleteId(null);
    } catch (err) {
      alert('Failed to delete workout. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <HistoryIcon size={26} color="var(--accent-primary)" />
            Workout History
          </h1>
          <p className="page-subtitle">
            Comprehensive audit of all logged cardio and strength training sessions
          </p>
        </div>

        <Link to="/add-workout" className="btn btn-primary">
          <Plus size={18} />
          <span>Log Workout</span>
        </Link>
      </div>

      {error && (
        <div className="alert alert-danger">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Filter and Control Toolbar Card */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Top Row: Search & Type Tabs */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px', alignItems: 'center', justifyContent: 'space-between' }}>
            {/* Search Input */}
            <div style={{ position: 'relative', flex: '1 1 280px', maxWidth: '400px' }}>
              <input
                type="text"
                className="form-control"
                placeholder="Search activity, routine, or exercise..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ paddingLeft: '38px' }}
              />
              <Search
                size={18}
                style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-muted)'
                }}
              />
            </div>

            {/* Type Filter Buttons */}
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                type="button"
                onClick={() => setTypeFilter('all')}
                className={`btn btn-sm ${typeFilter === 'all' ? 'btn-primary' : 'btn-secondary'}`}
              >
                All Workouts
              </button>
              <button
                type="button"
                onClick={() => setTypeFilter('cardio')}
                className={`btn btn-sm ${typeFilter === 'cardio' ? 'btn-primary' : 'btn-secondary'}`}
                style={typeFilter === 'cardio' ? { backgroundColor: 'var(--accent-secondary)', color: '#ffffff' } : {}}
              >
                Cardio Only
              </button>
              <button
                type="button"
                onClick={() => setTypeFilter('strength')}
                className={`btn btn-sm ${typeFilter === 'strength' ? 'btn-primary' : 'btn-secondary'}`}
              >
                Strength Only
              </button>
            </div>
          </div>

          {/* Bottom Row: Date Range Buttons, Custom Picker, Sorting */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border-color)', paddingTop: '14px' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Date:</span>
              <button
                type="button"
                onClick={() => setTimeRange('all')}
                className={`btn btn-sm ${timeRange === 'all' ? 'btn-outline' : 'btn-secondary'}`}
              >
                All Time
              </button>
              <button
                type="button"
                onClick={() => setTimeRange('today')}
                className={`btn btn-sm ${timeRange === 'today' ? 'btn-outline' : 'btn-secondary'}`}
              >
                Today
              </button>
              <button
                type="button"
                onClick={() => setTimeRange('7days')}
                className={`btn btn-sm ${timeRange === '7days' ? 'btn-outline' : 'btn-secondary'}`}
              >
                Last 7 Days
              </button>
              <button
                type="button"
                onClick={() => setTimeRange('30days')}
                className={`btn btn-sm ${timeRange === '30days' ? 'btn-outline' : 'btn-secondary'}`}
              >
                Last 30 Days
              </button>
              <button
                type="button"
                onClick={() => setTimeRange('custom')}
                className={`btn btn-sm ${timeRange === 'custom' ? 'btn-outline' : 'btn-secondary'}`}
              >
                Custom Range
              </button>
            </div>

            {/* Sort Options */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Sort by:</span>
              <select
                className="form-control"
                style={{ width: 'auto', padding: '6px 12px', fontSize: '0.85rem' }}
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="duration">Highest Duration</option>
                <option value="calories">Highest Calories</option>
              </select>
            </div>
          </div>

          {/* Custom Date Inputs Drawer */}
          {timeRange === 'custom' && (
            <div
              style={{
                display: 'flex',
                gap: '12px',
                alignItems: 'center',
                backgroundColor: 'var(--bg-input)',
                padding: '12px',
                borderRadius: 'var(--radius-md)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>From:</span>
                <input
                  type="date"
                  className="form-control"
                  style={{ width: 'auto', padding: '6px 10px' }}
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>To:</span>
                <input
                  type="date"
                  className="form-control"
                  style={{ width: 'auto', padding: '6px 10px' }}
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Workouts History Feed */}
      {loading ? (
        <div className="loading-spinner">
          <div className="spinner" />
          <p>Filtering records...</p>
        </div>
      ) : workouts.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {workouts.map((workout) => {
            const isCardio = workout.type === 'cardio';
            const formattedDate = new Date(workout.date).toLocaleDateString('en-US', {
              weekday: 'short',
              month: 'short',
              day: 'numeric',
              year: 'numeric'
            });
            const formattedTime = new Date(workout.date).toLocaleTimeString('en-US', {
              hour: '2-digit',
              minute: '2-digit'
            });

            return (
              <div
                key={workout._id}
                className="card"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '14px',
                  borderLeft: `4px solid ${isCardio ? 'var(--accent-secondary)' : 'var(--accent-primary)'}`
                }}
              >
                {/* Header row */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div
                      style={{
                        width: '42px',
                        height: '42px',
                        borderRadius: '10px',
                        backgroundColor: isCardio ? 'var(--accent-secondary-light)' : 'var(--accent-primary-light)',
                        color: isCardio ? 'var(--accent-secondary)' : 'var(--accent-primary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      {isCardio ? <Activity size={22} /> : <Dumbbell size={22} />}
                    </div>

                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                          {isCardio ? (workout.activityName || workout.activityCategory) : (workout.workoutName || 'Strength Session')}
                        </h3>
                        <span className={`badge ${isCardio ? 'badge-secondary' : 'badge-primary'}`}>
                          {workout.type}
                        </span>
                        <span className="badge badge-amber" style={{ textTransform: 'capitalize' }}>
                          {workout.intensity || 'moderate'}
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', color: 'var(--text-muted)', fontSize: '0.825rem', marginTop: '4px' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Calendar size={13} /> {formattedDate} at {formattedTime}
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Clock size={13} /> {formatDuration(workout.durationMinutes)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions & Calories badge */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--accent-primary)', fontWeight: 800, fontSize: '1.25rem' }}>
                        <Flame size={18} color="var(--accent-primary)" />
                        <span>{workout.calories?.grossCalories || 0}</span>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>kcal</span>
                      </div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        Net: {workout.calories?.netCalories || 0} kcal &bull; MET {workout.calories?.met || 0}
                      </span>
                    </div>

                    <div style={{ display: 'flex', gap: '6px' }}>
                      <Link
                        to={`/workouts/${workout._id}`}
                        className="btn btn-secondary btn-sm"
                        title="View details"
                      >
                        <Edit2 size={14} />
                      </Link>
                      <button
                        onClick={() => setDeleteId(workout._id)}
                        className="btn btn-secondary btn-sm"
                        style={{ color: 'var(--accent-red)' }}
                        title="Delete workout"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Body Content Details */}
                {isCardio ? (
                  /* Cardio Specific Stats Pill Row */
                  <div
                    style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: '12px',
                      backgroundColor: 'var(--bg-secondary)',
                      padding: '10px 14px',
                      borderRadius: 'var(--radius-md)',
                      fontSize: '0.85rem'
                    }}
                  >
                    {workout.distanceKm && (
                      <div>
                        <span style={{ color: 'var(--text-muted)' }}>Distance: </span>
                        <strong style={{ color: 'var(--text-primary)' }}>{workout.distanceKm} km</strong>
                      </div>
                    )}
                    {workout.averageHeartRate && (
                      <div>
                        <span style={{ color: 'var(--text-muted)' }}>Avg HR: </span>
                        <strong style={{ color: 'var(--accent-red)' }}>{workout.averageHeartRate} bpm</strong>
                      </div>
                    )}
                    {workout.speedKmh && (
                      <div>
                        <span style={{ color: 'var(--text-muted)' }}>Speed: </span>
                        <strong style={{ color: 'var(--text-primary)' }}>{workout.speedKmh} km/h</strong>
                      </div>
                    )}
                    {workout.inclinePercent && (
                      <div>
                        <span style={{ color: 'var(--text-muted)' }}>Incline: </span>
                        <strong style={{ color: 'var(--text-primary)' }}>{workout.inclinePercent}%</strong>
                      </div>
                    )}
                    <div>
                      <span style={{ color: 'var(--text-muted)' }}>Category: </span>
                      <span style={{ textTransform: 'capitalize', color: 'var(--text-primary)' }}>
                        {workout.activityCategory || 'cardio'}
                      </span>
                    </div>
                  </div>
                ) : (
                  /* Strength Specific Exercises Summary */
                  <div style={{ backgroundColor: 'var(--bg-secondary)', padding: '12px 14px', borderRadius: 'var(--radius-md)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <span style={{ fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                        Exercises ({workout.exercises?.length || 0})
                      </span>
                      <span className="badge badge-primary" style={{ fontSize: '0.8rem' }}>
                        Total Load: {workout.totalVolumeKg || 0} kg
                      </span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {workout.exercises && workout.exercises.map((ex, i) => (
                        <div
                          key={i}
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            fontSize: '0.875rem',
                            borderBottom: i < workout.exercises.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                            paddingBottom: '4px'
                          }}
                        >
                          <div>
                            <strong style={{ color: 'var(--text-primary)' }}>{ex.exerciseName}</strong>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: '8px' }}>
                              ({ex.muscleGroup})
                            </span>
                          </div>

                          <div style={{ fontSize: '0.825rem', color: 'var(--text-secondary)' }}>
                            {ex.sets && ex.sets.map((s, sI) => (
                              <span key={sI} style={{ marginLeft: '8px' }}>
                                S{sI + 1}: {s.reps}&times;{s.isBodyweight ? 'BW' : `${s.weightKg}kg`}
                              </span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Notes */}
                {workout.notes && (
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                    &ldquo;{workout.notes}&rdquo;
                  </p>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        /* Empty State */
        <div className="empty-state">
          <HistoryIcon size={40} className="empty-state-icon" />
          <h3>No Workouts Match Filters</h3>
          <p>We couldn't find any workouts matching your current filter criteria. Try adjusting dates or search keywords.</p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <button
              onClick={() => {
                setTypeFilter('all');
                setTimeRange('all');
                setSearch('');
              }}
              className="btn btn-secondary"
            >
              Reset Filters
            </button>
            <Link to="/add-workout" className="btn btn-primary">
              <Plus size={16} /> Log New Workout
            </Link>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!deleteId}
        title="Delete Workout Entry?"
        message="Are you sure you want to permanently delete this workout? This action cannot be undone and will update your dashboard metrics."
        confirmText={isDeleting ? 'Deleting...' : 'Delete Permanently'}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
};

export default WorkoutHistory;
