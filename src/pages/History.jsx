// src/pages/History.jsx
import React, { useEffect, useState } from 'react';
import { getScanHistory } from '../services/firebase.js';
import { useAuth }        from '../contexts/AuthContext.js';

// Badge for each verdict
function VerdictBadge({ verdict }) {
  const map = {
    GENUINE:    { color: '#00ff88', bg: 'rgba(0,255,136,0.1)'  },
    SAFE:       { color: '#00ff88', bg: 'rgba(0,255,136,0.1)'  },
    SUSPICIOUS: { color: '#ffaa00', bg: 'rgba(255,170,0,0.1)'  },
    FRAUD:      { color: '#ff4455', bg: 'rgba(255,68,85,0.1)'  },
    MALICIOUS:  { color: '#ff4455', bg: 'rgba(255,68,85,0.1)'  },
  };
  const s = map[verdict] || map.SUSPICIOUS;
  return (
    <span style={{
      padding: '3px 10px', borderRadius: 6,
      fontSize: 11, fontWeight: 700,
      color: s.color, background: s.bg,
      border: `1px solid ${s.color}30`,
    }}>
      {verdict}
    </span>
  );
}

// Icon for each scan type
const TYPE_ICONS = {
  UTR:        '🔢',
  QR:         '📱',
  SCREENSHOT: '🖼️',
};

