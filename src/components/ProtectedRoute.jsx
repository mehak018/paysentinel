// src/components/ProtectedRoute.jsx
// This component acts like a security guard.
// If you're not logged in, it sends you to /login.
// If you are logged in, it lets you through.

import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.js';

function ProtectedRoute({ children }) {
  // Grab the current user from our global auth shelf
  const { user, loading } = useAuth();

  // Still checking auth state — show nothing yet
  if (loading) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex',
        alignItems: 'center', justifyContent: 'center',
        background: '#04060d'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🛡️</div>
          <p style={{ color: '#00d4ff', fontSize: 16, fontWeight: 600 }}>
            Verifying identity...
          </p>
        </div>
      </div>
    );
  }

  // Not logged in → redirect to login page
  // 'replace' means the login page replaces this in browser history
  // so pressing Back doesn't bring them to a protected page
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Logged in → show the actual page
  return children;
}

export default ProtectedRoute;