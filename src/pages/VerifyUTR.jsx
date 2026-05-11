// src/pages/VerifyUTR.jsx
import { saveScanResult } from '../services/firebase.js';
import { useAuth }        from '../contexts/AuthContext.js';
import React, { useState } from 'react';
import { verifyUTR } from '../services/api.js';
import VerdictCard from '../components/VerdictCard.jsx';

// ── History row component ────────────────────────────────────
function HistoryRow({ utr, verdict, amount, time }) {
  const colors = {
    GENUINE:    '#00ff88',
    SUSPICIOUS: '#ffaa00',
    FRAUD:      '#ff4455',
  };
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 14,
      padding: '12px 0',
      borderBottom: '1px solid rgba(255,255,255,0.05)',
    }}>
      <span style={{
        width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
        background: colors[verdict] || '#6b7280',
      }}></span>
      <div style={{ flex: 1 }}>
        <p style={{ fontSize: 13, fontFamily: 'monospace',
                    color: '#e2e8f0' }}>
          {utr}
        </p>
        <p style={{ fontSize: 11, color: '#6b7280', marginTop: 2 }}>
          {time}
        </p>
      </div>
      <p style={{ fontSize: 13, color: '#9ca3af' }}>₹{amount}</p>
      <span style={{
        padding: '3px 10px', borderRadius: 6,
        fontSize: 11, fontWeight: 700,
        color: colors[verdict] || '#6b7280',
        background: `${colors[verdict] || '#6b7280'}15`,
        border: `1px solid ${colors[verdict] || '#6b7280'}30`,
      }}>
        {verdict}
      </span>
    </div>
  );
}