function History() {
  const { user }              = useAuth();
  const [scans,   setScans]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter,  setFilter]  = useState('ALL');

  // Load scan history when page mounts
  useEffect(() => {
    const load = async () => {
      if (!user) return;
      setLoading(true);
      const data = await getScanHistory(user.uid, 50);
      setScans(data);
      setLoading(false);
    };
    load();
  }, [user]);

  // Filter by scan type
  const filtered = filter === 'ALL'
    ? scans
    : scans.filter(s => s.type === filter);

  // Stats summary
  const stats = {
    total:      scans.length,
    fraud:      scans.filter(s =>
                  ['FRAUD','MALICIOUS'].includes(s.verdict)).length,
    safe:       scans.filter(s =>
                  ['GENUINE','SAFE'].includes(s.verdict)).length,
    suspicious: scans.filter(s => s.verdict === 'SUSPICIOUS').length,
  };

  return (
    <div style={{ paddingTop: 80, minHeight: '100vh',
                  background: '#04060d', color: '#f1f5f9' }}>
      <div style={{ maxWidth: 1000, margin: '0 auto',
                    padding: '40px 24px' }}>

        {/* ── Header ── */}
        <div style={{ marginBottom: 32 }}>
          <p style={{ fontSize: 12, color: '#00d4ff', fontWeight: 700,
                      letterSpacing: 2, textTransform: 'uppercase',
                      marginBottom: 6 }}>
            📋 Scan History
          </p>
          <h1 style={{ fontSize: 32, fontWeight: 800,
                       letterSpacing: -1, marginBottom: 8 }}>
            Your{' '}
            <span style={{ color: '#00d4ff' }}>Security Activity</span>
          </h1>
          <p style={{ color: '#6b7280', fontSize: 14 }}>
            Every scan you've performed — stored securely in your account.
          </p>
        </div>

        {/* ── Summary Stats ── */}
        <div style={{ display: 'grid',
                      gridTemplateColumns: 'repeat(4,1fr)',
                      gap: 14, marginBottom: 28 }}>
          {[
            { label: 'Total Scans', value: stats.total,
              color: '#00d4ff' },
            { label: 'Safe / Genuine', value: stats.safe,
              color: '#00ff88' },
            { label: 'Suspicious', value: stats.suspicious,
              color: '#ffaa00' },
            { label: 'Fraud Detected', value: stats.fraud,
              color: '#ff4455' },
          ].map(stat => (
            <div key={stat.label} style={{
              padding: '18px 20px', borderRadius: 14,
              background: '#0d1528',
              border: '1px solid rgba(255,255,255,0.07)',
            }}>
              <p style={{ fontSize: 10, color: '#6b7280', fontWeight: 700,
                          textTransform: 'uppercase', letterSpacing: 1,
                          marginBottom: 8 }}>
                {stat.label}
              </p>
              <p style={{ fontSize: 28, fontWeight: 800,
                          color: stat.color, letterSpacing: -1 }}>
                {loading ? '—' : stat.value}
              </p>
            </div>
          ))}
        </div>

        {/* ── Filter Tabs ── */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
          {['ALL','UTR','QR','SCREENSHOT'].map(tab => (
            <button key={tab} onClick={() => setFilter(tab)} style={{
              padding: '7px 16px', borderRadius: 8,
              fontSize: 12, fontWeight: 700, cursor: 'pointer',
              border: 'none',
              background: filter === tab
                ? 'rgba(0,212,255,0.15)' : 'rgba(255,255,255,0.04)',
              color: filter === tab ? '#00d4ff' : '#6b7280',
              transition: 'all 0.2s',
            }}>
              {tab === 'ALL' ? 'All Scans' :
               tab === 'UTR' ? '🔢 UTR' :
               tab === 'QR'  ? '📱 QR' : '🖼️ Screenshot'}
            </button>
          ))}
        </div>

        {/* ── Scan List ── */}
        <div style={{
          background: '#0d1528',
          border: '1px solid rgba(255,255,255,0.07)',
          borderRadius: 20, overflow: 'hidden',
        }}>

          {/* Table Header */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '48px 1fr 120px 100px 100px 160px',
            gap: 12, padding: '14px 20px',
            background: '#080d1a',
            borderBottom: '1px solid rgba(255,255,255,0.07)',
          }}>
            {['','Details','Type','Verdict','Risk','Time'].map(h => (
              <p key={h} style={{ fontSize: 10, color: '#6b7280',
                                  fontWeight: 700, textTransform: 'uppercase',
                                  letterSpacing: 1 }}>
                {h}
              </p>
            ))}
          </div>

          {/* Loading */}
          {loading && (
            <div style={{ padding: '60px 20px', textAlign: 'center' }}>
              <p style={{ color: '#6b7280', fontSize: 14 }}>
                Loading your scan history...
              </p>
            </div>
          )}

          {/* Empty state */}
          {!loading && filtered.length === 0 && (
            <div style={{ padding: '60px 20px', textAlign: 'center' }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
              <p style={{ color: '#6b7280', fontSize: 15,
                          fontWeight: 600, marginBottom: 8 }}>
                No scans yet
              </p>
              <p style={{ color: '#4b5563', fontSize: 13 }}>
                {filter === 'ALL'
                  ? 'Start scanning UTRs, QR codes, or screenshots to see history here.'
                  : `No ${filter} scans found.`}
              </p>
            </div>
          )}

          {/* Scan rows */}
          {!loading && filtered.map((scan, i) => (
            <div key={scan.id || i} style={{
              display: 'grid',
              gridTemplateColumns: '48px 1fr 120px 100px 100px 160px',
              gap: 12, padding: '14px 20px', alignItems: 'center',
              borderBottom: i < filtered.length - 1
                ? '1px solid rgba(255,255,255,0.04)' : 'none',
              transition: 'background 0.15s',
            }}
            onMouseEnter={e =>
              e.currentTarget.style.background =
                'rgba(255,255,255,0.02)'}
            onMouseLeave={e =>
              e.currentTarget.style.background = 'transparent'}
            >
              {/* Type icon */}
              <div style={{ fontSize: 22, textAlign: 'center' }}>
                {TYPE_ICONS[scan.type] || '🔍'}
              </div>

              {/* Details */}
              <div>
                <p style={{ fontSize: 13, color: '#e2e8f0',
                            fontWeight: 600, marginBottom: 3 }}>
                  {scan.type === 'UTR'
                    ? `UTR: ${scan.utrNumber || '—'}`
                    : scan.type === 'QR'
                    ? `QR: ${scan.qrType || 'Unknown type'}`
                    : `Screenshot: ${scan.paymentApp || 'Unknown app'}`}
                </p>
                <p style={{ fontSize: 11, color: '#6b7280',
                            fontFamily: 'monospace' }}>
                  {scan.type === 'UTR' && scan.amount
                    ? `₹${scan.amount} · ${scan.method}`
                    : scan.type === 'SCREENSHOT' && scan.fileName
                    ? scan.fileName
                    : scan.content
                    ? scan.content.substring(0, 50) + '...'
                    : 'No details'}
                </p>
              </div>

              {/* Type badge */}
              <span style={{
                fontSize: 11, fontWeight: 700, color: '#6b7280',
                background: 'rgba(255,255,255,0.05)',
                padding: '3px 10px', borderRadius: 6,
                textAlign: 'center',
              }}>
                {scan.type}
              </span>

              {/* Verdict */}
              <VerdictBadge verdict={scan.verdict} />

              {/* Risk score */}
              <div>
                <p style={{
                  fontSize: 13, fontWeight: 700,
                  color: scan.riskScore >= 60 ? '#ff4455' :
                         scan.riskScore >= 30 ? '#ffaa00' : '#00ff88',
                }}>
                  {scan.riskScore ?? '—'}/100
                </p>
              </div>

              {/* Time */}
              <p style={{ fontSize: 11, color: '#4b5563',
                          fontFamily: 'monospace' }}>
                {scan.createdAt || 'Just now'}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default History;