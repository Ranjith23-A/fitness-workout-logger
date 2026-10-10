import React, { useState, useEffect } from 'react';
import {
  User as UserIcon,
  Scale,
  Activity,
  Calendar,
  Save,
  Plus,
  Trash2,
  AlertCircle,
  CheckCircle2,
  Info
} from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import BmiIndicator from '../components/BmiIndicator';
import ConfirmModal from '../components/ConfirmModal';

const FitnessProfile = () => {
  const { user, refreshUser, updateUser } = useAuth();

  const [profile, setProfile] = useState(null);
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saveLoading, setSaveLoading] = useState(false);
  const [weightLoading, setWeightLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState({ type: '', text: '' });

  // Profile form state
  const [formData, setFormData] = useState({
    name: '',
    age: 25,
    sex: 'male',
    height: 175,
    currentWeight: 70,
    targetWeight: 68,
    activityLevel: 'moderately_active',
    fitnessGoal: 'general_fitness',
    preferredWorkoutTypes: ['cardio', 'strength']
  });

  // New weight entry state
  const [newWeight, setNewWeight] = useState('');
  const [newWeightDate, setNewWeightDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [newWeightNote, setNewWeightNote] = useState('');
  const [deleteWeightId, setDeleteWeightId] = useState(null);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await api.get('/profile');
      if (res.data.success) {
        setProfile(res.data.profile);
        setMetrics(res.data.metrics);
        setFormData({
          name: res.data.profile.name || '',
          age: res.data.profile.age || 25,
          sex: res.data.profile.sex || 'male',
          height: res.data.profile.height || 175,
          currentWeight: res.data.profile.currentWeight || 70,
          targetWeight: res.data.profile.targetWeight || 68,
          activityLevel: res.data.profile.activityLevel || 'moderately_active',
          fitnessGoal: res.data.profile.fitnessGoal || 'general_fitness',
          preferredWorkoutTypes: res.data.profile.preferredWorkoutTypes || ['cardio', 'strength']
        });
      }
    } catch (err) {
      setStatusMessage({ type: 'danger', text: 'Failed to load profile from database.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setSaveLoading(true);
    setStatusMessage({ type: '', text: '' });

    try {
      const res = await api.put('/profile', {
        ...formData,
        age: Number(formData.age),
        height: Number(formData.height),
        currentWeight: Number(formData.currentWeight),
        targetWeight: Number(formData.targetWeight)
      });

      if (res.data.success) {
        setProfile(res.data.profile);
        setMetrics(res.data.metrics);
        updateUser(res.data.profile, res.data.metrics);
        setStatusMessage({ type: 'success', text: 'Profile successfully updated!' });
      }
    } catch (err) {
      setStatusMessage({
        type: 'danger',
        text: err.response?.data?.message || 'Failed to update profile.'
      });
    } finally {
      setSaveLoading(false);
    }
  };

  const handleAddWeight = async (e) => {
    e.preventDefault();
    if (!newWeight || Number(newWeight) <= 0) return;

    setWeightLoading(true);
    try {
      const res = await api.post('/profile/weight', {
        weight: Number(newWeight),
        date: newWeightDate,
        note: newWeightNote
      });

      if (res.data.success) {
        setProfile((prev) => ({
          ...prev,
          currentWeight: Number(newWeight),
          weightHistory: res.data.weightHistory
        }));
        setMetrics(res.data.metrics);
        setFormData((prev) => ({ ...prev, currentWeight: Number(newWeight) }));
        setNewWeight('');
        setNewWeightNote('');
        setStatusMessage({ type: 'success', text: 'Historical weight recorded!' });
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to record weight');
    } finally {
      setWeightLoading(false);
    }
  };

  const handleDeleteWeight = async () => {
    if (!deleteWeightId) return;
    try {
      const res = await api.delete(`/profile/weight/${deleteWeightId}`);
      if (res.data.success) {
        setProfile((prev) => ({
          ...prev,
          weightHistory: res.data.weightHistory
        }));
        setMetrics(res.data.metrics);
        setDeleteWeightId(null);
      }
    } catch (err) {
      alert('Failed to delete weight entry');
    }
  };

  if (loading) {
    return (
      <div className="loading-spinner" style={{ minHeight: '60vh' }}>
        <div className="spinner" />
        <p>Loading your fitness metrics...</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1080px', margin: '0 auto' }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <UserIcon size={26} color="var(--accent-primary)" />
            Fitness Profile &amp; Physiological Parameters
          </h1>
          <p className="page-subtitle">
            Configure biometrics, track weight history, and review BMI, BMR, &amp; TDEE estimates
          </p>
        </div>
      </div>

      {statusMessage.text && (
        <div className={`alert alert-${statusMessage.type}`}>
          {statusMessage.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* Physiological Overview Cards Row */}
      <div className="grid grid-cols-2" style={{ marginBottom: '24px' }}>
        <BmiIndicator
          bmi={metrics?.bmi}
          category={metrics?.bmiCategory}
          color={metrics?.bmiColor}
          previousBmi={metrics?.previousBmi}
          healthyRange={metrics?.healthyWeightRange}
        />

        {/* Metabolic Energy Cards */}
        <div className="card">
          <h3 className="card-title">
            <span>Metabolic Energy Breakdown</span>
            <Activity size={18} color="var(--accent-secondary)" />
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ padding: '12px 14px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Mifflin-St Jeor BMR:</span>
                <strong style={{ fontSize: '1.25rem', color: 'var(--text-primary)' }}>
                  {metrics?.bmr || 0} kcal/day
                </strong>
              </div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                Energy expended by internal vital organs at complete rest in a neutral temperate environment.
              </p>
            </div>

            <div style={{ padding: '12px 14px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Total Daily Energy (TDEE):</span>
                <strong style={{ fontSize: '1.25rem', color: 'var(--accent-secondary)' }}>
                  {metrics?.tdee || 0} kcal/day
                </strong>
              </div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                BMR scaled by selected activity factor ({formData.activityLevel.replace('_', ' ')}).
              </p>
            </div>

            <div style={{ padding: '12px 14px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Derived Daily Calorie Target:</span>
                <strong style={{ fontSize: '1.25rem', color: 'var(--accent-primary)' }}>
                  {metrics?.dailyCalorieTarget || 0} kcal/day
                </strong>
              </div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                Goal: {metrics?.goalDetails?.goal} ({metrics?.goalDetails?.goalAdjustment > 0 ? `+${metrics?.goalDetails?.goalAdjustment}` : metrics?.goalDetails?.goalAdjustment} kcal)
              </p>
            </div>
          </div>

          <div style={{ marginTop: '14px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            <Info size={14} />
            <span>Avoid double-counting: Logged workout calories should not be added to TDEE if your baseline activity multiplier already includes your training routine.</span>
          </div>
        </div>
      </div>

      {/* Profile Form Card */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <h3 className="card-title">Edit Biometrics &amp; Preferences</h3>

        <form onSubmit={handleProfileSubmit}>
          <div className="grid grid-cols-2">
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                type="text"
                className="form-control"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Email Address (Read-only)</label>
              <input
                type="email"
                className="form-control"
                value={profile?.email || ''}
                disabled
                style={{ opacity: 0.7 }}
              />
            </div>
          </div>

          <div className="grid grid-cols-4">
            <div className="form-group">
              <label className="form-label">Age (Years)</label>
              <input
                type="number"
                min="10"
                max="120"
                className="form-control"
                value={formData.age}
                onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Biological Sex</label>
              <select
                className="form-control"
                value={formData.sex}
                onChange={(e) => setFormData({ ...formData, sex: e.target.value })}
              >
                <option value="male">Male (+5 kcal Mifflin-St Jeor)</option>
                <option value="female">Female (-161 kcal Mifflin-St Jeor)</option>
                <option value="other">Other / Neutral</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Height (cm)</label>
              <input
                type="number"
                min="50"
                max="280"
                className="form-control"
                value={formData.height}
                onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Current Weight (kg)</label>
              <input
                type="number"
                step="0.1"
                min="20"
                max="400"
                className="form-control"
                value={formData.currentWeight}
                onChange={(e) => setFormData({ ...formData, currentWeight: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-3">
            <div className="form-group">
              <label className="form-label">Target Weight (kg)</label>
              <input
                type="number"
                step="0.1"
                min="20"
                max="400"
                className="form-control"
                value={formData.targetWeight}
                onChange={(e) => setFormData({ ...formData, targetWeight: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Activity Level Factor</label>
              <select
                className="form-control"
                value={formData.activityLevel}
                onChange={(e) => setFormData({ ...formData, activityLevel: e.target.value })}
              >
                <option value="sedentary">Sedentary (1.2x)</option>
                <option value="lightly_active">Lightly Active (1.375x)</option>
                <option value="moderately_active">Moderately Active (1.55x)</option>
                <option value="very_active">Very Active (1.725x)</option>
                <option value="extra_active">Extra Active (1.9x)</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Fitness Goal Target</label>
              <select
                className="form-control"
                value={formData.fitnessGoal}
                onChange={(e) => setFormData({ ...formData, fitnessGoal: e.target.value })}
              >
                <option value="weight_loss">Weight Loss (-500 kcal)</option>
                <option value="maintenance">Weight Maintenance (Balanced)</option>
                <option value="muscle_gain">Muscle Gain (+300 kcal)</option>
                <option value="general_fitness">General Fitness</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '12px' }}>
            <button type="submit" className="btn btn-primary" disabled={saveLoading}>
              <Save size={16} /> {saveLoading ? 'Saving...' : 'Save Profile Changes'}
            </button>
          </div>
        </form>
      </div>

      {/* Weight History Logger & Audit Table */}
      <div className="card">
        <h3 className="card-title">
          <span>Historical Weight Measurements</span>
          <Scale size={18} color="var(--accent-primary)" />
        </h3>

        {/* Add weigh-in form */}
        <form onSubmit={handleAddWeight} style={{ backgroundColor: 'var(--bg-secondary)', padding: '16px', borderRadius: 'var(--radius-md)', marginBottom: '20px' }}>
          <h4 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '12px', color: 'var(--text-primary)' }}>
            Log New Weigh-In
          </h4>
          <div className="grid grid-cols-4" style={{ alignItems: 'flex-end' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Weight (kg)</label>
              <input
                type="number"
                step="0.1"
                min="20"
                max="400"
                className="form-control"
                placeholder="e.g. 74.5"
                value={newWeight}
                onChange={(e) => setNewWeight(e.target.value)}
                required
              />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Date</label>
              <input
                type="date"
                className="form-control"
                value={newWeightDate}
                onChange={(e) => setNewWeightDate(e.target.value)}
                required
              />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Note (optional)</label>
              <input
                type="text"
                className="form-control"
                placeholder="Morning fasting..."
                value={newWeightNote}
                onChange={(e) => setNewWeightNote(e.target.value)}
              />
            </div>

            <div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={weightLoading}>
                <Plus size={16} /> {weightLoading ? 'Adding...' : 'Log Weigh-In'}
              </button>
            </div>
          </div>
        </form>

        {profile?.weightHistory && profile.weightHistory.length > 0 ? (
          <div className="table-wrapper">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Weight (kg)</th>
                  <th>Computed BMI</th>
                  <th>Note</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {profile.weightHistory.map((entry) => {
                  const m = formData.height / 100;
                  const bmi = parseFloat((entry.weight / (m * m)).toFixed(1));
                  return (
                    <tr key={entry._id}>
                      <td>{new Date(entry.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                      <td style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{entry.weight} kg</td>
                      <td>
                        <span className="badge badge-green">{bmi}</span>
                      </td>
                      <td style={{ color: 'var(--text-secondary)' }}>{entry.note || '&mdash;'}</td>
                      <td>
                        <button
                          onClick={() => setDeleteWeightId(entry._id)}
                          className="btn btn-secondary btn-sm"
                          style={{ color: 'var(--accent-red)' }}
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '24px' }}>
            No historical weigh-ins logged yet.
          </p>
        )}
      </div>

      <ConfirmModal
        isOpen={!!deleteWeightId}
        title="Delete Weight Entry"
        message="Are you sure you want to remove this historical weight measurement?"
        onConfirm={handleDeleteWeight}
        onCancel={() => setDeleteWeightId(null)}
      />
    </div>
  );
};

export default FitnessProfile;
