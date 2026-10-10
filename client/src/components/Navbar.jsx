import React from 'react';
import { Menu, Plus, Flame } from 'lucide-react';
import { Link } from 'react-router-dom';

const Navbar = ({ onToggleSidebar }) => {
  return (
    <header
      style={{
        height: '64px',
        borderBottom: '1px solid var(--border-color)',
        backgroundColor: 'var(--bg-secondary)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 24px',
        position: 'sticky',
        top: 0,
        zIndex: 30
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <button
          onClick={onToggleSidebar}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '8px',
            borderRadius: 'var(--radius-sm)',
            color: 'var(--text-secondary)',
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border-color)'
          }}
          aria-label="Toggle Navigation"
        >
          <Menu size={20} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Flame size={20} color="var(--accent-primary)" />
          <span style={{ fontWeight: 800, fontSize: '1.05rem', color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            Fitness <span style={{ color: 'var(--accent-primary)' }}>Logging</span>
          </span>
        </div>
      </div>

      <Link
        to="/add-workout"
        className="btn btn-primary btn-sm"
        style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
      >
        <Plus size={16} />
        <span>Log Workout</span>
      </Link>
    </header>
  );
};

export default Navbar;
