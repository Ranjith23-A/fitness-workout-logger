import React from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, Home } from 'lucide-react';

const NotFound = () => {
  return (
    <div
      style={{
        minHeight: '70vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '24px'
      }}
    >
      <div
        style={{
          width: '64px',
          height: '64px',
          borderRadius: '50%',
          backgroundColor: 'var(--accent-red-light)',
          color: 'var(--accent-red)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '20px'
        }}
      >
        <AlertCircle size={32} />
      </div>
      <h1 style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px' }}>
        404
      </h1>
      <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '16px' }}>
        Page Not Found
      </h2>
      <p style={{ maxWidth: '420px', color: 'var(--text-muted)', marginBottom: '24px' }}>
        The fitness screen you are looking for does not exist or may have been relocated.
      </p>
      <Link to="/" className="btn btn-primary">
        <Home size={16} /> Return to Dashboard
      </Link>
    </div>
  );
};

export default NotFound;
