import React from 'react';

const BmiIndicator = ({ bmi, category, color, previousBmi = null, healthyRange = null }) => {
  if (!bmi) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '24px' }}>
        <p style={{ color: 'var(--text-muted)' }}>Complete your height and weight in profile to compute BMI.</p>
      </div>
    );
  }

  // Calculate percentage along the gauge (15 to 35 range)
  const minBmi = 15;
  const maxBmi = 35;
  const clampedBmi = Math.max(minBmi, Math.min(maxBmi, bmi));
  const pointerPercent = ((clampedBmi - minBmi) / (maxBmi - minBmi)) * 100;

  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
        <div>
          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
            Body Mass Index (BMI)
          </span>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginTop: '6px' }}>
            <span style={{ fontSize: '2.25rem', fontWeight: 800, color: color || 'var(--accent-primary)' }}>
              {bmi}
            </span>
            <span
              className="badge"
              style={{
                backgroundColor: `${color}25`,
                color: color,
                border: `1px solid ${color}50`,
                fontSize: '0.85rem'
              }}
            >
              {category}
            </span>
          </div>
        </div>

        {previousBmi && (
          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Previous BMI</span>
            <p style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
              {previousBmi}{' '}
              <span
                style={{
                  fontSize: '0.8rem',
                  color: bmi < previousBmi ? 'var(--accent-green)' : bmi > previousBmi ? 'var(--accent-amber)' : 'inherit'
                }}
              >
                ({bmi > previousBmi ? '+' : ''}{(bmi - previousBmi).toFixed(1)})
              </span>
            </p>
          </div>
        )}
      </div>

      {/* Visual Multi-Segment Gauge */}
      <div style={{ marginTop: '16px', position: 'relative' }}>
        <div
          style={{
            height: '12px',
            borderRadius: '6px',
            display: 'flex',
            overflow: 'hidden',
            backgroundColor: 'var(--bg-secondary)'
          }}
        >
          {/* Underweight: <18.5 (width ~ 17.5%) */}
          <div style={{ flex: '17.5', backgroundColor: '#38bdf8' }} title="Underweight (<18.5)" />
          {/* Normal: 18.5 - 24.9 (width ~ 32%) */}
          <div style={{ flex: '32', backgroundColor: '#10b981' }} title="Normal (18.5 - 24.9)" />
          {/* Overweight: 25.0 - 29.9 (width ~ 25%) */}
          <div style={{ flex: '25', backgroundColor: '#f59e0b' }} title="Overweight (25 - 29.9)" />
          {/* Obese: >=30 (width ~ 25.5%) */}
          <div style={{ flex: '25.5', backgroundColor: '#ef4444' }} title="Obese (>=30)" />
        </div>

        {/* Pointer needle indicator */}
        <div
          style={{
            position: 'absolute',
            left: `${pointerPercent}%`,
            top: '-4px',
            transform: 'translateX(-50%)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            transition: 'left 0.4s ease'
          }}
        >
          <div
            style={{
              width: '4px',
              height: '20px',
              backgroundColor: '#ffffff',
              borderRadius: '2px',
              boxShadow: '0 0 6px rgba(0, 0, 0, 0.8)'
            }}
          />
        </div>

        {/* Category Tick Labels */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: '0.725rem',
            color: 'var(--text-muted)',
            marginTop: '8px'
          }}
        >
          <span>Underweight (&lt;18.5)</span>
          <span>Normal (18.5-24.9)</span>
          <span>Overweight (25-29.9)</span>
          <span>Obese (&ge;30)</span>
        </div>
      </div>

      {healthyRange && (
        <div
          style={{
            marginTop: '16px',
            padding: '10px 14px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--bg-secondary)',
            fontSize: '0.825rem',
            color: 'var(--text-secondary)',
            display: 'flex',
            justifyContent: 'space-between'
          }}
        >
          <span>Target Healthy Weight Range:</span>
          <span style={{ fontWeight: 600, color: 'var(--accent-primary)' }}>
            {healthyRange.minKg} kg &ndash; {healthyRange.maxKg} kg
          </span>
        </div>
      )}

      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '12px', fontStyle: 'italic' }}>
        * Standard WHO adult BMI indicator. Does not differentiate between lean muscle mass and adipose tissue. Not designed for children or pregnant women.
      </p>
    </div>
  );
};

export default BmiIndicator;
