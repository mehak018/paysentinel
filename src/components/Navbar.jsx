// src/components/Navbar.jsx
import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.js';

// Nav links — shown to everyone
const PUBLIC_LINKS = [
  { label: 'Home', path: '/' },
];

// Nav links — shown only when logged in
const AUTH_LINKS = [
  { label: 'Dashboard',  path: '/dashboard'   },
  { label: 'Scanner',    path: '/scanner'      },
  { label: 'Verify UTR', path: '/verify-utr'   },
  { label: 'Screenshot', path: '/screenshot'   },
];

function Navbar() {
  const location  = useLocation();
  const navigate  = useNavigate();
  const { user, logOut } = useAuth();

  const isActive = (path) => location.pathname === path;

  const handleLogout = async () => {
    await logOut();
    navigate('/login');
  };

  // Combine links based on auth state
  const navLinks = user
    ? [...PUBLIC_LINKS, ...AUTH_LINKS]
    : PUBLIC_LINKS;

  const linkStyle = (path) => ({
    textDecoration: 'none',
    fontSize: 14,
    fontWeight: 500,
    padding: '6px 2px',
    borderBottom: isActive(path)
      ? '2px solid #00d4ff' : '2px solid transparent',
    color: isActive(path) ? '#00d4ff' : '#9ca3af',
    transition: 'color 0.2s',
    whiteSpace: 'nowrap',
  });

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
      background: 'rgba(4,6,13,0.95)',
      borderBottom: '1px solid rgba(255,255,255,0.07)',
      backdropFilter: 'blur(24px)',
    }}>
      <div style={{
        maxWidth: 1280, margin: '0 auto',
        padding: '0 24px', height: 64,
        display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', gap: 24,
      }}>

        {/* ── Logo ── */}
        <Link to="/" style={{
          display: 'flex', alignItems: 'center', gap: 10,
          textDecoration: 'none', color: 'white', flexShrink: 0,
        }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: 'linear-gradient(135deg, #00d4ff, #0066ff)',
            display: 'flex', alignItems: 'center',
            justifyContent: 'center', fontSize: 16,
          }}>🛡️</div>
          <span style={{ fontSize: 18, fontWeight: 700,
                         letterSpacing: -0.5 }}>
            Pay<span style={{ color: '#00d4ff' }}>Sentinel</span>
          </span>
        </Link>

        {/* ── Desktop Links ── */}
        <div style={{
          display: 'flex', gap: 28, alignItems: 'center',
          overflowX: 'auto',
        }}>
          {navLinks.map(item => (
            <Link key={item.path} to={item.path}
                  style={linkStyle(item.path)}>
              {item.label}
            </Link>
          ))}
        </div>

        {/* ── Right Side ── */}
        <div style={{ display: 'flex', alignItems: 'center',
                      gap: 10, flexShrink: 0 }}>
          {/* AI badge */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '4px 10px', borderRadius: 100,
            border: '1px solid rgba(0,255,136,0.25)',
            background: 'rgba(0,255,136,0.06)',
            color: '#00ff88', fontSize: 11, fontWeight: 700,
            whiteSpace: 'nowrap',
          }}>
            <span style={{
              width: 6, height: 6, borderRadius: '50%',
              background: '#00ff88',
              animation: 'blink 2s infinite',
            }}></span>
            AI ON
          </div>

          {user ? (
            <>
              <span style={{
                fontSize: 12, color: '#6b7280',
                maxWidth: 140, overflow: 'hidden',
                textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              }}>
                {user.email}
              </span>
              <button onClick={handleLogout} style={{
                padding: '7px 14px', borderRadius: 8,
                fontSize: 12, fontWeight: 600, cursor: 'pointer',
                background: 'rgba(255,68,85,0.08)',
                border: '1px solid rgba(255,68,85,0.25)',
                color: '#ff4455',
              }}>
                Log Out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" style={{ textDecoration: 'none' }}>
                <button style={{
                  padding: '7px 16px', borderRadius: 8,
                  fontSize: 13, fontWeight: 600, cursor: 'pointer',
                  background: 'transparent',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: '#d1d5db',
                }}>
                  Log In
                </button>
              </Link>
              <Link to="/signup" style={{ textDecoration: 'none' }}>
                <button style={{
                  padding: '7px 16px', borderRadius: 8,
                  fontSize: 13, fontWeight: 700, cursor: 'pointer',
                  border: 'none',
                  background: 'linear-gradient(135deg,#00d4ff,#0066ff)',
                  color: '#000',
                }}>
                  Get Started
                </button>
              </Link>
            </>
          )}
        </div>
      </div>

      <style>{`
        @keyframes blink {
          0%,100% { opacity:1; }
          50%      { opacity:0.3; }
        }
      `}</style>
    </nav>
  );
}

export default Navbar;