// ── MAIN PAGE ────────────────────────────────────────────────
function VerifyUTR() {
  const { user } = useAuth();
  // Form state
  const [utrNumber,      setUtrNumber]      = useState('');
  const [paymentMethod,  setPaymentMethod]  = useState('UPI');
  const [expectedAmount, setExpectedAmount] = useState('');

  // UI state
  const [loading, setLoading] = useState(false);
  const [result,  setResult]  = useState(null);
  const [error,   setError]   = useState('');

  // Local history (in production: fetch from database)
  const [history, setHistory] = useState([
    { utr: '412938001122', verdict: 'GENUINE',    amount: 5000,  time: '10:24 AM' },
    { utr: '412938764502', verdict: 'FRAUD',      amount: 12500, time: '10:31 AM' },
    { utr: '519827364011', verdict: 'GENUINE',    amount: 800,   time: '11:02 AM' },
  ]);

  // ── Submit handler ──
  const handleVerify = async (e) => {
    e.preventDefault();
    setError('');
    setResult(null);

    if (!utrNumber.trim()) {
      setError('Please enter a UTR number.');
      return;
    }

    setLoading(true);

    try {
      const data = await verifyUTR(
        utrNumber.trim(),
        paymentMethod,
        expectedAmount
      );
      setResult(data);
      // Save to Firestore if user is logged in
if (user) {
  await saveScanResult(user.uid, {
    type:      'UTR',
    utrNumber: utrNumber.trim(),
    verdict:   data.verdict,
    confidence:data.confidence,
    riskScore: data.riskScore,
    method:    paymentMethod,
    amount:    expectedAmount || null,
  });
}

      // Add to local history
      setHistory(prev => [{
        utr:     utrNumber.trim(),
        verdict: data.verdict,
        amount:  expectedAmount || '—',
        time:    new Date().toLocaleTimeString(),
      }, ...prev].slice(0, 10)); // keep latest 10

    } catch (err) {
      setError(
        err.response?.data?.error ||
        'Could not connect to server. Make sure your backend is running on port 5000.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setError('');
    setUtrNumber('');
    setExpectedAmount('');
  };

  // Quick-fill demo UTRs
  const DEMO_UTRS = [
    { label: '✅ Valid UTR',   value: '412938001122' },
    { label: '🚨 Fake UTR',    value: '000000000001' },
    { label: '⚠ Unknown UTR', value: '999888777666' },
  ];

  return (
    <div style={{ paddingTop: 80, minHeight: '100vh',
                  background: '#04060d', color: '#f1f5f9' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto',
                    padding: '40px 24px' }}>

        {/* ── Page Header ── */}
        <div style={{ marginBottom: 36 }}>
          <p style={{ fontSize: 12, color: '#00d4ff', fontWeight: 700,
                      letterSpacing: 2, textTransform: 'uppercase',
                      marginBottom: 6 }}>
            🔢 UTR Verification
          </p>
          <h1 style={{ fontSize: 36, fontWeight: 800,
                       letterSpacing: -1, lineHeight: 1.1,
                       marginBottom: 10 }}>
            Verify Any{' '}
            <span style={{ color: '#00d4ff' }}>
              Transaction Reference
            </span>
          </h1>
          <p style={{ color: '#6b7280', fontSize: 15, maxWidth: 560 }}>
            Enter a UTR, NEFT, RTGS, or IMPS reference number.
            Our AI checks it against payment records instantly.
          </p>
        </div>

        {/* ── Scam Warning Banner ── */}
        <div style={{
          display: 'flex', gap: 14, padding: '16px 20px',
          borderRadius: 14, marginBottom: 32,
          background: 'rgba(255,170,0,0.06)',
          border: '1px solid rgba(255,170,0,0.2)',
        }}>
          <span style={{ fontSize: 22, flexShrink: 0 }}>⚠️</span>
          <div>
            <p style={{ fontSize: 13, fontWeight: 700,
                        color: '#ffaa00', marginBottom: 4 }}>
              Common Scam Alert
            </p>
            <p style={{ fontSize: 13, color: '#9ca3af', lineHeight: 1.6 }}>
              Fraudsters send fake UTR numbers copied from old transactions.
              Always verify before releasing goods or services.
              A real UTR can be confirmed with your bank within seconds.
            </p>
          </div>
        </div>

        <div style={{ display: 'grid',
                      gridTemplateColumns: '1fr 340px', gap: 24 }}>

          {/* ── Left: Form + Result ── */}
          <div>
            {/* Verification Form */}
            <div style={{
              background: '#0d1528',
              border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: 20, padding: 28, marginBottom: 24,
            }}>
              <p style={{ fontSize: 14, fontWeight: 700,
                          color: '#e2e8f0', marginBottom: 20 }}>
                🔍 Enter Transaction Details
              </p>

              {/* Demo UTR quick-fill buttons */}
              <div style={{ marginBottom: 20 }}>
                <p style={{ fontSize: 11, color: '#6b7280',
                            fontWeight: 700, textTransform: 'uppercase',
                            letterSpacing: 1, marginBottom: 10 }}>
                  Try a demo UTR:
                </p>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {DEMO_UTRS.map(demo => (
                    <button key={demo.value}
                      onClick={() => setUtrNumber(demo.value)}
                      style={{
                        padding: '6px 12px', borderRadius: 8,
                        fontSize: 12, fontWeight: 600, cursor: 'pointer',
                        background: 'rgba(0,212,255,0.07)',
                        border: '1px solid rgba(0,212,255,0.2)',
                        color: '#00d4ff',
                      }}>
                      {demo.label}
                    </button>
                  ))}
                </div>
              </div>

              <form onSubmit={handleVerify}>
                {/* UTR Input */}
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', fontSize: 12,
                                  color: '#9ca3af', fontWeight: 700,
                                  textTransform: 'uppercase',
                                  letterSpacing: 1, marginBottom: 8 }}>
                    UTR / Reference Number *
                  </label>
                  <input
                    type="text"
                    value={utrNumber}
                    onChange={e => setUtrNumber(e.target.value)}
                    placeholder="e.g. 412938001122"
                    maxLength={24}
                    style={{
                      width: '100%', padding: '13px 16px',
                      background: '#080d1a',
                      border: '1px solid rgba(255,255,255,0.08)',
                      borderRadius: 10, color: '#f1f5f9',
                      fontSize: 15, fontFamily: 'monospace',
                      outline: 'none', boxSizing: 'border-box',
                      letterSpacing: 1,
                    }}
                    onFocus={e =>
                      e.target.style.borderColor = '#00d4ff'}
                    onBlur={e =>
                      e.target.style.borderColor =
                        'rgba(255,255,255,0.08)'}
                  />
                </div>

                {/* Payment Method */}
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', fontSize: 12,
                                  color: '#9ca3af', fontWeight: 700,
                                  textTransform: 'uppercase',
                                  letterSpacing: 1, marginBottom: 8 }}>
                    Payment Method
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={e => setPaymentMethod(e.target.value)}
                    style={{
                      width: '100%', padding: '13px 16px',
                      background: '#080d1a',
                      border: '1px solid rgba(255,255,255,0.08)',
                      borderRadius: 10, color: '#f1f5f9',
                      fontSize: 14, outline: 'none',
                      boxSizing: 'border-box', cursor: 'pointer',
                    }}>
                    <option value="UPI">UPI</option>
                    <option value="NEFT">NEFT</option>
                    <option value="RTGS">RTGS</option>
                    <option value="IMPS">IMPS</option>
                  </select>
                </div>

                {/* Expected Amount */}
                <div style={{ marginBottom: 24 }}>
                  <label style={{ display: 'block', fontSize: 12,
                                  color: '#9ca3af', fontWeight: 700,
                                  textTransform: 'uppercase',
                                  letterSpacing: 1, marginBottom: 8 }}>
                    Expected Amount (₹) — Optional
                  </label>
                  <input
                    type="number"
                    value={expectedAmount}
                    onChange={e => setExpectedAmount(e.target.value)}
                    placeholder="e.g. 5000"
                    min="1"
                    style={{
                      width: '100%', padding: '13px 16px',
                      background: '#080d1a',
                      border: '1px solid rgba(255,255,255,0.08)',
                      borderRadius: 10, color: '#f1f5f9',
                      fontSize: 14, outline: 'none',
                      boxSizing: 'border-box',
                    }}
                    onFocus={e =>
                      e.target.style.borderColor = '#00d4ff'}
                    onBlur={e =>
                      e.target.style.borderColor =
                        'rgba(255,255,255,0.08)'}
                  />
                </div>

                {/* Error */}
                {error && (
                  <div style={{
                    marginBottom: 16, padding: '12px 16px',
                    borderRadius: 10, fontSize: 13, color: '#ff4455',
                    background: 'rgba(255,68,85,0.07)',
                    border: '1px solid rgba(255,68,85,0.2)',
                  }}>
                    ⚠️ {error}
                  </div>
                )}

                {/* Buttons */}
                <div style={{ display: 'flex', gap: 10 }}>
                  <button type="submit" disabled={loading} style={{
                    flex: 1, padding: '14px',
                    background: loading
                      ? 'rgba(0,212,255,0.3)'
                      : 'linear-gradient(135deg,#00d4ff,#0066ff)',
                    border: 'none', borderRadius: 12,
                    color: loading ? '#9ca3af' : '#000',
                    fontSize: 15, fontWeight: 700,
                    cursor: loading ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s',
                  }}>
                    {loading ? '🔄 Verifying...' : '🛡️ Verify Now'}
                  </button>

                  {result && (
                    <button type="button" onClick={handleReset}
                      style={{
                        padding: '14px 20px', borderRadius: 12,
                        border: '1px solid rgba(255,255,255,0.1)',
                        background: 'transparent', color: '#9ca3af',
                        fontSize: 14, fontWeight: 600, cursor: 'pointer',
                      }}>
                      Reset
                    </button>
                  )}
                </div>
              </form>
            </div>

            {/* Loading skeleton */}
            {loading && (
              <div style={{
                padding: 28, borderRadius: 20,
                background: '#0d1528',
                border: '1px solid rgba(255,255,255,0.07)',
                textAlign: 'center',
              }}>
                <div style={{ fontSize: 36, marginBottom: 12 }}>🔄</div>
                <p style={{ color: '#00d4ff', fontWeight: 700,
                            fontSize: 16, marginBottom: 6 }}>
                  Querying payment database...
                </p>
                <p style={{ color: '#6b7280', fontSize: 13 }}>
                  Checking NPCI records · Analyzing patterns ·
                  Calculating risk score
                </p>
              </div>
            )}

            {/* Result card */}
            {!loading && result && (
              <VerdictCard data={result} />
            )}
          </div>

          {/* ── Right: History + Info ── */}
          <div style={{ display: 'flex',
                        flexDirection: 'column', gap: 20 }}>

            {/* How it works */}
            <div style={{
              background: '#0d1528',
              border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: 16, padding: 22,
            }}>
              <p style={{ fontSize: 11, color: '#00d4ff',
                          fontWeight: 700, textTransform: 'uppercase',
                          letterSpacing: 1, marginBottom: 14 }}>
                How It Works
              </p>
              {[
                { step: '1', text: 'Enter the UTR sent by the payer' },
                { step: '2', text: 'AI cross-checks against bank records' },
                { step: '3', text: 'Fraud patterns are analyzed in ms' },
                { step: '4', text: 'Verdict: Genuine / Suspicious / Fraud' },
              ].map(item => (
                <div key={item.step} style={{
                  display: 'flex', gap: 12, alignItems: 'flex-start',
                  marginBottom: 12,
                }}>
                  <span style={{
                    width: 24, height: 24, borderRadius: 6, flexShrink: 0,
                    background: 'rgba(0,212,255,0.1)',
                    color: '#00d4ff', fontSize: 12, fontWeight: 800,
                    display: 'flex', alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    {item.step}
                  </span>
                  <p style={{ fontSize: 13, color: '#9ca3af',
                              lineHeight: 1.5 }}>
                    {item.text}
                  </p>
                </div>
              ))}
            </div>

            {/* Recent History */}
            <div style={{
              background: '#0d1528',
              border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: 16, padding: 22, flex: 1,
            }}>
              <p style={{ fontSize: 11, color: '#6b7280',
                          fontWeight: 700, textTransform: 'uppercase',
                          letterSpacing: 1, marginBottom: 14 }}>
                📋 Recent Checks
              </p>
              {history.map((item, i) => (
                <HistoryRow key={i} {...item} />
              ))}
              {history.length === 0 && (
                <p style={{ color: '#4b5563', fontSize: 13,
                            textAlign: 'center', padding: '20px 0' }}>
                  No checks yet
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default VerifyUTR;