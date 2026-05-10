import React, { useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale, LinearScale,
  BarElement, LineElement, PointElement,
  Title, Tooltip, Legend, Filler
} from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';

// Register the chart components we'll use
ChartJS.register(
  CategoryScale, LinearScale,
  BarElement, LineElement, PointElement,
  Title, Tooltip, Legend, Filler
);

// ── Small reusable metric card ──────────────────────────────
function MetricCard({ icon, label, value, change, changeColor, borderColor }) {
  return (
    <div style={{
      background: '#080d1a',
      border: `1px solid ${borderColor || 'rgba(255,255,255,0.06)'}`,
      borderRadius: 16, padding: '24px',
      display: 'flex', flexDirection: 'column', gap: 8
    }}>
      <div style={{ fontSize: 28 }}>{icon}</div>
      <p style={{ fontSize: 11, color: '#6b7280', fontWeight: 700,
                  textTransform: 'uppercase', letterSpacing: 1 }}>
        {label}
      </p>
      <p style={{ fontSize: 32, fontWeight: 800,
                  letterSpacing: -1, color: '#f1f5f9' }}>
        {value}
      </p>
      <p style={{ fontSize: 12, color: changeColor || '#6b7280',
                  fontFamily: 'monospace' }}>
        {change}
      </p>
    </div>
  );
}

// ── Single alert row ────────────────────────────────────────
function AlertRow({ type, message, time, confidence }) {
  const colors = {
    danger: { dot: '#ff4455', bg: 'rgba(255,68,85,0.08)',
               border: 'rgba(255,68,85,0.2)', label: 'FRAUD' },
    warning:{ dot: '#ffaa00', bg: 'rgba(255,170,0,0.08)',
               border: 'rgba(255,170,0,0.2)', label: 'SUSPICIOUS' },
    info:   { dot: '#00d4ff', bg: 'rgba(0,212,255,0.08)',
               border: 'rgba(0,212,255,0.2)', label: 'INFO' },
  };
  const c = colors[type] || colors.info;

  return (
    <div style={{
      display: 'flex', alignItems: 'flex-start', gap: 14,
      padding: '14px 16px', borderRadius: 10,
      background: c.bg, border: `1px solid ${c.border}`,
      marginBottom: 10
    }}>
      {/* Colored dot */}
      <span style={{
        width: 8, height: 8, borderRadius: '50%',
        background: c.dot, marginTop: 5, flexShrink: 0
      }}></span>

      <div style={{ flex: 1 }}>
        <p style={{ fontSize: 13, color: '#e2e8f0', marginBottom: 3 }}>
          {message}
        </p>
        <p style={{ fontSize: 11, color: '#6b7280', fontFamily: 'monospace' }}>
          {time}
          {confidence && (
            <span style={{ marginLeft: 10, color: c.dot }}>
              · Confidence: {confidence}
            </span>
          )}
        </p>
      </div>

      {/* Badge */}
      <span style={{
        fontSize: 10, fontWeight: 800, padding: '3px 8px',
        borderRadius: 6, background: c.bg,
        border: `1px solid ${c.border}`, color: c.dot,
        letterSpacing: 1, flexShrink: 0
      }}>
        {c.label}
      </span>
    </div>
  );
}

