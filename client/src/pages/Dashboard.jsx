import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Flame,
  Clock,
  Dumbbell,
  Target,
  Zap,
  Calendar,
  Activity,
  Plus,
  ArrowRight,
  AlertCircle
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import StatCard from '../components/StatCard';
import BmiIndicator from '../components/BmiIndicator';
import { formatDuration } from '../utils/calculations';

const Dashboard = () => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.get('/stats/dashboard');
      if (res.data.success) {
        setDashboardData(res.data.stats);
      }
    } catch (err) {
      console.error('Failed to fetch dashboard stats:', err);
      setError('Could not load dashboard statistics. Please ensure server is running.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="loading-spinner" style={{ minHeight: '60vh' }}>
        <div className="spinner" />
        <p>Calculating your real-time fitness statistics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger" style={{ margin: '24px 0' }}>
        <AlertCircle size={20} />
        <div>
          <p style={{ fontWeight: 600 }}>{error}</p>
          <button onClick={fetchDashboard} className="btn btn-secondary btn-sm" style={{ marginTop: '8px' }}>
            Retry Loading
          </button>
        </div>
      </div>
    );
  }

  const { today, weekly, monthly, streak, weight, metrics, charts, recentWorkouts } = dashboardData || {};

  // Custom colors for type distribution
  const typeDistributionData = (charts?.typeDistribution || []).map((t) => ({
    ...t,
    color: t.name.toLowerCase() === 'cardio' ? '#6366f1' : '#ff5722'
  }));

  return (
    <div>
      {/* Welcome Banner */}
      <div
        className="card"
        style={{
          background: 'linear-gradient(135deg, #241620 0%, #161825 100%)',
          borderColor: '#372b40',
          marginBottom: '24px',
          padding: '28px'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
                Welcome back, {user?.name || 'Athlete'}!
              </h2>
              {streak > 0 && (
                <div
                  className="badge badge-primary"
                  style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.85rem', padding: '6px 12px' }}
                >
                  <Flame size={16} />
                  <span>{streak} Day Streak!</span>
                </div>
              )}
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginTop: '6px' }}>
              Goal: <strong style={{ color: 'var(--accent-primary)', textTransform: 'capitalize' }}>{metrics?.fitnessGoal?.replace('_', ' ') || 'General Fitness'}</strong> &bull; Baseline TDEE: <strong>{metrics?.tdee || 2000} kcal/day</strong>
            </p>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <Link to="/add-workout" className="btn btn-primary">
              <Plus size={18} />
              <span>Log New Workout</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Primary Top Metric Tiles */}
      <div className="grid grid-cols-4" style={{ marginBottom: '24px' }}>
        <StatCard
          title="Today's Workout Calories"
          value={today?.calories || 0}
          unit="kcal"
          subtitle={`Daily target: ${today?.targetCalories || 2200} kcal intake`}
          icon={Flame}
          color="var(--accent-primary)"
          bgColor="var(--accent-primary-light)"
        />

        <StatCard
          title="Today's Active Time"
          value={today?.durationMinutes || 0}
          unit="min"
          subtitle={`Goal: ${today?.targetDurationMinutes || 45} min`}
          icon={Clock}
          color="var(--accent-secondary)"
          bgColor="var(--accent-secondary-light)"
          progress={today?.durationProgressPercent || 0}
        />

        <StatCard
          title="Weekly Workouts"
          value={weekly?.workoutCount || 0}
          unit={`/ ${weekly?.frequencyTarget || 4} days`}
          subtitle={`${weekly?.calories || 0} kcal burned this week`}
          icon={Calendar}
          color="var(--accent-amber)"
          bgColor="var(--accent-amber-light)"
          progress={weekly?.frequencyProgressPercent || 0}
        />

        <StatCard
          title="Current Streak"
          value={streak || 0}
          unit="days"
          subtitle={streak > 0 ? "You're building momentum!" : "Log a workout today to start a streak!"}
          icon={Zap}
          color="#f43f5e"
          bgColor="rgba(244, 63, 94, 0.16)"
        />
      </div>

      {/* Physiological Biometrics Row */}
      <div className="grid grid-cols-3" style={{ marginBottom: '24px' }}>
        <BmiIndicator
          bmi={metrics?.bmi}
          category={metrics?.bmiCategory}
          color={metrics?.bmiColor}
          previousBmi={metrics?.previousBmi}
          healthyRange={metrics?.healthyWeightRange}
        />

        {/* Energy Expenditure Card (BMR & TDEE) */}
        <div className="card">
          <div className="card-title">
            <span>Energy Expenditure</span>
            <Activity size={18} color="var(--accent-secondary)" />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '8px' }}>
            <div style={{ padding: '12px 14px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>BMR (Basal Metabolic Rate)</span>
                <span style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  {metrics?.bmr || 'N/A'} <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>kcal</span>
                </span>
              </div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                Estimated resting metabolic rate at physical rest (Mifflin-St Jeor).
              </p>
            </div>

            <div style={{ padding: '12px 14px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>TDEE (Total Daily Energy)</span>
                <span style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--accent-secondary)' }}>
                  {metrics?.tdee || 'N/A'} <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>kcal</span>
                </span>
              </div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                Daily energy expenditure including baseline lifestyle multiplier.
              </p>
            </div>

            <div style={{ padding: '12px 14px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Daily Intake Target</span>
                <span style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--accent-primary)' }}>
                  {metrics?.dailyCalorieTarget || 'N/A'} <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>kcal</span>
                </span>
              </div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                Goal: {metrics?.goalDetails?.goal || 'General'}.
              </p>
            </div>
          </div>
        </div>

        {/* Weight Target & Progress */}
        <div className="card">
          <div className="card-title">
            <span>Weight Journey</span>
            <Target size={18} color="var(--accent-primary)" />
          </div>

          <div style={{ marginTop: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '8px' }}>
              <div>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Current</span>
                <p style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  {weight?.current || 70} <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>kg</span>
                </p>
              </div>

              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Goal</span>
                <p style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--accent-primary)' }}>
                  {weight?.target || 68} <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>kg</span>
                </p>
              </div>
            </div>

            <div style={{ marginTop: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                <span>Progress to Target</span>
                <span style={{ fontWeight: 600, color: 'var(--accent-primary)' }}>{weight?.progressPercent || 0}%</span>
              </div>
              <div className="progress-container" style={{ height: '10px' }}>
                <div className="progress-bar" style={{ width: `${Math.min(100, weight?.progressPercent || 0)}%` }} />
              </div>
            </div>

            <div style={{ marginTop: '20px', padding: '12px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', fontSize: '0.825rem', color: 'var(--text-secondary)' }}>
              <span>Remaining delta: </span>
              <strong style={{ color: 'var(--text-primary)' }}>
                {Math.abs(weight?.delta || 0)} kg {weight?.delta > 0 ? 'to lose' : 'to gain'}
              </strong>
            </div>

            <div style={{ marginTop: '16px', textAlign: 'center' }}>
              <Link to="/profile" className="btn btn-secondary btn-sm" style={{ width: '100%' }}>
                Log Weight Measurement
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Analytics Charts Row */}
      <div className="grid grid-cols-2" style={{ marginBottom: '24px' }}>
        {/* Weekly Activity Bar Chart */}
        <div className="card">
          <div className="card-title">
            <span>Weekly Energy Burn (Last 7 Days)</span>
            <Flame size={18} color="var(--accent-primary)" />
          </div>

          <div style={{ height: '240px', marginTop: '12px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts?.weeklyActivity || []}>
                <XAxis dataKey="day" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} unit=" kcal" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#131622', borderColor: '#262c3e', borderRadius: '8px', color: '#f8fafc' }}
                  formatter={(val) => [`${val} kcal`, 'Calories Burned']}
                />
                <Bar dataKey="calories" fill="#ff5722" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Cardio vs Strength Distribution Pie Chart */}
        <div className="card">
          <div className="card-title">
            <span>Cardio vs Strength Balance</span>
            <Dumbbell size={18} color="var(--accent-secondary)" />
          </div>

          <div style={{ height: '240px', marginTop: '12px' }}>
            {typeDistributionData.some((t) => t.count > 0) ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={typeDistributionData}
                    dataKey="count"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    innerRadius={50}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {typeDistributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#131622', borderColor: '#262c3e', borderRadius: '8px', color: '#f8fafc' }}
                    formatter={(val, name, props) => [`${val} sessions (${props.payload.calories} kcal)`, name]}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="empty-state" style={{ padding: '32px 16px' }}>
                <p>No workouts recorded yet.</p>
                <Link to="/add-workout" className="btn btn-primary btn-sm">Log First Workout</Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Workouts List */}
      <div className="card">
        <div className="card-title">
          <span>Recent Workouts</span>
          <Link to="/history" style={{ fontSize: '0.85rem', color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>
            View Full History <ArrowRight size={14} />
          </Link>
        </div>

        {recentWorkouts && recentWorkouts.length > 0 ? (
          <div className="table-wrapper">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Workout / Activity</th>
                  <th>Date</th>
                  <th>Duration</th>
                  <th>Estimated Burn</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {recentWorkouts.map((w) => (
                  <tr key={w._id}>
                    <td>
                      <span className={`badge ${w.type === 'cardio' ? 'badge-secondary' : 'badge-primary'}`}>
                        {w.type}
                      </span>
                    </td>
                    <td style={{ fontWeight: 600 }}>
                      {w.activityName || w.workoutName || 'Workout'}
                    </td>
                    <td style={{ color: 'var(--text-secondary)' }}>
                      {new Date(w.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td>{formatDuration(w.durationMinutes)}</td>
                    <td style={{ color: 'var(--accent-primary)', fontWeight: 700 }}>
                      {w.calories?.grossCalories || 0} kcal
                    </td>
                    <td>
                      <Link to={`/workouts/${w._id}`} className="btn btn-secondary btn-sm">
                        Details
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state">
            <Dumbbell size={36} className="empty-state-icon" />
            <h3>No Workouts Logged Yet</h3>
            <p>Start your fitness journey by recording your first cardio or strength session.</p>
            <Link to="/add-workout" className="btn btn-primary">
              <Plus size={16} /> Log First Workout
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
