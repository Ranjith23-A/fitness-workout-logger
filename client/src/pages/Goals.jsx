import React, { useState, useEffect } from 'react';
import {
  Target,
  CheckCircle2,
  Circle,
  Plus,
  Save,
  Trash2,
  Calendar,
  Flame,
  Clock,
  Scale,
  AlertCircle
} from 'lucide-react';
import api from '../api/axios';

const Goals = () => {
  const [goals, setGoals] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saveLoading, setSaveLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Form inputs
  const [targetWeight, setTargetWeight] = useState(68);
  const [dailyDuration, setDailyDuration] = useState(45);
  const [weeklyFrequency, setWeeklyFrequency] = useState(4);
  const [weeklyCalorieBurn, setWeeklyCalorieBurn] = useState(2000);
  const [milestones, setMilestones] = useState([]);

  // New milestone form
  const [newMilestoneTitle, setNewMilestoneTitle] = useState('');
  const [newMilestoneDate, setNewMilestoneDate] = useState('');
  const [newMilestoneNotes, setNewMilestoneNotes] = useState('');

  const fetchGoals = async () => {
    try {
      setLoading(true);
      const res = await api.get('/goals');
      if (res.data.success && res.data.goal) {
        const g = res.data.goal;
        setGoals(g);
        setTargetWeight(g.targetWeight || 68);
        setDailyDuration(g.dailyWorkoutDurationMinutes || 45);
        setWeeklyFrequency(g.weeklyWorkoutFrequencyDays || 4);
        setWeeklyCalorieBurn(g.weeklyCalorieBurnTarget || 2000);
        setMilestones(g.milestones || []);
      }
    } catch (err) {
      console.error('Failed to load goals:', err);
      setMessage({ type: 'danger', text: 'Failed to load goals from database.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGoals();
  }, []);

  const handleSaveGoals = async (e) => {
    e.preventDefault();
    setSaveLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const res = await api.put('/goals', {
        targetWeight: Number(targetWeight),
        dailyWorkoutDurationMinutes: Number(dailyDuration),
        weeklyWorkoutFrequencyDays: Number(weeklyFrequency),
        weeklyCalorieBurnTarget: Number(weeklyCalorieBurn),
        milestones
      });

      if (res.data.success) {
        setGoals(res.data.goal);
        setMessage({ type: 'success', text: 'Fitness goals updated successfully!' });
      }
    } catch (err) {
      setMessage({ type: 'danger', text: 'Failed to save goals.' });
    } finally {
      setSaveLoading(false);
    }
  };

  const handleToggleMilestone = async (milestoneId) => {
    try {
      const res = await api.patch(`/goals/milestone/${milestoneId}/toggle`);
      if (res.data.success) {
        setMilestones(res.data.goal.milestones);
      }
    } catch (err) {
      alert('Failed to toggle milestone status');
    }
  };

  const handleAddMilestone = (e) => {
    e.preventDefault();
    if (!newMilestoneTitle.trim()) return;

    const newM = {
      title: newMilestoneTitle.trim(),
      targetDate: newMilestoneDate ? new Date(newMilestoneDate) : null,
      isCompleted: false,
      notes: newMilestoneNotes.trim()
    };

    setMilestones([...milestones, newM]);
    setNewMilestoneTitle('');
    setNewMilestoneDate('');
    setNewMilestoneNotes('');
  };

  const handleDeleteMilestone = (index) => {
    setMilestones(milestones.filter((_, i) => i !== index));
  };

  if (loading) {
    return (
      <div className="loading-spinner" style={{ minHeight: '60vh' }}>
        <div className="spinner" />
        <p>Loading your targets and milestones...</p>
      </div>
    );
  }

  const completedMilestonesCount = milestones.filter((m) => m.isCompleted).length;
  const milestoneProgressPercent = milestones.length > 0
    ? Math.round((completedMilestonesCount / milestones.length) * 100)
    : 0;

  return (
    <div style={{ maxWidth: '980px', margin: '0 auto' }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <Target size={26} color="var(--accent-primary)" />
            Fitness Goals &amp; Milestones
          </h1>
          <p className="page-subtitle">
            Set ambitious, achievable benchmarks for frequency, energy burn, and personal milestones
          </p>
        </div>
      </div>

      {message.text && (
        <div className={`alert alert-${message.type}`}>
          {message.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <span>{message.text}</span>
        </div>
      )}

      {/* Goal Configuration Form Card */}
      <form onSubmit={handleSaveGoals} className="card" style={{ marginBottom: '24px' }}>
        <h3 className="card-title">Activity &amp; Biometric Targets</h3>

        <div className="grid grid-cols-2" style={{ marginBottom: '16px' }}>
          <div className="form-group">
            <label className="form-label">Target Body Weight (kg)</label>
            <div style={{ position: 'relative' }}>
              <input
                type="number"
                step="0.1"
                min="20"
                max="400"
                className="form-control"
                value={targetWeight}
                onChange={(e) => setTargetWeight(e.target.value)}
                required
              />
              <Scale size={18} style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              Syncs with your biometrics profile and dashboard weight journey.
            </p>
          </div>

          <div className="form-group">
            <label className="form-label">Daily Workout Duration (Minutes)</label>
            <div style={{ position: 'relative' }}>
              <input
                type="number"
                min="10"
                max="240"
                className="form-control"
                value={dailyDuration}
                onChange={(e) => setDailyDuration(e.target.value)}
                required
              />
              <Clock size={18} style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              Standard target for your daily active workout rings.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2">
          <div className="form-group">
            <label className="form-label">Weekly Training Frequency (Days / Week)</label>
            <div style={{ position: 'relative' }}>
              <input
                type="number"
                min="1"
                max="7"
                className="form-control"
                value={weeklyFrequency}
                onChange={(e) => setWeeklyFrequency(e.target.value)}
                required
              />
              <Calendar size={18} style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              Number of workout days planned per rolling week.
            </p>
          </div>

          <div className="form-group">
            <label className="form-label">Weekly Exercise Calorie Burn Target (kcal)</label>
            <div style={{ position: 'relative' }}>
              <input
                type="number"
                min="100"
                max="20000"
                className="form-control"
                value={weeklyCalorieBurn}
                onChange={(e) => setWeeklyCalorieBurn(e.target.value)}
                required
              />
              <Flame size={18} style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              Cumulative gross exercise calorie burn targeted across the week.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '12px' }}>
          <button type="submit" className="btn btn-primary" disabled={saveLoading}>
            <Save size={16} /> {saveLoading ? 'Saving...' : 'Save Targets'}
          </button>
        </div>
      </form>

      {/* Personal Milestones Checklist Card */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <h3 className="card-title" style={{ marginBottom: '4px' }}>Personal Fitness Milestones</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Completed {completedMilestonesCount} of {milestones.length} milestones ({milestoneProgressPercent}%)
            </p>
          </div>

          <div className="badge badge-primary" style={{ fontSize: '0.85rem' }}>
            {milestoneProgressPercent}% Achieved
          </div>
        </div>

        <div className="progress-container" style={{ height: '8px', marginBottom: '24px' }}>
          <div className="progress-bar" style={{ width: `${milestoneProgressPercent}%` }} />
        </div>

        {/* Add new milestone row */}
        <form onSubmit={handleAddMilestone} style={{ backgroundColor: 'var(--bg-secondary)', padding: '16px', borderRadius: 'var(--radius-md)', marginBottom: '20px' }}>
          <h4 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '12px' }}>
            Add New Milestone
          </h4>
          <div className="grid grid-cols-3" style={{ alignItems: 'flex-end' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Milestone Title</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. Bench Press 100 kg"
                value={newMilestoneTitle}
                onChange={(e) => setNewMilestoneTitle(e.target.value)}
                required
              />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Target Date</label>
              <input
                type="date"
                className="form-control"
                value={newMilestoneDate}
                onChange={(e) => setNewMilestoneDate(e.target.value)}
              />
            </div>

            <div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                <Plus size={16} /> Add Milestone
              </button>
            </div>
          </div>
        </form>

        {/* Milestones list */}
        {milestones.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {milestones.map((m, idx) => (
              <div
                key={m._id || idx}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '14px 16px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: m.isCompleted ? 'rgba(255, 87, 34, 0.08)' : 'var(--bg-secondary)',
                  border: `1px solid ${m.isCompleted ? 'rgba(255, 87, 34, 0.3)' : 'var(--border-color)'}`,
                  transition: 'all 0.2s'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
                  <button
                    type="button"
                    onClick={() => m._id ? handleToggleMilestone(m._id) : null}
                    style={{ color: m.isCompleted ? 'var(--accent-primary)' : 'var(--text-muted)' }}
                  >
                    {m.isCompleted ? <CheckCircle2 size={22} /> : <Circle size={22} />}
                  </button>

                  <div>
                    <p
                      style={{
                        fontSize: '0.95rem',
                        fontWeight: 600,
                        color: m.isCompleted ? 'var(--text-muted)' : 'var(--text-primary)',
                        textDecoration: m.isCompleted ? 'line-through' : 'none'
                      }}
                    >
                      {m.title}
                    </p>
                    {m.targetDate && (
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        Target: {new Date(m.targetDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    )}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {m.isCompleted ? (
                    <span className="badge badge-primary">Completed</span>
                  ) : (
                    <span className="badge badge-secondary">In Progress</span>
                  )}
                  <button
                    type="button"
                    onClick={() => handleDeleteMilestone(idx)}
                    style={{ color: 'var(--text-muted)', padding: '6px' }}
                    title="Remove milestone"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '24px' }}>
            No personal milestones defined yet. Add your first fitness goal above!
          </p>
        )}
      </div>
    </div>
  );
};

export default Goals;
