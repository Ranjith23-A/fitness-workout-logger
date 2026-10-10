import React from 'react';

const StatCard = ({
  title,
  value,
  unit = '',
  subtitle,
  icon: Icon,
  color = 'var(--accent-primary)',
  bgColor = 'var(--accent-primary-light)',
  progress = null,
  trend = null
}) => {
  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            {title}
          </span>
          {Icon && (
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                backgroundColor: bgColor,
                color: color,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Icon size={20} />
            </div>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginBottom: '6px' }}>
          <span style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.1 }}>
            {value}
          </span>
          {unit && (
            <span style={{ fontSize: '0.95rem', fontWeight: 500, color: 'var(--text-muted)' }}>
              {unit}
            </span>
          )}
        </div>

        {subtitle && (
          <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            {subtitle}
          </p>
        )}
      </div>

      {progress !== null && (
        <div style={{ marginTop: '14px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.775rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
            <span>Goal Progress</span>
            <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{progress}%</span>
          </div>
          <div className="progress-container">
            <div className="progress-bar" style={{ width: `${Math.min(100, progress)}%` }} />
          </div>
        </div>
      )}

      {trend && (
        <div style={{ marginTop: '12px', fontSize: '0.8rem', color: trend.isPositive ? 'var(--accent-green)' : 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span>{trend.label}</span>
        </div>
      )}
    </div>
  );
};

export default StatCard;
