// src/pages/Screenshot.jsx
import { saveScanResult } from '../services/firebase.js';
import { useAuth }        from '../contexts/AuthContext.js';
import React, { useState, useRef, useCallback } from 'react';
import { analyzeScreenshot } from '../services/api.js';
import VerdictCard from '../components/VerdictCard.jsx';

function Screenshot() {
  const { user } = useAuth();
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
      if (user) {
  await saveScanResult(user.uid, {
    type:       'SCREENSHOT',
    verdict:    data.verdict,
    confidence: data.confidence,
    riskScore:  data.riskScore,
    paymentApp: paymentApp,
    fileName:   file.name,
  });
}
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
              <label style={{ ...labelStyle }}>
                   Expected Amount (₹) — <span style={{ color:'#00d4ff' }}>
                   Recommended for best accuracy
                   </span>
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
         <p style={{ fontSize: 12, color: '#6b7280',
              textAlign: 'center', marginTop: 10 }}>
            💡 Enter the expected amount above for automatic amount cross-verification
        </p>

        {/* ── Loading State ── */}
        // Replace your loading state with this better version:
{loading && (
  <div style={{
    padding: 32, borderRadius: 20, textAlign: 'center',
    background: '#0d1528',
    border: '1px solid rgba(255,255,255,0.07)',
    marginBottom: 24,
  }}>
    <div style={{ fontSize: 40, marginBottom: 16 }}>🔬</div>
    <p style={{ color: '#00d4ff', fontWeight: 700,
                fontSize: 17, marginBottom: 16 }}>
      Running Forensic Analysis...
    </p>
    <div style={{ display: 'flex', flexDirection: 'column',
                  gap: 8, textAlign: 'left',
                  maxWidth: 320, margin: '0 auto' }}>
      {[
        { icon: '📏', text: 'Checking image dimensions' },
        { icon: '📋', text: 'Reading EXIF metadata' },
        { icon: '🎨', text: 'Analyzing color space' },
        { icon: '📁', text: 'Validating file properties' },
        { icon: '⚖️', text: 'Checking file size rules' },
        { icon: '🤖', text: 'Calculating fraud risk score' },
      ].map((step, i) => (
        <div key={i} style={{
          display: 'flex', gap: 10, alignItems: 'center',
          padding: '8px 12px', borderRadius: 8,
          background: 'rgba(0,212,255,0.05)',
          border: '1px solid rgba(0,212,255,0.1)',
          animation: `fadeIn 0.4s ease ${i * 0.2}s both`,
        }}>
          <span style={{ fontSize: 16 }}>{step.icon}</span>
          <p style={{ fontSize: 13, color: '#9ca3af' }}>{step.text}</p>
        </div>
      ))}
    </div>
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

       {/* ── What We Check — Updated ── */}
{!result && !loading && (
  <div style={{ marginTop: 8 }}>
    {/* Real checks explanation */}
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
      gap: 14,
    }}>
      {[
        {
          icon: '📏',
          title: 'Dimension Analysis',
          desc: 'Checks if image dimensions match real mobile device screenshots. Desktop-sized images for mobile apps are flagged.',
          badge: 'Real Check',
          badgeColor: '#00ff88',
        },
        {
          icon: '📋',
          title: 'EXIF Metadata',
          desc: 'Reads hidden metadata inside the image file. Detects Photoshop, GIMP, PicsArt, Canva and other editing tools.',
          badge: 'Real Check',
          badgeColor: '#00ff88',
        },
        {
          icon: '📁',
          title: 'Filename Analysis',
          desc: 'Checks filename for words like "edited", "fake", "copy", "modified" or references to editing apps.',
          badge: 'Real Check',
          badgeColor: '#00ff88',
        },
        {
          icon: '⚖️',
          title: 'File Size Rules',
          desc: 'Genuine payment screenshots are 100KB–3MB. Files smaller than 50KB are almost always re-screenshots of fakes.',
          badge: 'Real Check',
          badgeColor: '#00ff88',
        },
        {
          icon: '🎨',
          title: 'Color Space Check',
          desc: 'Phone screenshots use sRGB color space. CMYK color space is only used in print design — never in real screenshots.',
          badge: 'Real Check',
          badgeColor: '#00ff88',
        },
        {
          icon: '🔗',
          title: 'Extension vs Content',
          desc: 'Verifies the file extension matches the actual content. A renamed file (e.g. .pdf renamed to .png) is flagged.',
          badge: 'Real Check',
          badgeColor: '#00ff88',
        },
      ].map(item => (
        <div key={item.title} style={{
          padding: '20px 22px', borderRadius: 14,
          background: '#0d1528',
          border: '1px solid rgba(255,255,255,0.06)',
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-start',
                        justifyContent: 'space-between', marginBottom: 10 }}>
            <span style={{ fontSize: 26 }}>{item.icon}</span>
            <span style={{
              fontSize: 10, fontWeight: 700, padding: '2px 8px',
              borderRadius: 6,
              background: `${item.badgeColor}15`,
              color: item.badgeColor,
              border: `1px solid ${item.badgeColor}30`,
            }}>
              {item.badge}
            </span>
          </div>
          <p style={{ fontSize: 13, fontWeight: 700,
                      color: '#e2e8f0', marginBottom: 6 }}>
            {item.title}
          </p>
          <p style={{ fontSize: 12, color: '#6b7280', lineHeight: 1.6 }}>
            {item.desc}
          </p>
        </div>
      ))}
    </div>

    {/* Limitation notice */}
    <div style={{
      marginTop: 16, padding: '16px 20px', borderRadius: 12,
      background: 'rgba(255,170,0,0.05)',
      border: '1px solid rgba(255,170,0,0.15)',
    }}>
      <p style={{ fontSize: 12, color: '#ffaa00',
                  fontWeight: 700, marginBottom: 6 }}>
        ⚠️ Important Limitation
      </p>
      <p style={{ fontSize: 12, color: '#9ca3af', lineHeight: 1.6 }}>
        Screenshot analysis detects <strong style={{ color: '#e2e8f0' }}>
        technical forgery</strong> (editing software, wrong dimensions, 
        tampered metadata). It cannot verify the <strong style={{ color: '#e2e8f0' }}>
        actual transaction</strong> — always cross-check using the 
        UTR Verification tool and confirm with your bank portal.
      </p>
    </div>
  </div>
)}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
    </div>
  );}

export default Screenshot;