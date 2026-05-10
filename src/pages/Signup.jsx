// src/pages/Signup.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signUp, logInWithGoogle } from '../services/firebase';

function Signup() {
  const [name,     setName]     = useState('');
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [confirm,  setConfirm]  = useState('');
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);

  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');

    // Client-side validation before hitting Firebase
    if (password !== confirm) {
      return setError('Passwords do not match.');
    }
    if (password.length < 6) {
      return setError('Password must be at least 6 characters.');
    }

    setLoading(true);
    try {
      await signUp(email, password);
      // After signup, Firebase automatically logs the user in
      navigate('/dashboard');
    } catch (err) {
      const messages = {
        'auth/email-already-in-use': 'An account with this email already exists.',
        'auth/invalid-email':        'Please enter a valid email address.',
        'auth/weak-password':        'Password must be at least 6 characters.',
      };
      setError(messages[err.code] || 'Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setLoading(true);
    try {
      await logInWithGoogle();
      navigate('/dashboard');
    } catch (err) {
      setError('Google sign-in failed. Please try again.');
      setLoading(false);
    }
  };

  // Reusable input style
  const inputStyle = {
    width: '100%', padding: '12px 16px',
    background: '#080d1a',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 10, color: '#f1f5f9',
    fontSize: 14, outline: 'none',
    fontFamily: 'inherit', boxSizing: 'border-box'
  };

  const labelStyle = {
    display: 'block', fontSize: 12, color: '#9ca3af',
    fontWeight: 600, marginBottom: 8, letterSpacing: 0.5
  };

  return (
    <div style={{
      minHeight: '100vh', background: '#04060d',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '100px 24px 40px'
    }}>
      <div style={{ width: '100%', maxWidth: 440 }}>
        <div style={{
          background: '#0d1528',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 24, padding: '40px 36px',
          boxShadow: '0 40px 80px rgba(0,0,0,0.5)'
        }}>
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <div style={{
              width: 56, height: 56, borderRadius: 16,
              margin: '0 auto 16px',
              background: 'linear-gradient(135deg, #00d4ff, #0066ff)',
              display: 'flex', alignItems: 'center',
              justifyContent: 'center', fontSize: 24
            }}>🛡️</div>
            <h1 style={{ fontSize: 24, fontWeight: 800,
                         letterSpacing: -0.5, color: '#f1f5f9' }}>
              Create account
            </h1>
            <p style={{ color: '#6b7280', fontSize: 14, marginTop: 6 }}>
              Start protecting your payments today — free
            </p>
          </div>

          {/* Google */}
          <button onClick={handleGoogle} disabled={loading} style={{
            width: '100%', padding: '13px 20px', marginBottom: 20,
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 12, color: '#f1f5f9',
            fontSize: 14, fontWeight: 600, cursor: 'pointer',
            display: 'flex', alignItems: 'center',
            justifyContent: 'center', gap: 10,
            opacity: loading ? 0.6 : 1
          }}>
            <svg width="18" height="18" viewBox="0 0 18 18">
              <path fill="#4285F4" d="M16.51 8H8.98v3h4.3c-.18 1-.74 1.48-1.6 2.04v2.01h2.6a7.8 7.8 0 0 0 2.38-5.88c0-.57-.05-.66-.15-1.18z"/>
              <path fill="#34A853" d="M8.98 17c2.16 0 3.97-.72 5.3-1.94l-2.6-2a4.8 4.8 0 0 1-7.18-2.54H1.83v2.07A8 8 0 0 0 8.98 17z"/>
              <path fill="#FBBC05" d="M4.5 10.52a4.8 4.8 0 0 1 0-3.04V5.41H1.83a8 8 0 0 0 0 7.18z"/>
              <path fill="#EA4335" d="M8.98 4.18c1.17 0 2.23.4 3.06 1.2l2.3-2.3A8 8 0 0 0 1.83 5.4L4.5 7.49a4.77 4.77 0 0 1 4.48-3.3z"/>
            </svg>
            Continue with Google
          </button>

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center',
                        gap: 12, marginBottom: 20 }}>
            <div style={{ flex: 1, height: 1,
                          background: 'rgba(255,255,255,0.08)' }}></div>
            <span style={{ fontSize: 12, color: '#4b5563' }}>or with email</span>
            <div style={{ flex: 1, height: 1,
                          background: 'rgba(255,255,255,0.08)' }}></div>
          </div>

          {/* Form */}
          <form onSubmit={handleSignup}>
            <div style={{ marginBottom: 14 }}>
              <label style={labelStyle}>FULL NAME</label>
              <input type="text" placeholder="Rahul Sharma"
                value={name} onChange={e => setName(e.target.value)}
                required style={inputStyle}
                onFocus={e => e.target.style.borderColor = '#00d4ff'}
                onBlur={e  => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
              />
            </div>

            <div style={{ marginBottom: 14 }}>
              <label style={labelStyle}>EMAIL ADDRESS</label>
              <input type="email" placeholder="you@example.com"
                value={email} onChange={e => setEmail(e.target.value)}
                required style={inputStyle}
                onFocus={e => e.target.style.borderColor = '#00d4ff'}
                onBlur={e  => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
              />
            </div>

            <div style={{ marginBottom: 14 }}>
              <label style={labelStyle}>PASSWORD</label>
              <input type="password" placeholder="Min. 6 characters"
                value={password} onChange={e => setPassword(e.target.value)}
                required style={inputStyle}
                onFocus={e => e.target.style.borderColor = '#00d4ff'}
                onBlur={e  => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
              />
            </div>

            <div style={{ marginBottom: 24 }}>
              <label style={labelStyle}>CONFIRM PASSWORD</label>
              <input type="password" placeholder="••••••••"
                value={confirm} onChange={e => setConfirm(e.target.value)}
                required style={inputStyle}
                onFocus={e => e.target.style.borderColor = '#00d4ff'}
                onBlur={e  => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
              />
            </div>

            {error && (
              <div style={{
                marginBottom: 16, padding: '12px 16px',
                background: 'rgba(255,68,85,0.08)',
                border: '1px solid rgba(255,68,85,0.2)',
                borderRadius: 10, color: '#ff4455', fontSize: 13
              }}>
                ⚠️ {error}
              </div>
            )}

            <button type="submit" disabled={loading} style={{
              width: '100%', padding: '14px',
              background: 'linear-gradient(135deg, #00d4ff, #0066ff)',
              border: 'none', borderRadius: 12,
              color: '#000', fontSize: 15, fontWeight: 700,
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1
            }}>
              {loading ? 'Creating account...' : '🚀 Create Free Account'}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: 24,
                      fontSize: 14, color: '#6b7280' }}>
            Already have an account?{' '}
            <Link to="/login" style={{
              color: '#00d4ff', fontWeight: 600, textDecoration: 'none'
            }}>
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Signup;