// ── Single transaction row ──────────────────────────────────
function TxRow({ name, utr, amount, status, time }) {
  const statusStyles = {
    genuine:    { color: '#00ff88', bg: 'rgba(0,255,136,0.08)',
                  border: 'rgba(0,255,136,0.2)',  label: '✓ Genuine' },
    fraud:      { color: '#ff4455', bg: 'rgba(255,68,85,0.08)',
                  border: 'rgba(255,68,85,0.2)',  label: '✕ Fraud' },
    suspicious: { color: '#ffaa00', bg: 'rgba(255,170,0,0.08)',
                  border: 'rgba(255,170,0,0.2)',  label: '⚠ Suspicious' },
  };
  const s = statusStyles[status] || statusStyles.genuine;

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '1fr 160px 100px 120px 110px',
      gap: 12, padding: '14px 0',
      borderBottom: '1px solid rgba(255,255,255,0.05)',
      alignItems: 'center'
    }}>
      <div>
        <p style={{ fontSize: 13, color: '#e2e8f0', fontWeight: 600 }}>{name}</p>
        <p style={{ fontSize: 11, color: '#6b7280', fontFamily: 'monospace',
                    marginTop: 2 }}>
          UTR: {utr}
        </p>
      </div>
      <p style={{ fontSize: 12, color: '#6b7280', fontFamily: 'monospace' }}>
        {time}
      </p>
      <p style={{ fontSize: 14, fontWeight: 700, color: '#f1f5f9' }}>{amount}</p>
      <span style={{
        display: 'inline-block', padding: '4px 10px', borderRadius: 8,
        fontSize: 11, fontWeight: 700,
        color: s.color, background: s.bg, border: `1px solid ${s.border}`,
        textAlign: 'center'
      }}>
        {s.label}
      </span>
      <p style={{ fontSize: 11, color: '#6b7280' }}>{time}</p>
    </div>
  );
}

