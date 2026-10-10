import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Lock, Mail, User as UserIcon, Flame, AlertCircle, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import PasswordStrengthMeter from '../components/PasswordStrengthMeter';
import { evaluatePasswordStrength } from '../utils/calculations';

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    age: 26,
    sex: 'male',
    height: 175,
    currentWeight: 72,
    targetWeight: 68,
    activityLevel: 'moderately_active',
    fitnessGoal: 'weight_loss'
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [step, setStep] = useState(1); // Step 1: Account credentials, Step 2: Fitness profile
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleNextStep = (e) => {
    e.preventDefault();
    setError('');

    if (!formData.name.trim() || formData.name.trim().length < 2) {
      setError('Please provide your full name (minimum 2 characters).');
      return;
    }

    if (!formData.email.trim() || !formData.email.includes('@')) {
      setError('Please provide a valid email address.');
      return;
    }

    const passEval = evaluatePasswordStrength(formData.password);
    if (!passEval.isValid) {
      setError('Password must meet all 5 complexity criteria (min 8 characters, uppercase, lowercase, number, special symbol).');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setStep(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await register({
        ...formData,
        age: Number(formData.age),
        height: Number(formData.height),
        currentWeight: Number(formData.currentWeight),
        targetWeight: Number(formData.targetWeight)
      });
      navigate('/');
    } catch (err) {
      setError(
        err.response?.data?.message || 'Registration failed. Please check your details.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        backgroundColor: 'var(--bg-primary)'
      }}
    >
      <div
        className="card"
        style={{
          maxWidth: '560px',
          width: '100%',
          backgroundColor: 'var(--bg-secondary)',
          border: '1px solid var(--border-color)',
          boxShadow: 'var(--shadow-lg)'
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '16px',
              backgroundColor: 'var(--accent-primary-light)',
              color: 'var(--accent-primary)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '14px',
              border: '1px solid rgba(255, 87, 34, 0.35)',
              boxShadow: '0 0 20px rgba(255, 87, 34, 0.25)'
            }}
          >
            <Flame size={30} />
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            Join Fitness <span style={{ color: 'var(--accent-primary)' }}>Logging</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.925rem', marginTop: '4px' }}>
            {step === 1 ? 'Step 1 of 2: Security & Credentials' : 'Step 2 of 2: Fitness Profile & Biometrics'}
          </p>
        </div>

        {error && (
          <div className="alert alert-danger">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {step === 1 ? (
          <form onSubmit={handleNextStep}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  name="name"
                  className="form-control"
                  placeholder="e.g. Alex Morgan"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  style={{ paddingLeft: '40px' }}
                />
                <UserIcon size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Email Address</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="email"
                  name="email"
                  className="form-control"
                  placeholder="alex@fitnesslogging.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  style={{ paddingLeft: '40px' }}
                />
                <Mail size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  className="form-control"
                  placeholder="e.g. Fitness@2026"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  style={{ paddingLeft: '40px', paddingRight: '40px' }}
                />
                <Lock size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              {/* Password strength meter */}
              <PasswordStrengthMeter password={formData.password} />
            </div>

            <div className="form-group">
              <label className="form-label">Confirm Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  className="form-control"
                  placeholder="Re-enter password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  style={{ paddingLeft: '40px', paddingRight: '40px' }}
                />
                <Lock size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}
                  aria-label="Toggle confirm password visibility"
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '10px' }}>
              <span>Continue to Fitness Profile</span>
              <ArrowRight size={18} />
            </button>
          </form>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-2">
              <div className="form-group">
                <label className="form-label">Age (Years)</label>
                <input
                  type="number"
                  name="age"
                  min="10"
                  max="120"
                  className="form-control"
                  value={formData.age}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Biological Sex (for Mifflin-St Jeor)</label>
                <select name="sex" className="form-control" value={formData.sex} onChange={handleChange}>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other / Non-specified</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-3">
              <div className="form-group">
                <label className="form-label">Height (cm)</label>
                <input
                  type="number"
                  name="height"
                  min="50"
                  max="280"
                  className="form-control"
                  value={formData.height}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Current Weight (kg)</label>
                <input
                  type="number"
                  name="currentWeight"
                  step="0.1"
                  min="20"
                  max="400"
                  className="form-control"
                  value={formData.currentWeight}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Target Weight (kg)</label>
                <input
                  type="number"
                  name="targetWeight"
                  step="0.1"
                  min="20"
                  max="400"
                  className="form-control"
                  value={formData.targetWeight}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Baseline Activity Level</label>
              <select name="activityLevel" className="form-control" value={formData.activityLevel} onChange={handleChange}>
                <option value="sedentary">Sedentary (Little or no exercise)</option>
                <option value="lightly_active">Lightly Active (Exercise 1-3 days/week)</option>
                <option value="moderately_active">Moderately Active (Exercise 3-5 days/week)</option>
                <option value="very_active">Very Active (Heavy exercise 6-7 days/week)</option>
                <option value="extra_active">Extra Active (Very heavy exercise / physical labor)</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Primary Fitness Goal</label>
              <select name="fitnessGoal" className="form-control" value={formData.fitnessGoal} onChange={handleChange}>
                <option value="weight_loss">Weight Loss (Conservative ~500 kcal deficit)</option>
                <option value="maintenance">Weight Maintenance (Balanced energy intake)</option>
                <option value="muscle_gain">Muscle Gain (Hypertrophy ~300 kcal surplus)</option>
                <option value="general_fitness">General Fitness (Cardiovascular &amp; health)</option>
              </select>
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
              <button
                type="button"
                onClick={() => setStep(1)}
                className="btn btn-secondary"
                style={{ flex: 1 }}
              >
                Back
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                style={{ flex: 2 }}
                disabled={loading}
              >
                {loading ? 'Creating Account...' : 'Complete & Launch Dashboard'}
              </button>
            </div>
          </form>
        )}

        <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--accent-primary)', fontWeight: 600 }}>
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
