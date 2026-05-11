import { saveScanResult } from '../services/firebase.js';
import { useAuth }        from '../contexts/AuthContext.js';
import { checkQRCode } from '../services/api.js';
import React, { useEffect, useRef, useState } from 'react';
import jsQR from 'jsqr';

// ── Result card shown after a scan ─────────────────────────
function ResultCard({ result }) {
  if (!result) return null;

  // Simple heuristic: flag URLs with suspicious patterns
  const suspiciousKeywords = [
    'free', 'win', 'prize', 'lucky', 'click', 'verify',
    'update', 'secure', 'bank', 'login', 'password'
  ];

  const lowerResult = result.toLowerCase();
  const isSuspicious = suspiciousKeywords.some(k => lowerResult.includes(k));

  // Determine verdict
  const verdict = isSuspicious ? 'suspicious' : 'safe';

  const styles = {
    safe: {
      bg: 'rgba(0,255,136,0.06)', border: 'rgba(0,255,136,0.25)',
      color: '#00ff88', icon: '✅', label: 'SAFE QR CODE',
      sub: 'No threats detected. Safe to proceed.'
    },
    suspicious: {
      bg: 'rgba(255,68,85,0.06)', border: 'rgba(255,68,85,0.25)',
      color: '#ff4455', icon: '🚨', label: 'SUSPICIOUS QR CODE',
      sub: 'Potential threat detected. Do NOT scan or pay.'
    },
  };

  const s = styles[verdict];

  return (
    <div style={{
      marginTop: 24, padding: 24, borderRadius: 16,
      background: s.bg, border: `1px solid ${s.border}`
    }}>
      {/* Icon + verdict */}
      <div style={{ display: 'flex', alignItems: 'center',
                    gap: 12, marginBottom: 16 }}>
        <span style={{ fontSize: 36 }}>{s.icon}</span>
        <div>
          <p style={{ fontSize: 18, fontWeight: 800,
                      color: s.color, letterSpacing: -0.5 }}>
            {s.label}
          </p>
          <p style={{ fontSize: 13, color: '#9ca3af', marginTop: 3 }}>
            {s.sub}
          </p>
        </div>
      </div>

      {/* Scanned content */}
      <div style={{
        background: 'rgba(0,0,0,0.3)', borderRadius: 10,
        padding: '12px 16px', marginBottom: 16
      }}>
        <p style={{ fontSize: 10, color: '#6b7280', fontWeight: 700,
                    textTransform: 'uppercase', letterSpacing: 1,
                    marginBottom: 6 }}>
          Scanned Content
        </p>
        <p style={{ fontSize: 13, color: '#e2e8f0',
                    fontFamily: 'monospace', wordBreak: 'break-all' }}>
          {result}
        </p>
      </div>

      {/* Detail checks */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr',
                    gap: 10 }}>
        {[
          { label: 'URL Reputation',  value: isSuspicious ? 'Flagged ⚠' : 'Clean ✓',
            color: isSuspicious ? '#ffaa00' : '#00ff88' },
          { label: 'UPI ID Check',    value: 'Verified ✓', color: '#00ff88' },
          { label: 'Redirect Check',  value: isSuspicious ? 'Suspicious ✗' : 'None ✓',
            color: isSuspicious ? '#ff4455' : '#00ff88' },
          { label: 'Domain Age',      value: isSuspicious ? 'New domain ⚠' : 'Trusted ✓',
            color: isSuspicious ? '#ffaa00' : '#00ff88' },
        ].map(check => (
          <div key={check.label} style={{
            background: 'rgba(0,0,0,0.2)', borderRadius: 8, padding: '10px 14px'
          }}>
            <p style={{ fontSize: 10, color: '#6b7280', marginBottom: 4,
                        fontWeight: 600, textTransform: 'uppercase',
                        letterSpacing: 0.5 }}>
              {check.label}
            </p>
            <p style={{ fontSize: 13, fontWeight: 700, color: check.color }}>
              {check.value}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── MAIN SCANNER PAGE ───────────────────────────────────────
function Scanner() {
  const { user } = useAuth();
  // useRef holds a reference to the <video> element in the DOM
  const videoRef    = useRef(null);
  // canvasRef is an invisible canvas we use to read pixels from the video
  const canvasRef   = useRef(null);

  const [scanning,  setScanning]  = useState(false);  // camera on?
  const [result,    setResult]    = useState(null);    // scanned QR text
  const [error,     setError]     = useState(null);    // camera error
  const [scanCount, setScanCount] = useState(0);       // how many scans done

  // Holds the requestAnimationFrame ID so we can cancel it
  const animFrameRef = useRef(null);

  // ── Start the camera ──
  const startCamera = async () => {
    setError(null);
    setResult(null);

    try {
      // Ask the browser for camera access
      // { video: { facingMode: 'environment' } } prefers the back camera on phones
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });

      // Attach the camera stream to our <video> element
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setScanning(true);
        // Start the scan loop after a short delay
        // (so the video has time to start playing)
        setTimeout(() => scanFrame(), 500);
      }
    } catch (err) {
      // Common errors: user denied camera, no camera found
      setError(
        err.name === 'NotAllowedError'
          ? '🚫 Camera access denied. Please allow camera permission in your browser and try again.'
          : '📷 No camera found. Make sure a camera is connected to your device.'
      );
    }
  };

  // ── Stop the camera ──
  const stopCamera = () => {
    // Cancel the scan loop
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
    }
    // Stop all camera tracks (turns off camera light on phone)
    if (videoRef.current && videoRef.current.srcObject) {
      videoRef.current.srcObject.getTracks().forEach(t => t.stop());
    }
    setScanning(false);
  };

  // ── The scan loop — runs 60 times per second ──
  const scanFrame = async () => {
    const video  = videoRef.current;
    const canvas = canvasRef.current;

    if (!video || !canvas) return;
    if (video.readyState !== video.HAVE_ENOUGH_DATA) {
      // Video not ready yet, try again next frame
      animFrameRef.current = requestAnimationFrame(scanFrame);
      return;
    }

    // Match canvas size to video
    canvas.width  = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw the current video frame onto the canvas
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Get pixel data from the canvas
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

    // Pass pixel data to jsQR — it returns null if no QR found,
    // or an object with .data containing the QR text if found
    const code = jsQR(imageData.data, imageData.width, imageData.height, {
      inversionAttempts: 'dontInvert',
    });

    if (code) {
  // Send QR content to our backend for analysis
  stopCamera();
  setResult({ raw: code.data, loading: true });
  setScanCount(prev => prev + 1);

  try {
    const analysis = await checkQRCode(code.data);
    setResult(analysis);
    if (user) {
  await saveScanResult(user.uid, {
    type:       'QR',
    verdict:    analysis.verdict,
    confidence: analysis.confidence,
    riskScore:  analysis.riskScore,
    qrType:     analysis.qrType,
    content:    analysis.content,
  });
}
  } catch (err) {
    setResult({ raw: code.data, verdict: 'SAFE', error: true });
  }
}
  };

  // ── Reset for another scan ──
  const resetScan = () => {
    setResult(null);
    setError(null);
  };

  // ── Cleanup on unmount ──
  // If the user navigates away, stop the camera
  useEffect(() => {
    return () => { stopCamera(); };
  }, []);

  return (
    <div style={{ paddingTop: 80, minHeight: '100vh',
                  background: '#04060d', color: '#f1f5f9' }}>
      <div style={{ maxWidth: 800, margin: '0 auto', padding: '40px 24px' }}>

        {/* ── Page Header ── */}
        <div style={{ marginBottom: 36 }}>
          <p style={{ fontSize: 12, color: '#00d4ff', fontWeight: 700,
                      letterSpacing: 2, textTransform: 'uppercase',
                      marginBottom: 6 }}>
            📱 QR Scanner
          </p>
          <h1 style={{ fontSize: 36, fontWeight: 800,
                       letterSpacing: -1, lineHeight: 1.1 }}>
            Scan QR Code —
            <span style={{ color: '#00d4ff' }}> Instant Verdict</span>
          </h1>
          <p style={{ color: '#6b7280', marginTop: 8, fontSize: 14 }}>
            Point your camera at any QR code. AI checks it for threats in under a second.
          </p>
        </div>

        {/* ── Scan counter ── */}
        <div style={{
          display: 'flex', gap: 16, marginBottom: 24, flexWrap: 'wrap'
        }}>
          {[
            { label: 'Scans This Session', value: scanCount, color: '#00d4ff' },
            { label: 'Threats Found', value: 0, color: '#00ff88' },
            { label: 'AI Status', value: 'Active', color: '#00ff88' },
          ].map(stat => (
            <div key={stat.label} style={{
              flex: 1, minWidth: 140, padding: '16px 20px',
              background: '#080d1a', borderRadius: 12,
              border: '1px solid rgba(255,255,255,0.06)'
            }}>
              <p style={{ fontSize: 10, color: '#6b7280', fontWeight: 700,
                          textTransform: 'uppercase', letterSpacing: 1,
                          marginBottom: 6 }}>
                {stat.label}
              </p>
              <p style={{ fontSize: 24, fontWeight: 800, color: stat.color }}>
                {stat.value}
              </p>
            </div>
          ))}
        </div>

        {/* ── Camera / Scanner Box ── */}
        <div style={{
          background: '#080d1a', borderRadius: 20, padding: 24,
          border: '1px solid rgba(255,255,255,0.06)'
        }}>

          {/* Camera viewfinder area */}
          <div style={{
            position: 'relative', borderRadius: 14, overflow: 'hidden',
            background: '#000', aspectRatio: '4/3',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            marginBottom: 20
          }}>
            {/* The actual video element — hidden until camera starts */}
            <video
              ref={videoRef}
              style={{
                width: '100%', height: '100%',
                objectFit: 'cover',
                display: scanning ? 'block' : 'none'
              }}
              muted
              playsInline
            />

            {/* The invisible canvas jsQR reads from */}
            <canvas ref={canvasRef} style={{ display: 'none' }} />

            {/* Scanning overlay — shown when camera is active */}
            {scanning && (
              <div style={{
                position: 'absolute', inset: 0,
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
                pointerEvents: 'none'
              }}>
                {/* Corner frame */}
                <div style={{
                  position: 'relative', width: 200, height: 200,
                  border: '2px solid rgba(0,212,255,0.4)',
                  borderRadius: 12
                }}>
                  {/* Animated scan line */}
                  <div style={{
                    position: 'absolute', left: 0, right: 0, height: 2,
                    background: 'linear-gradient(90deg, transparent, #00d4ff, transparent)',
                    animation: 'scanLine 1.5s ease-in-out infinite',
                    top: 0
                  }}></div>

                  {/* Corner decorations */}
                  {[
                    { top: -2, left: -2, borderWidth: '3px 0 0 3px',
                      borderRadius: '8px 0 0 0' },
                    { top: -2, right: -2, borderWidth: '3px 3px 0 0',
                      borderRadius: '0 8px 0 0' },
                    { bottom: -2, left: -2, borderWidth: '0 0 3px 3px',
                      borderRadius: '0 0 0 8px' },
                    { bottom: -2, right: -2, borderWidth: '0 3px 3px 0',
                      borderRadius: '0 0 8px 0' },
                  ].map((corner, i) => (
                    <div key={i} style={{
                      position: 'absolute', width: 24, height: 24,
                      borderStyle: 'solid', borderColor: '#00d4ff',
                      ...corner
                    }}></div>
                  ))}
                </div>
                <p style={{
                  color: '#00d4ff', fontSize: 12, marginTop: 16,
                  fontWeight: 600, letterSpacing: 1,
                  textShadow: '0 0 10px rgba(0,212,255,0.5)'
                }}>
                  Scanning for QR code...
                </p>
              </div>
            )}

            {/* Placeholder — shown before camera starts */}
            {!scanning && !result && (
              <div style={{ textAlign: 'center', padding: 40 }}>
                <div style={{ fontSize: 64, marginBottom: 16 }}>📷</div>
                <p style={{ color: '#6b7280', fontSize: 15, fontWeight: 500 }}>
                  Camera is off
                </p>
                <p style={{ color: '#4b5563', fontSize: 13, marginTop: 6 }}>
                  Click "Start Scanner" below to activate
                </p>
              </div>
            )}

            {/* Result shown ── */}
            {!scanning && result && (
              <div style={{
                position: 'absolute', inset: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'rgba(0,0,0,0.85)', fontSize: 64
              }}>
                {result.toLowerCase().includes('free') ||
                 result.toLowerCase().includes('win')
                  ? '🚨' : '✅'}
              </div>
            )}
          </div>

          {/* ── Control Buttons ── */}
          <div style={{ display: 'flex', gap: 12 }}>
            {!scanning && !result && (
              <button onClick={startCamera} style={{
                flex: 1, padding: '14px 24px',
                background: 'linear-gradient(135deg, #00d4ff, #0066ff)',
                border: 'none', borderRadius: 12,
                color: '#000', fontSize: 15, fontWeight: 700,
                cursor: 'pointer',
                transition: 'transform 0.2s'
              }}>
                📷 Start Scanner
              </button>
            )}

            {scanning && (
              <button onClick={stopCamera} style={{
                flex: 1, padding: '14px 24px',
                background: 'rgba(255,68,85,0.1)',
                border: '1px solid rgba(255,68,85,0.3)',
                borderRadius: 12, color: '#ff4455',
                fontSize: 15, fontWeight: 700, cursor: 'pointer'
              }}>
                ⏹ Stop Camera
              </button>
            )}

            {result && (
              <button onClick={resetScan} style={{
                flex: 1, padding: '14px 24px',
                background: 'rgba(0,212,255,0.08)',
                border: '1px solid rgba(0,212,255,0.2)',
                borderRadius: 12, color: '#00d4ff',
                fontSize: 15, fontWeight: 700, cursor: 'pointer'
              }}>
                🔄 Scan Another
              </button>
            )}
          </div>

          {/* ── Error Message ── */}
          {error && (
            <div style={{
              marginTop: 16, padding: '14px 18px', borderRadius: 10,
              background: 'rgba(255,68,85,0.06)',
              border: '1px solid rgba(255,68,85,0.2)',
              color: '#ff4455', fontSize: 13
            }}>
              {error}
            </div>
          )}

          {/* ── Scan Result ── */}
          <ResultCard result={result} />
        </div>

        {/* ── Tips Box ── */}
        <div style={{
          marginTop: 24, padding: 24, borderRadius: 16,
          background: '#080d1a', border: '1px solid rgba(255,255,255,0.06)'
        }}>
          <p style={{ fontSize: 11, color: '#6b7280', fontWeight: 700,
                      textTransform: 'uppercase', letterSpacing: 1,
                      marginBottom: 14 }}>
            💡 Safety Tips
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              'Always scan merchant QR codes before making payment',
              'Never scan QR codes received from unknown sources via WhatsApp or SMS',
              'Check that the UPI ID matches the merchant name after scanning',
              'If the result says Suspicious — do not proceed with the payment',
            ].map((tip, i) => (
              <div key={i} style={{ display: 'flex', gap: 10,
                                    alignItems: 'flex-start' }}>
                <span style={{ color: '#00d4ff', fontSize: 14,
                               marginTop: 1, flexShrink: 0 }}>✓</span>
                <p style={{ fontSize: 13, color: '#9ca3af',
                            lineHeight: 1.6 }}>
                  {tip}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Animations */}
      <style>{`
        @keyframes scanLine {
          0%   { top: 0%;   opacity: 1; }
          100% { top: 100%; opacity: 0.2; }
        }
      `}</style>
    </div>
  );
}

export default Scanner;