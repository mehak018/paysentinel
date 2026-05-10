// src/pages/Screenshot.jsx
import React, { useState, useRef, useCallback } from 'react';
import { analyzeScreenshot } from '../services/api.js';
import VerdictCard from '../components/VerdictCard.jsx';

function Screenshot() {
  const [file,          setFile]          = useState(null);
  const [preview,       setPreview]       = useState(null);
  const [paymentApp,    setPaymentApp]    = useState('PhonePe');
  const [expectedAmt,   setExpectedAmt]   = useState('');
  const [loading,       setLoading]       = useState(false);
  const [result,        setResult]        = useState(null);
  const [error,         setError]         = useState('');
  const [dragOver,      setDragOver]      = useState(false);

  const inputRef = useRef(null);

  // ── Handle file selection ──────────────────────────────────
  const handleFile = useCallback((selectedFile) => {
    if (!selectedFile) return;

    // Validate type
    const allowed = ['image/jpeg','image/jpg','image/png','image/webp'];
    if (!allowed.includes(selectedFile.type)) {
      setError('Only JPG, PNG, and WEBP images are allowed.');
      return;
    }

    // Validate size (5MB)
    if (selectedFile.size > 5 * 1024 * 1024) {
      setError('File is too large. Maximum size is 5MB.');
      return;
    }

    setError('');
    setResult(null);
    setFile(selectedFile);

    // Create a preview URL so we can show the image
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target.result);
    reader.readAsDataURL(selectedFile);
  }, []);

  // ── Drag and drop handlers ─────────────────────────────────
  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragOver(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) handleFile(dropped);
  }, [handleFile]);

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => setDragOver(false);

  // ── Submit to backend ──────────────────────────────────────
  const handleAnalyze = async () => {
    if (!file) {
      setError('Please upload a screenshot first.');
      return;
    }
    setError('');
    setLoading(true);
    setResult(null);

    try {
      const data = await analyzeScreenshot(file, paymentApp, expectedAmt);
      setResult(data);
    } catch (err) {
      setError(
        err.response?.data?.error ||
        'Could not connect to server. Make sure backend is running on port 5000.'
      );
    } finally {
      setLoading(false);
    }
  };

  // ── Reset everything ───────────────────────────────────────
  const handleReset = () => {
    setFile(null);
    setPreview(null);
    setResult(null);
    setError('');
    setExpectedAmt('');
    if (inputRef.current) inputRef.current.value = '';
  };

  const PAYMENT_APPS = [
    'PhonePe','Google Pay','Paytm','Amazon Pay',
    'BHIM','NEFT / Bank Transfer','Other'
  ];

  return (
    <div style={{ paddingTop: 80, minHeight: '100vh',
                  background: '#04060d', color: '#f1f5f9' }}>
      <div style={{ maxWidth: 1000, margin: '0 auto',
                    padding: '40px 24px' }}>

        {/* ── Page Header ── */}
        <div style={{ marginBottom: 36 }}>
          <p style={{ fontSize: 12, color: '#00d4ff', fontWeight: 700,
                      letterSpacing: 2, textTransform: 'uppercase',
                      marginBottom: 6 }}>
            🖼️ Screenshot Analysis
          </p>
          <h1 style={{ fontSize: 36, fontWeight: 800,
                       letterSpacing: -1, lineHeight: 1.1,
                       marginBottom: 10 }}>
            Detect{' '}
            <span style={{ color: '#00d4ff' }}>
              Fake Payment Screenshots
            </span>
          </h1>
          <p style={{ color: '#6b7280', fontSize: 15, maxWidth: 560 }}>
            Upload any payment confirmation screenshot. Our AI forensic
            engine checks for photo editing, metadata tampering, and
            pixel manipulation.
          </p>
        </div>

        {/* ── Main Card ── */}
        <div style={{
          background: '#0d1528',
          border: '1px solid rgba(255,255,255,0.07)',
          borderRadius: 20, padding: 32, marginBottom: 24,
        }}>

          {/* ── Drop Zone ── */}
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => !file && inputRef.current?.click()}
            style={{
              border: `2px dashed ${
                dragOver ? '#00d4ff' :
                file      ? 'rgba(0,255,136,0.4)' :
                            'rgba(255,255,255,0.1)'}`,
              borderRadius: 16, marginBottom: 24,
              background: dragOver
                ? 'rgba(0,212,255,0.04)' : 'rgba(255,255,255,0.02)',
              transition: 'all 0.2s',
              cursor: file ? 'default' : 'pointer',
              overflow: 'hidden',
              minHeight: 220,
              display: 'flex', alignItems: 'center',
              justifyContent: 'center',
            }}>

            {preview ? (
              // ── Show uploaded image ──
              <div style={{ position: 'relative', width: '100%' }}>
                <img
                  src={preview}
                  alt="Uploaded screenshot"
                  style={{
                    width: '100%', maxHeight: 360,
                    objectFit: 'contain', display: 'block',
                    borderRadius: 14,
                  }}
                />
                {/* File info overlay */}
                <div style={{
                  position: 'absolute', bottom: 12, left: 12,
                  padding: '6px 12px', borderRadius: 8,
                  background: 'rgba(0,0,0,0.8)',
                  backdropFilter: 'blur(8px)',
                }}>
                  <p style={{ fontSize: 12, color: '#e2e8f0',
                              fontWeight: 600 }}>
                    {file.name}
                  </p>
                  <p style={{ fontSize: 10, color: '#6b7280' }}>
                    {(file.size / 1024).toFixed(1)} KB · {file.type}
                  </p>
                </div>
                {/* Remove button */}
                <button
                  onClick={(e) => { e.stopPropagation(); handleReset(); }}
                  style={{
                    position: 'absolute', top: 10, right: 10,
                    width: 32, height: 32, borderRadius: '50%',
                    background: 'rgba(255,68,85,0.8)',
                    border: 'none', color: 'white',
                    fontSize: 16, cursor: 'pointer',
                    display: 'flex', alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                  ✕
                </button>
              </div>
            ) : (
              // ── Upload prompt ──
              <div style={{ textAlign: 'center', padding: 40 }}>
                <div style={{ fontSize: 52, marginBottom: 16 }}>
                  {dragOver ? '📥' : '📂'}
                </div>
                <p style={{ fontSize: 16, fontWeight: 700,
                            color: '#e2e8f0', marginBottom: 8 }}>
                  {dragOver
                    ? 'Drop your screenshot here'
                    : 'Drag & drop your screenshot here'}
                </p>
                <p style={{ fontSize: 13, color: '#6b7280',
                            marginBottom: 16 }}>
                  or click to browse files
                </p>
                <span style={{
                  padding: '8px 20px', borderRadius: 8,
                  background: 'rgba(0,212,255,0.1)',
                  border: '1px solid rgba(0,212,255,0.25)',
                  color: '#00d4ff', fontSize: 13, fontWeight: 600,
                }}>
                  Choose File
                </span>
                <p style={{ fontSize: 11, color: '#4b5563',
                            marginTop: 16 }}>
                  JPG, PNG, WEBP · Max 5MB
                </p>
              </div>
            )}
          </div>

          {/* Hidden file input */}
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp"
            style={{ display: 'none' }}
            onChange={e => handleFile(e.target.files[0])}
          />

          {/* ── Options Row ── */}
          <div style={{ display: 'grid',
                        gridTemplateColumns: '1fr 1fr', gap: 16,
                        marginBottom: 20 }}>
            {/* Payment App selector */}
            <div>
              <label style={{ display: 'block', fontSize: 11,
                              color: '#9ca3af', fontWeight: 700,
                              textTransform: 'uppercase', letterSpacing: 1,
                              marginBottom: 8 }}>
                Payment App
              </label>
              <select
                value={paymentApp}
                onChange={e => setPaymentApp(e.target.value)}
                style={{
                  width: '100%', padding: '12px 14px',
                  background: '#080d1a',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: 10, color: '#f1f5f9',
                  fontSize: 14, outline: 'none',
                  boxSizing: 'border-box', cursor: 'pointer',
                }}>
                {PAYMENT_APPS.map(app => (
                  <option key={app} value={app}>{app}</option>
                ))}
              </select>
            </div>

            {/* Expected amount */}
            <div>
              <label style={{ display: 'block', fontSize: 11,
                              color: '#9ca3af', fontWeight: 700,
                              textTransform: 'uppercase', letterSpacing: 1,
                              marginBottom: 8 }}>
                Expected Amount (₹) — Optional
              </label>
              <input
                type="number"
                value={expectedAmt}
                onChange={e => setExpectedAmt(e.target.value)}
                placeholder="e.g. 5000"
                style={{
                  width: '100%', padding: '12px 14px',
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
          </div>

          {/* Error */}
          {error && (
            <div style={{
              marginBottom: 16, padding: '12px 16px', borderRadius: 10,
              fontSize: 13, color: '#ff4455',
              background: 'rgba(255,68,85,0.07)',
              border: '1px solid rgba(255,68,85,0.2)',
            }}>
              ⚠️ {error}
            </div>
          )}

          {/* Analyze Button */}
          <button
            onClick={handleAnalyze}
            disabled={!file || loading}
            style={{
              width: '100%', padding: '15px',
              background: (!file || loading)
                ? 'rgba(0,212,255,0.2)'
                : 'linear-gradient(135deg,#00d4ff,#0066ff)',
              border: 'none', borderRadius: 12,
              color: (!file || loading) ? '#6b7280' : '#000',
              fontSize: 16, fontWeight: 700,
              cursor: (!file || loading) ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s',
            }}>
            {loading
              ? '🔬 Running Forensic Analysis...'
              : '🔬 Analyze Screenshot'}
          </button>
        </div>

        {/* ── Loading State ── */}
        {loading && (
          <div style={{
            padding: 32, borderRadius: 20, textAlign: 'center',
            background: '#0d1528',
            border: '1px solid rgba(255,255,255,0.07)',
            marginBottom: 24,
          }}>
            <div style={{ fontSize: 40, marginBottom: 16 }}>🔬</div>
            <p style={{ color: '#00d4ff', fontWeight: 700,
                        fontSize: 17, marginBottom: 8 }}>
              Forensic Analysis Running...
            </p>
            {/* Animated steps */}
            {[
              '📋 Extracting EXIF metadata',
              '🔍 Checking pixel integrity',
              '🖋 Verifying font consistency',
              '🤖 Running AI fraud classifier',
            ].map((step, i) => (
              <p key={i} style={{
                fontSize: 13, color: '#6b7280',
                marginTop: 6,
                animation: `fadeIn 0.5s ease ${i * 0.3}s both`,
              }}>
                {step}
              </p>
            ))}
          </div>
        )}

        {/* ── Result ── */}
        {!loading && result && (
          <>
            <VerdictCard data={result} />
            <button onClick={handleReset} style={{
              marginTop: 16, width: '100%', padding: '13px',
              background: 'transparent',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 12, color: '#9ca3af',
              fontSize: 14, fontWeight: 600, cursor: 'pointer',
            }}>
              🔄 Analyze Another Screenshot
            </button>
          </>
        )}

        {/* ── What We Check section ── */}
        {!result && !loading && (
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(3,1fr)',
            gap: 16, marginTop: 8,
          }}>
            {[
              { icon: '📋', title: 'EXIF Metadata',
                desc: 'Detects editing software like Photoshop or Snapseed hidden in file data' },
              { icon: '🔍', title: 'Pixel Analysis',
                desc: 'Finds unnatural pixel patterns near amount and UTR fields' },
              { icon: '🖋', title: 'Font & Layout',
                desc: 'Compares fonts and spacing against known payment app templates' },
              { icon: '⏰', title: 'Timestamp Check',
                desc: 'Validates transaction time and date for unusual patterns' },
              { icon: '🤖', title: 'AI Classifier',
                desc: 'Machine learning model trained on thousands of real/fake screenshots' },
              { icon: '📏', title: 'Dimension Check',
                desc: 'Screenshot dimensions must match device resolution of claimed app' },
            ].map(item => (
              <div key={item.title} style={{
                padding: '18px 20px', borderRadius: 14,
                background: '#0d1528',
                border: '1px solid rgba(255,255,255,0.06)',
              }}>
                <div style={{ fontSize: 24, marginBottom: 10 }}>
                  {item.icon}
                </div>
                <p style={{ fontSize: 13, fontWeight: 700,
                            color: '#e2e8f0', marginBottom: 6 }}>
                  {item.title}
                </p>
                <p style={{ fontSize: 12, color: '#6b7280',
                            lineHeight: 1.6 }}>
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

export default Screenshot;