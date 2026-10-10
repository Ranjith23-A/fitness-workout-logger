import React from 'react';
import { Check, X } from 'lucide-react';
import { evaluatePasswordStrength } from '../utils/calculations';

const PasswordStrengthMeter = ({ password }) => {
  const result = evaluatePasswordStrength(password);

  if (!password) return null;

  return (
    <div style={{ marginTop: '10px' }}>
      {/* Strength Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
        <span style={{ fontSize: '0.775rem', color: 'var(--text-muted)' }}>Password Strength:</span>
        <span style={{ fontSize: '0.8rem', fontWeight: 600, color: result.color }}>
          {result.label}
        </span>
      </div>

      <div style={{ display: 'flex', gap: '4px', height: '5px', marginBottom: '10px' }}>
        {[1, 2, 3, 4].map((step) => (
          <div
            key={step}
            style={{
              flex: 1,
              borderRadius: '2px',
              backgroundColor: step <= result.score ? result.color : 'var(--bg-secondary)',
              transition: 'background-color 0.2s'
            }}
          />
        ))}
      </div>

      {/* Checklist items */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '6px',
          fontSize: '0.75rem',
          backgroundColor: 'var(--bg-input)',
          padding: '8px 12px',
          borderRadius: 'var(--radius-sm)',
          border: '1px solid var(--border-color)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: result.hasLength ? 'var(--accent-green)' : 'var(--text-muted)' }}>
          {result.hasLength ? <Check size={14} /> : <X size={14} />}
          <span>At least 8 characters</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: result.hasUpper ? 'var(--accent-green)' : 'var(--text-muted)' }}>
          {result.hasUpper ? <Check size={14} /> : <X size={14} />}
          <span>Uppercase letter (A-Z)</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: result.hasLower ? 'var(--accent-green)' : 'var(--text-muted)' }}>
          {result.hasLower ? <Check size={14} /> : <X size={14} />}
          <span>Lowercase letter (a-z)</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: result.hasNumber ? 'var(--accent-green)' : 'var(--text-muted)' }}>
          {result.hasNumber ? <Check size={14} /> : <X size={14} />}
          <span>At least one number (0-9)</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: result.hasSpecial ? 'var(--accent-green)' : 'var(--text-muted)' }}>
          {result.hasSpecial ? <Check size={14} /> : <X size={14} />}
          <span>Special character (!@#$)</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: result.isByteSafe ? 'var(--accent-green)' : 'var(--accent-red)' }}>
          {result.isByteSafe ? <Check size={14} /> : <X size={14} />}
          <span>Max 72 UTF-8 bytes</span>
        </div>
      </div>
    </div>
  );
};

export default PasswordStrengthMeter;
