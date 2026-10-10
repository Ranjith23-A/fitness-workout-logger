import React, { useState } from 'react';
import {
  Settings as SettingsIcon,
  ShieldCheck,
  Mail,
  Lock,
  CheckCircle2,
  AlertCircle,
  LogOut,
  Smartphone,
  Save
} from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import PasswordStrengthMeter from '../components/PasswordStrengthMeter';
import { evaluatePasswordStrength } from '../utils/calculations';

const Settings = () => {
  const { user, refreshUser, logout } = useAuth();

  // Password change state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState({ type: '', text: '' });

  // Email verification state
  const [otpRequestLoading, setOtpRequestLoading] = useState(false);
  const [otpVerifyLoading, setOtpVerifyLoading] = useState(false);
  const [otpInput, setOtpInput] = useState('');
  const [devOtp, setDevOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [emailMsg, setEmailMsg] = useState({ type: '', text: '' });

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPasswordMsg({ type: '', text: '' });

    const evalResult = evaluatePasswordStrength(newPassword);
    if (!evalResult.isValid) {
      setPasswordMsg({
        type: 'danger',
        text: 'New password must satisfy all 5 complexity criteria (min 8 characters, uppercase, lowercase, number, special symbol).'
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordMsg({ type: 'danger', text: 'New passwords do not match.' });
      return;
    }

    setPasswordLoading(true);
    try {
      const res = await api.put('/auth/change-password', {
        currentPassword,
        newPassword,
        confirmPassword
      });

      if (res.data.success) {
        setPasswordMsg({ type: 'success', text: 'Password successfully updated!' });
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (err) {
      setPasswordMsg({
        type: 'danger',
        text: err.response?.data?.message || 'Failed to change password. Verify your current password.'
      });
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleRequestOtp = async () => {
    setOtpRequestLoading(true);
    setEmailMsg({ type: '', text: '' });
    try {
      const res = await api.post('/auth/verify-request');
      if (res.data.success) {
        setOtpSent(true);
        if (res.data.devOtp) setDevOtp(res.data.devOtp);
        setEmailMsg({
          type: 'info',
          text: res.data.message || 'Verification OTP generated.'
        });
      }
    } catch (err) {
      setEmailMsg({
        type: 'danger',
        text: err.response?.data?.message || 'Failed to request verification code.'
      });
    } finally {
      setOtpRequestLoading(false);
    }
  };

  const handleConfirmOtp = async (e) => {
    e.preventDefault();
    if (!otpInput.trim()) return;

    setOtpVerifyLoading(true);
    try {
      const res = await api.post('/auth/verify-confirm', { otp: otpInput.trim() });
      if (res.data.success) {
        setEmailMsg({ type: 'success', text: 'Email successfully verified!' });
        setOtpSent(false);
        setOtpInput('');
        await refreshUser();
      }
    } catch (err) {
      setEmailMsg({
        type: 'danger',
        text: err.response?.data?.message || 'Invalid or expired verification code.'
      });
    } finally {
      setOtpVerifyLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '860px', margin: '0 auto' }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <SettingsIcon size={26} color="var(--accent-primary)" />
            Account Settings &amp; Security
          </h1>
          <p className="page-subtitle">
            Manage your credentials, security verification, and application preferences
          </p>
        </div>
      </div>

      {/* Account Profile Card */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <h3 className="card-title">User Account Overview</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', fontSize: '0.9rem' }}>
          <div>
            <span style={{ color: 'var(--text-muted)' }}>Full Name:</span>
            <p style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{user?.name}</p>
          </div>
          <div>
            <span style={{ color: 'var(--text-muted)' }}>Registered Email:</span>
            <p style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{user?.email}</p>
          </div>
          <div>
            <span style={{ color: 'var(--text-muted)' }}>Account ID:</span>
            <p style={{ fontFamily: 'monospace', color: 'var(--text-secondary)' }}>{user?.id}</p>
          </div>
          <div>
            <span style={{ color: 'var(--text-muted)' }}>Status:</span>
            <p>
              <span className="badge badge-green">Active Session</span>
            </p>
          </div>
        </div>
      </div>

      {/* Real Email Verification Section */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <div className="card-title">
          <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Mail size={18} color="var(--accent-secondary)" />
            Email Verification Status
          </span>
          {user?.isEmailVerified ? (
            <span className="badge badge-green">Verified</span>
          ) : (
            <span className="badge badge-amber">Unverified</span>
          )}
        </div>

        {emailMsg.text && (
          <div className={`alert alert-${emailMsg.type}`}>
            {emailMsg.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
            <span>{emailMsg.text}</span>
          </div>
        )}

        {user?.isEmailVerified ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--accent-green)' }}>
            <CheckCircle2 size={20} />
            <span style={{ fontSize: '0.925rem' }}>Your email address ({user.email}) has been verified.</span>
          </div>
        ) : (
          <div>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
              Verify ownership of your email address with a 6-digit cryptographic verification code.
              (In development mode, verification codes are logged directly to the server terminal).
            </p>

            {!otpSent ? (
              <button
                type="button"
                onClick={handleRequestOtp}
                className="btn btn-secondary"
                disabled={otpRequestLoading}
              >
                {otpRequestLoading ? 'Generating Code...' : 'Request Verification Code'}
              </button>
            ) : (
              <form onSubmit={handleConfirmOtp} style={{ maxWidth: '380px' }}>
                {devOtp && (
                  <div style={{ padding: '8px 12px', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-color)', marginBottom: '12px', fontSize: '0.85rem' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Development OTP: </span>
                    <strong style={{ color: 'var(--accent-green)', letterSpacing: '2px' }}>{devOtp}</strong>
                  </div>
                )}
                <div className="form-group">
                  <label className="form-label">Enter 6-Digit OTP</label>
                  <input
                    type="text"
                    maxLength={6}
                    className="form-control"
                    placeholder="123456"
                    value={otpInput}
                    onChange={(e) => setOtpInput(e.target.value)}
                    required
                  />
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button type="submit" className="btn btn-primary" disabled={otpVerifyLoading}>
                    {otpVerifyLoading ? 'Verifying...' : 'Confirm Verification'}
                  </button>
                  <button type="button" onClick={handleRequestOtp} className="btn btn-secondary">
                    Resend Code
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </div>

      {/* Change Password Form */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <h3 className="card-title">
          <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Lock size={18} color="var(--accent-primary)" />
            Update Password
          </span>
        </h3>

        {passwordMsg.text && (
          <div className={`alert alert-${passwordMsg.type}`}>
            {passwordMsg.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
            <span>{passwordMsg.text}</span>
          </div>
        )}

        <form onSubmit={handlePasswordChange}>
          <div className="form-group">
            <label className="form-label">Current Password</label>
            <input
              type="password"
              className="form-control"
              placeholder="Enter current password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">New Password</label>
            <input
              type="password"
              className="form-control"
              placeholder="e.g. Fitness@2026"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
            <PasswordStrengthMeter password={newPassword} />
          </div>

          <div className="form-group">
            <label className="form-label">Confirm New Password</label>
            <input
              type="password"
              className="form-control"
              placeholder="Re-enter new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button type="submit" className="btn btn-primary" disabled={passwordLoading}>
              <Save size={16} /> {passwordLoading ? 'Updating Password...' : 'Save New Password'}
            </button>
          </div>
        </form>
      </div>

      {/* Application Preferences Card */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <h3 className="card-title">Measurement &amp; UI Preferences</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '0.9rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--border-color)' }}>
            <div>
              <strong style={{ color: 'var(--text-primary)' }}>Unit System</strong>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Currently configured for Metric (Kilograms &amp; Centimeters).
              </p>
            </div>
            <span className="badge badge-green">Metric (Standard)</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0' }}>
            <div>
              <strong style={{ color: 'var(--text-primary)' }}>Theme Mode</strong>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Dark Charcoal &amp; Deep Navy with Electric Green / Blue accents.
              </p>
            </div>
            <span className="badge badge-blue">Dark High-Contrast</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