// ── MAIN DASHBOARD PAGE ─────────────────────────────────────
function Dashboard() {
  // Controls which tab is active in alerts section
  const [activeTab, setActiveTab] = useState('all');

  // ── Chart Data: Bar chart (scan activity) ──
  const barData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'Safe Scans',
        data: [186, 240, 175, 310, 220, 290, 210],
        backgroundColor: 'rgba(0, 102, 255, 0.6)',
        borderRadius: 6,
      },
      {
        label: 'Frauds Detected',
        data: [12, 18, 9, 24, 15, 21, 11],
        backgroundColor: 'rgba(255, 68, 85, 0.7)',
        borderRadius: 6,
      },
    ],
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: { color: '#9ca3af', font: { size: 12 } }
      },
      tooltip: {
        backgroundColor: '#0d1528',
        borderColor: 'rgba(255,255,255,0.1)',
        borderWidth: 1,
        titleColor: '#e2e8f0',
        bodyColor: '#9ca3af',
      }
    },
    scales: {
      x: {
        ticks: { color: '#6b7280' },
        grid:  { color: 'rgba(255,255,255,0.04)' },
      },
      y: {
        ticks: { color: '#6b7280' },
        grid:  { color: 'rgba(255,255,255,0.04)' },
      },
    },
  };

  // ── Chart Data: Line chart (fraud trend) ──
  const lineData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
    datasets: [
      {
        label: 'Fraud Attempts',
        data: [65, 78, 52, 91, 88, 110, 95],
        borderColor: '#ff4455',
        backgroundColor: 'rgba(255, 68, 85, 0.08)',
        borderWidth: 2,
        pointBackgroundColor: '#ff4455',
        pointRadius: 4,
        tension: 0.4,
        fill: true,
      },
      {
        label: 'Blocked',
        data: [60, 74, 50, 89, 85, 107, 93],
        borderColor: '#00d4ff',
        backgroundColor: 'rgba(0, 212, 255, 0.05)',
        borderWidth: 2,
        pointBackgroundColor: '#00d4ff',
        pointRadius: 4,
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: { color: '#9ca3af', font: { size: 12 } }
      },
      tooltip: {
        backgroundColor: '#0d1528',
        borderColor: 'rgba(255,255,255,0.1)',
        borderWidth: 1,
        titleColor: '#e2e8f0',
        bodyColor: '#9ca3af',
      }
    },
    scales: {
      x: {
        ticks: { color: '#6b7280' },
        grid:  { color: 'rgba(255,255,255,0.04)' },
      },
      y: {
        ticks: { color: '#6b7280' },
        grid:  { color: 'rgba(255,255,255,0.04)' },
      },
    },
  };

  // ── Alert data ──
  const alerts = [
    { type: 'danger',  message: 'Fake PhonePe screenshot detected — metadata mismatch',
      time: '2 min ago',  confidence: '98.4%' },
    { type: 'warning', message: 'Suspicious QR code → redirects to phishing domain',
      time: '14 min ago', confidence: '87.1%' },
    { type: 'danger',  message: 'UTR 412938764502 not found in NPCI records',
      time: '31 min ago', confidence: '99.1%' },
    { type: 'info',    message: 'Edited screenshot flagged via Adobe metadata forensics',
      time: '1 hr ago',  confidence: '76.3%' },
    { type: 'warning', message: 'Duplicate UTR reused from 3-day-old transaction',
      time: '2 hr ago',  confidence: '91.0%' },
  ];

  const filtered = activeTab === 'all'
    ? alerts
    : alerts.filter(a => a.type === activeTab);

  // ── Transaction data ──
  const transactions = [
    { name: 'Raj Electronics',   utr: '412938001122', amount: '₹5,000',
      status: 'genuine',    time: '10:24 AM' },
    { name: 'Unknown Merchant',  utr: '412938764502', amount: '₹12,500',
      status: 'fraud',      time: '10:31 AM' },
    { name: 'Priya Stores',      utr: '519827364011', amount: '₹800',
      status: 'genuine',    time: '11:02 AM' },
    { name: 'FastDeal99',        utr: '000000000001', amount: '₹45,000',
      status: 'suspicious', time: '11:45 AM' },
    { name: 'Amazon Pay',        utr: '623819204756', amount: '₹2,300',
      status: 'genuine',    time: '12:10 PM' },
  ];

  return (
    <div style={{ paddingTop: 80, minHeight: '100vh',
                  background: '#04060d', color: '#f1f5f9' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 24px' }}>

        {/* ── Page Header ── */}
        <div style={{ marginBottom: 36 }}>
          <div style={{ display: 'flex', alignItems: 'center',
                        justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
            <div>
              <p style={{ fontSize: 12, color: '#00d4ff', fontWeight: 700,
                          letterSpacing: 2, textTransform: 'uppercase',
                          marginBottom: 6 }}>
                📊 Security Dashboard
              </p>
              <h1 style={{ fontSize: 36, fontWeight: 800,
                           letterSpacing: -1, lineHeight: 1.1 }}>
                Fraud Analytics
                <span style={{ color: '#00d4ff' }}> Overview</span>
              </h1>
              <p style={{ color: '#6b7280', marginTop: 8, fontSize: 14 }}>
                Real-time payment security monitoring · Updated just now
              </p>
            </div>

            {/* Live indicator */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '10px 20px', borderRadius: 100,
              border: '1px solid rgba(0,255,136,0.2)',
              background: 'rgba(0,255,136,0.05)',
              color: '#00ff88', fontSize: 13, fontWeight: 600
            }}>
              <span style={{
                width: 8, height: 8, borderRadius: '50%',
                background: '#00ff88',
                boxShadow: '0 0 8px #00ff88',
                animation: 'pulse 2s infinite'
              }}></span>
              Live Monitoring ON
            </div>
          </div>
        </div>

        {/* ── Metric Cards Row ── */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
          gap: 16, marginBottom: 28
        }}>
          <MetricCard icon="🔍" label="Total Scans Today"
            value="1,247" change="↑ +18% from yesterday"
            changeColor="#00ff88" borderColor="rgba(0,212,255,0.15)" />
          <MetricCard icon="🚨" label="Frauds Blocked"
            value="38" change="⚠ 3 high-risk alerts today"
            changeColor="#ffaa00" borderColor="rgba(255,68,85,0.2)" />
          <MetricCard icon="✅" label="Safe Payments"
            value="1,209" change="↑ 97.0% safe rate"
            changeColor="#00ff88" borderColor="rgba(0,255,136,0.15)" />
          <MetricCard icon="📱" label="QR Codes Checked"
            value="512" change="4 malicious detected"
            changeColor="#ff4455" borderColor="rgba(255,255,255,0.06)" />
        </div>

        {/* ── Charts Row ── */}
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr',
          gap: 20, marginBottom: 28
        }}>
          {/* Bar Chart */}
          <div style={{
            background: '#080d1a', borderRadius: 16, padding: 24,
            border: '1px solid rgba(255,255,255,0.06)'
          }}>
            <p style={{ fontSize: 11, color: '#6b7280', fontWeight: 700,
                        textTransform: 'uppercase', letterSpacing: 1,
                        marginBottom: 20 }}>
              Scan Activity — Last 7 Days
            </p>
            <div style={{ height: 220 }}>
              <Bar data={barData} options={barOptions} />
            </div>
          </div>

          {/* Line Chart */}
          <div style={{
            background: '#080d1a', borderRadius: 16, padding: 24,
            border: '1px solid rgba(255,255,255,0.06)'
          }}>
            <p style={{ fontSize: 11, color: '#6b7280', fontWeight: 700,
                        textTransform: 'uppercase', letterSpacing: 1,
                        marginBottom: 20 }}>
              Fraud Trend — Last 7 Months
            </p>
            <div style={{ height: 220 }}>
              <Line data={lineData} options={lineOptions} />
            </div>
          </div>
        </div>

        {/* ── AI Alerts Section ── */}
        <div style={{
          background: '#080d1a', borderRadius: 16, padding: 24,
          border: '1px solid rgba(255,255,255,0.06)', marginBottom: 28
        }}>
          {/* Header + filter tabs */}
          <div style={{ display: 'flex', alignItems: 'center',
                        justifyContent: 'space-between', marginBottom: 20,
                        flexWrap: 'wrap', gap: 12 }}>
            <p style={{ fontSize: 11, color: '#6b7280', fontWeight: 700,
                        textTransform: 'uppercase', letterSpacing: 1 }}>
              🚨 AI Fraud Alerts
            </p>
            {/* Filter tabs */}
            <div style={{ display: 'flex', gap: 8 }}>
              {['all','danger','warning','info'].map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab)} style={{
                  padding: '5px 14px', borderRadius: 8, fontSize: 11,
                  fontWeight: 700, cursor: 'pointer', border: 'none',
                  textTransform: 'capitalize',
                  background: activeTab === tab
                    ? 'rgba(0,212,255,0.15)' : 'rgba(255,255,255,0.04)',
                  color: activeTab === tab ? '#00d4ff' : '#6b7280',
                  transition: 'all 0.2s'
                }}>
                  {tab === 'danger' ? 'Fraud' : tab === 'warning'
                    ? 'Suspicious' : tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Alert rows */}
          {filtered.length > 0
            ? filtered.map((a, i) => (
                <AlertRow key={i} {...a} />
              ))
            : <p style={{ color: '#6b7280', fontSize: 13, padding: '20px 0',
                          textAlign: 'center' }}>
                No alerts in this category.
              </p>
          }
        </div>

        {/* ── Recent Transactions Table ── */}
        <div style={{
          background: '#080d1a', borderRadius: 16, padding: 24,
          border: '1px solid rgba(255,255,255,0.06)'
        }}>
          <p style={{ fontSize: 11, color: '#6b7280', fontWeight: 700,
                      textTransform: 'uppercase', letterSpacing: 1,
                      marginBottom: 20 }}>
            📋 Recent Transactions
          </p>

          {/* Table header */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 160px 100px 120px 110px',
            gap: 12, paddingBottom: 10,
            borderBottom: '1px solid rgba(255,255,255,0.08)'
          }}>
            {['Merchant / UTR','Time','Amount','Status','Verified'].map(h => (
              <p key={h} style={{ fontSize: 10, color: '#6b7280',
                                  fontWeight: 700, textTransform: 'uppercase',
                                  letterSpacing: 1 }}>
                {h}
              </p>
            ))}
          </div>

          {/* Transaction rows */}
          {transactions.map((tx, i) => (
            <TxRow key={i} {...tx} />
          ))}
        </div>

      </div>

      {/* Pulse animation for the live dot */}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.3; }
        }
      `}</style>
    </div>
  );
}

export default Dashboard;