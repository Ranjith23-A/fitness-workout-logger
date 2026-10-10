import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  Award,
  Flame,
  Clock,
  Dumbbell,
  Activity,
  Calendar,
  AlertCircle
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend
} from 'recharts';
import api from '../api/axios';
import StatCard from '../components/StatCard';
import { formatDuration } from '../utils/calculations';

const Progress = () => {
  const [progressData, setProgressData] = useState(null);
  const [recordsData, setRecordsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [chartView, setChartView] = useState('weight'); // 'weight' | 'cardio' | 'strength'

  const fetchProgressAndRecords = async () => {
    try {
      setLoading(true);
      setError('');
      const [progRes, recRes] = await Promise.all([
        api.get('/stats/progress'),
        api.get('/stats/records')
      ]);

      if (progRes.data.success && recRes.data.success) {
        setProgressData(progRes.data.progress);
        setRecordsData(recRes.data.records);
      }
    } catch (err) {
      console.error('Failed to load progress analytics:', err);
      setError('Could not fetch progress metrics. Ensure backend server is accessible.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProgressAndRecords();
  }, []);

  if (loading) {
    return (
      <div className="loading-spinner" style={{ minHeight: '60vh' }}>
        <div className="spinner" />
        <p>Crunching lifetime workout telemetry and personal records...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger" style={{ margin: '24px 0' }}>
        <AlertCircle size={20} />
        <span>{error}</span>
      </div>
    );
  }

  const { summary, weightHistory, cardioTrends, strengthTrends } = progressData || {};
  const { exercisePRs, maxCardioDistance, maxCardioDuration, maxSingleWorkoutCalories, maxStrengthVolumeSession } = recordsData || {};

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <TrendingUp size={26} color="var(--accent-primary)" />
            Progress Analytics &amp; Personal Records (PRs)
          </h1>
          <p className="page-subtitle">
            Long-term physiological trajectories, volume trends, and all-time achievements
          </p>
        </div>
      </div>

      {/* Lifetime Cumulative Summary Cards */}
      <div className="grid grid-cols-4" style={{ marginBottom: '24px' }}>
        <StatCard
          title="Total Logged Workouts"
          value={summary?.totalWorkouts || 0}
          unit="sessions"
          subtitle="All-time completed routines"
          icon={Dumbbell}
          color="var(--accent-secondary)"
          bgColor="var(--accent-secondary-light)"
        />

        <StatCard
          title="Total Estimated Burn"
          value={summary?.totalCalories || 0}
          unit="kcal"
          subtitle="Lifetime workout energy expenditure"
          icon={Flame}
          color="var(--accent-primary)"
          bgColor="var(--accent-primary-light)"
        />

        <StatCard
          title="Total Training Duration"
          value={summary?.totalHours || 0}
          unit="hours"
          subtitle={`${summary?.totalMinutes || 0} total active minutes`}
          icon={Clock}
          color="var(--accent-amber)"
          bgColor="var(--accent-amber-light)"
        />

        <StatCard
          title="Tracked Exercises"
          value={exercisePRs?.length || 0}
          unit="movements"
          subtitle="With verified personal records"
          icon={Award}
          color="var(--accent-primary)"
          bgColor="var(--accent-primary-light)"
        />
      </div>

      {/* Personal Records (PRs) Section */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <div className="card-title">
          <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Award size={20} color="var(--accent-primary)" />
            All-Time Verified Personal Records (PRs)
          </span>
          <span className="badge badge-primary">Calculated From Real Data</span>
        </div>

        {/* Milestone Highlights Cards */}
        <div className="grid grid-cols-4" style={{ marginBottom: '20px' }}>
          <div style={{ backgroundColor: 'var(--bg-secondary)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Longest Distance</span>
            <p style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--accent-secondary)', marginTop: '4px' }}>
              {maxCardioDistance?.value ? `${maxCardioDistance.value} km` : 'None'}
            </p>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              {maxCardioDistance?.activity || 'N/A'}
            </span>
          </div>

          <div style={{ backgroundColor: 'var(--bg-secondary)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Longest Duration</span>
            <p style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--accent-amber)', marginTop: '4px' }}>
              {maxCardioDuration?.value ? `${maxCardioDuration.value} min` : 'None'}
            </p>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              {maxCardioDuration?.activity || 'N/A'}
            </span>
          </div>

          <div style={{ backgroundColor: 'var(--bg-secondary)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Max Calories (Single)</span>
            <p style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--accent-primary)', marginTop: '4px' }}>
              {maxSingleWorkoutCalories?.value ? `${maxSingleWorkoutCalories.value} kcal` : 'None'}
            </p>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              {maxSingleWorkoutCalories?.activity || 'N/A'}
            </span>
          </div>

          <div style={{ backgroundColor: 'var(--bg-secondary)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Highest Session Volume</span>
            <p style={{ fontSize: '1.5rem', fontWeight: 800, color: '#f43f5e', marginTop: '4px' }}>
              {maxStrengthVolumeSession?.value ? `${maxStrengthVolumeSession.value} kg` : 'None'}
            </p>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              {maxStrengthVolumeSession?.name || 'N/A'}
            </span>
          </div>
        </div>

        {/* Strength Exercise PRs Table */}
        {exercisePRs && exercisePRs.length > 0 ? (
          <div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '10px' }}>
              Lifted Weight PRs Per Exercise
            </h4>
            <div className="table-wrapper">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Exercise Name</th>
                    <th>Muscle Group</th>
                    <th>Max Load Lifted</th>
                    <th>Reps at Max Load</th>
                    <th>Max Single-Set Volume</th>
                    <th>Date Achieved</th>
                  </tr>
                </thead>
                <tbody>
                  {exercisePRs.map((pr, idx) => (
                    <tr key={idx}>
                      <td style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{pr.exerciseName}</td>
                      <td>
                        <span className="badge badge-primary">{pr.muscleGroup}</span>
                      </td>
                      <td style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--accent-primary)' }}>
                        {pr.maxWeightKg} kg
                      </td>
                      <td>{pr.maxRepsAtMaxWeight} reps</td>
                      <td>{pr.maxSingleSetVolume} kg</td>
                      <td style={{ color: 'var(--text-secondary)' }}>
                        {new Date(pr.dateAchieved).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            No strength exercise records found yet. Log strength sessions with weights to see your PRs appear here!
          </p>
        )}
      </div>

      {/* Interactive Charts Section */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
          <h3 className="card-title" style={{ marginBottom: 0 }}>
            Visual Progression Charts
          </h3>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => setChartView('weight')}
              className={`btn btn-sm ${chartView === 'weight' ? 'btn-primary' : 'btn-secondary'}`}
            >
              Weight &amp; BMI Trend
            </button>
            <button
              onClick={() => setChartView('cardio')}
              className={`btn btn-sm ${chartView === 'cardio' ? 'btn-primary' : 'btn-secondary'}`}
              style={chartView === 'cardio' ? { backgroundColor: 'var(--accent-secondary)', color: '#ffffff' } : {}}
            >
              Cardio Trends
            </button>
            <button
              onClick={() => setChartView('strength')}
              className={`btn btn-sm ${chartView === 'strength' ? 'btn-primary' : 'btn-secondary'}`}
            >
              Strength Volume
            </button>
          </div>
        </div>

        <div style={{ height: '340px' }}>
          {chartView === 'weight' && (
            weightHistory && weightHistory.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={weightHistory}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#262c3e" />
                  <XAxis dataKey="formattedDate" stroke="#94a3b8" />
                  <YAxis yAxisId="left" stroke="#ff5722" unit=" kg" domain={['auto', 'auto']} />
                  <YAxis yAxisId="right" orientation="right" stroke="#6366f1" domain={['auto', 'auto']} />
                  <Tooltip contentStyle={{ backgroundColor: '#131622', borderColor: '#262c3e', borderRadius: '8px', color: '#f8fafc' }} />
                  <Legend />
                  <Line yAxisId="left" type="monotone" dataKey="weight" name="Body Weight (kg)" stroke="#ff5722" strokeWidth={3} dot={{ r: 5, fill: '#ff5722' }} />
                  <Line yAxisId="right" type="monotone" dataKey="bmi" name="BMI" stroke="#6366f1" strokeWidth={2} strokeDasharray="5 5" dot={{ r: 4, fill: '#6366f1' }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="empty-state" style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <p>No historical weigh-ins logged. Record weights on the Profile page to view your weight trajectory.</p>
              </div>
            )
          )}

          {chartView === 'cardio' && (
            cardioTrends && cardioTrends.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={cardioTrends}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#262c3e" />
                  <XAxis dataKey="date" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip contentStyle={{ backgroundColor: '#131622', borderColor: '#262c3e', borderRadius: '8px', color: '#f8fafc' }} />
                  <Legend />
                  <Bar dataKey="durationMinutes" name="Duration (min)" fill="#6366f1" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="distanceKm" name="Distance (km)" fill="#ff5722" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="empty-state" style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <p>No cardio workouts logged yet. Log outdoor runs, rides, or treadmill sessions to see distance and duration trends.</p>
              </div>
            )
          )}

          {chartView === 'strength' && (
            strengthTrends && strengthTrends.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={strengthTrends}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#262c3e" />
                  <XAxis dataKey="date" stroke="#94a3b8" />
                  <YAxis stroke="#ff5722" unit=" kg" />
                  <Tooltip contentStyle={{ backgroundColor: '#131622', borderColor: '#262c3e', borderRadius: '8px', color: '#f8fafc' }} />
                  <Legend />
                  <Bar dataKey="totalVolumeKg" name="Session Volume (kg)" fill="#ff5722" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="empty-state" style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <p>No strength workouts logged yet. Record sets and weights to track your cumulative tonnage progress.</p>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default Progress;
