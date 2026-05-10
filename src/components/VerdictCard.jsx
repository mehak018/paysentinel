// src/components/VerdictCard.jsx
// Reusable verdict display — used by UTR and Screenshot pages

import React from 'react';

// Config for each verdict type
const VERDICT_CONFIG = {
  GENUINE: {
    icon: '✅', color: '#00ff88',
    bg: 'rgba(0,255,136,0.06)',
    border: 'rgba(0,255,136,0.25)',
    label: 'GENUINE — Payment Verified',
  },
  SUSPICIOUS: {
    icon: '⚠️', color: '#ffaa00',
    bg: 'rgba(255,170,0,0.06)',
    border: 'rgba(255,170,0,0.25)',
    label: 'SUSPICIOUS — Verify Carefully',
  },
  FRAUD: {
    icon: '🚨', color: '#ff4455',
    bg: 'rgba(255,68,85,0.06)',
    border: 'rgba(255,68,85,0.25)',
    label: 'FRAUD DETECTED',
  },
  SAFE: {
    icon: '✅', color: '#00ff88',
    bg: 'rgba(0,255,136,0.06)',
    border: 'rgba(0,255,136,0.25)',
    label: 'SAFE',
  },
  MALICIOUS: {
    icon: '🚨', color: '#ff4455',
    bg: 'rgba(255,68,85,0.06)',
    border: 'rgba(255,68,85,0.25)',
    label: 'MALICIOUS — Do Not Proceed',
  },
};

// Individual check row inside the card
function CheckRow({ check }) {
  const icons  = { pass: '✓', warn: '⚠', fail: '✕' };
  const colors = { pass: '#00ff88', warn: '#ffaa00', fail: '#ff4455' };

  return (
    <div style={{
      display: 'flex', alignItems: 'flex-start', gap: 12,
      padding: '12px 0',
      borderBottom: '1px solid rgba(255,255,255,0.05)',
    }}>
      {/* Status icon */}
      <span style={{
        width: 24, height: 24, borderRadius: 6, flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 12, fontWeight: 800,
        background: `${colors[check.status]}18`,
        color: colors[check.status],
      }}>
        {icons[check.status]}
      </span>

      <div style={{ flex: 1 }}>
        <p style={{ fontSize: 13, fontWeight: 600,
                    color: '#e2e8f0', marginBottom: 3 }}>
          {check.name}
        </p>
        <p style={{ fontSize: 12, color: '#6b7280' }}>
          {check.message}
        </p>
        {check.detail && (
          <p style={{ fontSize: 11, color: '#4b5563',
                      fontFamily: 'monospace', marginTop: 2 }}>
            {check.detail}
          </p>
        )}
      </div>
    </div>
  );
}

// Risk score bar
function RiskBar({ score }) {
  const color = score >= 60 ? '#ff4455'
              : score >= 30 ? '#ffaa00' : '#00ff88';
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between',
                    marginBottom: 6 }}>
        <span style={{ fontSize: 11, color: '#6b7280',
                       fontWeight: 700, textTransform: 'uppercase',
                       letterSpacing: 1 }}>
          Risk Score
        </span>
        <span style={{ fontSize: 13, fontWeight: 800, color }}>
          {score}/100
        </span>
      </div>
      {/* Track */}
      <div style={{ height: 6, borderRadius: 3,
                    background: 'rgba(255,255,255,0.06)' }}>
        {/* Fill */}
        <div style={{
          height: '100%', borderRadius: 3,
          width: `${score}%`,
          background: color,
          transition: 'width 1s ease',
          boxShadow: `0 0 8px ${color}60`,
        }}></div>
      </div>
    </div>
  );
}

// ── MAIN COMPONENT ───────────────────────────────────────────
function VerdictCard({ data }) {
  if (!data) return null;

  const config = VERDICT_CONFIG[data.verdict] || VERDICT_CONFIG.SUSPICIOUS;

  return (
    <div style={{
      marginTop: 24,
      border: `1px solid ${config.border}`,
      borderRadius: 20, overflow: 'hidden',
    }}>
      {/* ── Header ── */}
      <div style={{
        padding: '24px 28px',
        background: config.bg,
        borderBottom: `1px solid ${config.border}`,
      }}>
        <div style={{ display: 'flex', alignItems: 'center',
                      gap: 16, marginBottom: 16 }}>
          <span style={{ fontSize: 44 }}>{config.icon}</span>
          <div>
            <p style={{ fontSize: 22, fontWeight: 800,
                        color: config.color, letterSpacing: -0.5 }}>
              {config.label}
            </p>
            <p style={{ fontSize: 13, color: '#9ca3af', marginTop: 4 }}>
              Confidence: {data.confidence}% · Scan ID: {data.scanId?.slice(0, 8)}
            </p>
          </div>
        </div>

        {/* Risk bar */}
        <RiskBar score={data.riskScore || 0} />
      </div>

      {/* ── Body ── */}
      <div style={{ padding: '24px 28px', background: '#080d1a' }}>

        {/* Summary + Recommendation */}
        {data.reason && (
          <div style={{
            padding: '14px 18px', borderRadius: 10, marginBottom: 20,
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.06)',
          }}>
            <p style={{ fontSize: 13, color: '#e2e8f0',
                        lineHeight: 1.6 }}>
              📋 {data.reason}
            </p>
          </div>
        )}

        {data.recommendation && (
          <div style={{
            padding: '14px 18px', borderRadius: 10, marginBottom: 20,
            background: `${config.color}0d`,
            border: `1px solid ${config.border}`,
          }}>
            <p style={{ fontSize: 13, color: config.color,
                        fontWeight: 600, lineHeight: 1.6 }}>
              💡 {data.recommendation}
            </p>
          </div>
        )}

        {/* Details grid (UTR specific) */}
        {data.details && (
          <div style={{
            display: 'grid', gridTemplateColumns: '1fr 1fr',
            gap: 10, marginBottom: 20,
          }}>
            {Object.entries(data.details)
              .filter(([k]) => !['riskFactors','recommendation',
                                 'checkedAt','scannedAt'].includes(k))
              .map(([key, val]) => (
                <div key={key} style={{
                  padding: '12px 14px', borderRadius: 8,
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.05)',
                }}>
                  <p style={{ fontSize: 10, color: '#6b7280',
                              fontWeight: 700, textTransform: 'uppercase',
                              letterSpacing: 1, marginBottom: 4 }}>
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </p>
                  <p style={{ fontSize: 13, color: '#e2e8f0',
                              fontWeight: 500 }}>
                    {String(val) === 'true'  ? '✓ Yes'  :
                     String(val) === 'false' ? '✗ No'   :
                     val || '—'}
                  </p>
                </div>
              ))}
          </div>
        )}

        {/* Forensic checks list */}
        {data.checks && data.checks.length > 0 && (
          <div>
            <p style={{ fontSize: 11, color: '#6b7280', fontWeight: 700,
                        textTransform: 'uppercase', letterSpacing: 1,
                        marginBottom: 4 }}>
              Forensic Checks ({data.checks.length})
            </p>
            {data.checks.map((check, i) => (
              <CheckRow key={i} check={check} />
            ))}
          </div>
        )}

        {/* Timestamp */}
        <p style={{ fontSize: 11, color: '#4b5563', marginTop: 16,
                    fontFamily: 'monospace', textAlign: 'right' }}>
          Analyzed: {new Date(
            data.analyzedAt || data.scannedAt || data.checkedAt
            || Date.now()
          ).toLocaleString()}
        </p>
      </div>
    </div>
  );
}

export default VerdictCard;