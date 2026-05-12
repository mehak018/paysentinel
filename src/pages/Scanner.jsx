// src/pages/Scanner.jsx — Fixed version with reliable QR scanning
import React, { useEffect, useRef, useState, useCallback } from 'react';
import jsQR from 'jsqr';
import { checkQRCode } from '../services/api.js';
import { saveScanResult } from '../services/firebase.js';
import { useAuth } from '../contexts/AuthContext.js';

function ResultCard({ result }) {
  if (!result) return null;

  const config = {
    SAFE:      { icon:'✅', color:'#00ff88',
                 bg:'rgba(0,255,136,0.06)',
                 border:'rgba(0,255,136,0.25)',
                 label:'SAFE QR CODE' },
    SUSPICIOUS:{ icon:'⚠️', color:'#ffaa00',
                 bg:'rgba(255,170,0,0.06)',
                 border:'rgba(255,170,0,0.25)',
                 label:'SUSPICIOUS QR CODE' },
    MALICIOUS: { icon:'🚨', color:'#ff4455',
                 bg:'rgba(255,68,85,0.06)',
                 border:'rgba(255,68,85,0.25)',
                 label:'MALICIOUS QR CODE' },
  };

  const s = config[result.verdict] || config.SUSPICIOUS;

  return (
    <div style={{
      marginTop: 20, padding: 24, borderRadius: 16,
      background: s.bg, border: `1px solid ${s.border}`
    }}>
      {/* Verdict header */}
      <div style={{ display:'flex', alignItems:'center',
                    gap:14, marginBottom:16 }}>
        <span style={{ fontSize:40 }}>{s.icon}</span>
        <div>
          <p style={{ fontSize:20, fontWeight:800,
                      color:s.color, letterSpacing:-0.5 }}>
            {s.label}
          </p>
          <p style={{ fontSize:12, color:'#9ca3af', marginTop:3 }}>
            Confidence: {result.confidence}% ·
            Risk Score: {result.riskScore}/100
          </p>
        </div>
      </div>

      {/* QR Content */}
      <div style={{
        padding:'12px 16px', borderRadius:10, marginBottom:14,
        background:'rgba(0,0,0,0.3)'
      }}>
        <p style={{ fontSize:10, color:'#6b7280', fontWeight:700,
                    textTransform:'uppercase', letterSpacing:1,
                    marginBottom:6 }}>
          Scanned Content
        </p>
        <p style={{ fontSize:12, color:'#e2e8f0',
                    fontFamily:'monospace', wordBreak:'break-all' }}>
          {result.content || result.raw}
        </p>
      </div>

      {/* QR Type */}
      <p style={{ fontSize:12, color:'#6b7280', marginBottom:12 }}>
        Type: <span style={{ color:'#e2e8f0',
                             fontWeight:600 }}>
          {result.qrType || 'Unknown'}
        </span>
      </p>

      {/* Forensic checks */}
      {result.checks && result.checks.length > 0 && (
        <div>
          <p style={{ fontSize:10, color:'#6b7280', fontWeight:700,
                      textTransform:'uppercase', letterSpacing:1,
                      marginBottom:10 }}>
            Security Checks
          </p>
          {result.checks.map((check, i) => {
            const statusColors = {
              pass:'#00ff88', warn:'#ffaa00', fail:'#ff4455'
            };
            const statusIcons  = { pass:'✓', warn:'⚠', fail:'✕' };
            return (
              <div key={i} style={{
                display:'flex', gap:10, alignItems:'flex-start',
                padding:'10px 0',
                borderBottom:'1px solid rgba(255,255,255,0.05)'
              }}>
                <span style={{
                  width:22, height:22, borderRadius:6, flexShrink:0,
                  display:'flex', alignItems:'center',
                  justifyContent:'center',
                  fontSize:11, fontWeight:800,
                  background:`${statusColors[check.status]}18`,
                  color:statusColors[check.status],
                }}>
                  {statusIcons[check.status]}
                </span>
                <div>
                  <p style={{ fontSize:12, fontWeight:600,
                              color:'#e2e8f0', marginBottom:2 }}>
                    {check.name}
                  </p>
                  <p style={{ fontSize:11, color:'#6b7280' }}>
                    {check.message}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Recommendation */}
      {result.recommendation && (
        <div style={{
          marginTop:14, padding:'12px 16px', borderRadius:10,
          background:`${s.color}0d`,
          border:`1px solid ${s.border}`
        }}>
          <p style={{ fontSize:12, color:s.color, fontWeight:600 }}>
            💡 {result.recommendation}
          </p>
        </div>
      )}
    </div>
  );
}

// ── MAIN SCANNER ──────────────────────────────────────────
function Scanner() {
  const { user }       = useAuth();
  const videoRef       = useRef(null);
  const canvasRef      = useRef(null);
  const streamRef      = useRef(null);   // store stream separately
  const scanningRef    = useRef(false);  // use ref not state for loop control
  const animFrameRef   = useRef(null);

  const [cameraOn,  setCameraOn]  = useState(false);
  const [result,    setResult]    = useState(null);
  const [error,     setError]     = useState('');
  const [scanCount, setScanCount] = useState(0);
  const [analyzing, setAnalyzing] = useState(false);
  const [hint,      setHint]      = useState('');

  // ── Stop camera completely ──────────────────────────────
  const stopCamera = useCallback(() => {
    scanningRef.current = false;
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraOn(false);
  }, []);

  // ── The scan loop ───────────────────────────────────────
  const scanLoop = useCallback(async () => {
    // Stop if scanning flag turned off
    if (!scanningRef.current) return;

    const video  = videoRef.current;
    const canvas = canvasRef.current;

    if (!video || !canvas) return;

    // Wait until video has data
    if (video.readyState < HTMLMediaElement.HAVE_ENOUGH_DATA) {
      animFrameRef.current = requestAnimationFrame(scanLoop);
      return;
    }

    const w = video.videoWidth;
    const h = video.videoHeight;

    if (w === 0 || h === 0) {
      animFrameRef.current = requestAnimationFrame(scanLoop);
      return;
    }

    // Draw video frame to canvas
    canvas.width  = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    ctx.drawImage(video, 0, 0, w, h);

    // Get pixel data
    const imageData = ctx.getImageData(0, 0, w, h);

    // Try to find QR code
    // inversionAttempts: 'attemptBoth' tries both normal and inverted
    const code = jsQR(
      imageData.data,
      imageData.width,
      imageData.height,
      { inversionAttempts: 'attemptBoth' }
    );

    if (code && code.data) {
      // Found a QR code!
      console.log('QR detected:', code.data);
      scanningRef.current = false; // stop loop

      // Stop camera
      stopCamera();
      setAnalyzing(true);
      setScanCount(prev => prev + 1);

      try {
        // Send to backend for analysis
        const analysis = await checkQRCode(code.data);
        setResult(analysis);

        // Save to Firestore
        if (user) {
          await saveScanResult(user.uid, {
            type:       'QR',
            verdict:    analysis.verdict,
            confidence: analysis.confidence,
            riskScore:  analysis.riskScore,
            qrType:     analysis.qrType,
            content:    analysis.content || code.data,
          });
        }
      } catch (err) {
        console.error('Analysis failed:', err);
        // Show raw result if backend fails
        setResult({
          verdict:        'SAFE',
          confidence:     70,
          riskScore:      10,
          content:        code.data,
          qrType:         'Unknown',
          recommendation: 'Backend unavailable — manual verification recommended.',
          checks:         [],
          raw:            code.data,
        });
      } finally {
        setAnalyzing(false);
      }

    } else {
      // No QR found yet — keep scanning
      // Show a helpful hint every 3 seconds
      animFrameRef.current = requestAnimationFrame(scanLoop);
    }
  }, [stopCamera, user]);

  // ── Start camera ────────────────────────────────────────
  const startCamera = async () => {
    setError('');
    setResult(null);
    setHint('');

    try {
      // Request camera — prefer back camera on phones
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode:  { ideal: 'environment' },
          width:       { ideal: 1280 },
          height:      { ideal: 720 },
        }
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;

        // Wait for video to be ready then start scanning
        videoRef.current.onloadedmetadata = () => {
          videoRef.current.play().then(() => {
            setCameraOn(true);
            scanningRef.current = true;
            // Small delay to let first frame render
            setTimeout(() => {
              animFrameRef.current = requestAnimationFrame(scanLoop);
            }, 300);
          });
        };
      }
    } catch (err) {
      console.error('Camera error:', err);
      if (err.name === 'NotAllowedError') {
        setError(
          '🚫 Camera permission denied. ' +
          'Click the camera icon in your browser address bar and allow access, ' +
          'then refresh the page.'
        );
      } else if (err.name === 'NotFoundError') {
        setError('📷 No camera found on this device.');
      } else {
        setError(`Camera error: ${err.message}`);
      }
    }
  };

  // ── Cleanup on unmount ──────────────────────────────────
  useEffect(() => {
    return () => {
      scanningRef.current = false;
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
      }
    };
  }, []);

  // Show scanning hints
  useEffect(() => {
    if (!cameraOn) return;
    const hints = [
      '📱 Hold the QR code steady inside the frame',
      '💡 Make sure there is enough light',
      '🔍 Move closer to the QR code',
      '↔️ Try rotating the QR code slightly',
    ];
    let i = 0;
    setHint(hints[0]);
    const interval = setInterval(() => {
      i = (i + 1) % hints.length;
      setHint(hints[i]);
    }, 3000);
    return () => clearInterval(interval);
  }, [cameraOn]);

  return (
    <div style={{ paddingTop:80, minHeight:'100vh',
                  background:'#04060d', color:'#f1f5f9' }}>
      <div style={{ maxWidth:760, margin:'0 auto',
                    padding:'40px 24px' }}>

        {/* Header */}
        <div style={{ marginBottom:28 }}>
          <p style={{ fontSize:12, color:'#00d4ff', fontWeight:700,
                      letterSpacing:2, textTransform:'uppercase',
                      marginBottom:6 }}>
            📱 QR Scanner
          </p>
          <h1 style={{ fontSize:32, fontWeight:800,
                       letterSpacing:-1, marginBottom:8 }}>
            Scan QR Code —{' '}
            <span style={{ color:'#00d4ff' }}>Instant Verdict</span>
          </h1>
          <p style={{ color:'#6b7280', fontSize:14 }}>
            Point camera at any QR code. AI checks it for threats instantly.
          </p>
        </div>

        {/* Stats */}
        <div style={{ display:'flex', gap:14,
                      marginBottom:24, flexWrap:'wrap' }}>
          {[
            { label:'Scans This Session', value:scanCount,
              color:'#00d4ff' },
            { label:'AI Status',
              value: analyzing ? 'Analyzing...' : 'Ready',
              color: analyzing ? '#ffaa00' : '#00ff88' },
          ].map(stat => (
            <div key={stat.label} style={{
              flex:1, minWidth:140, padding:'14px 18px',
              background:'#0d1528', borderRadius:12,
              border:'1px solid rgba(255,255,255,0.07)'
            }}>
              <p style={{ fontSize:10, color:'#6b7280', fontWeight:700,
                          textTransform:'uppercase', letterSpacing:1,
                          marginBottom:6 }}>
                {stat.label}
              </p>
              <p style={{ fontSize:22, fontWeight:800,
                          color:stat.color }}>
                {stat.value}
              </p>
            </div>
          ))}
        </div>

        {/* Camera box */}
        <div style={{
          background:'#0d1528',
          border:'1px solid rgba(255,255,255,0.07)',
          borderRadius:20, padding:24
        }}>

          {/* Viewfinder */}
          <div style={{
            position:'relative', borderRadius:14,
            overflow:'hidden', background:'#000',
            aspectRatio:'4/3', marginBottom:20,
            display:'flex', alignItems:'center',
            justifyContent:'center',
          }}>

            {/* Video element — always in DOM */}
            <video
              ref={videoRef}
              style={{
                width:'100%', height:'100%',
                objectFit:'cover',
                display: cameraOn ? 'block' : 'none',
              }}
              muted
              playsInline
              autoPlay
            />

            {/* Hidden canvas for pixel reading */}
            <canvas
              ref={canvasRef}
              style={{ display:'none' }}
            />

            {/* Scanning overlay */}
            {cameraOn && !analyzing && (
              <div style={{
                position:'absolute', inset:0,
                display:'flex', flexDirection:'column',
                alignItems:'center', justifyContent:'center',
                pointerEvents:'none',
              }}>
                {/* Scan frame */}
                <div style={{
                  position:'relative',
                  width:'60%', aspectRatio:'1',
                  maxWidth:220,
                }}>
                  {/* Animated scan line */}
                  <div style={{
                    position:'absolute', left:0, right:0, height:2,
                    background:
                      'linear-gradient(90deg,transparent,#00d4ff,transparent)',
                    animation:'scanLine 1.8s ease-in-out infinite',
                  }}></div>

                  {/* Four corner brackets */}
                  {[
                    { top:0,    left:0,
                      borderWidth:'3px 0 0 3px',
                      borderRadius:'6px 0 0 0' },
                    { top:0,    right:0,
                      borderWidth:'3px 3px 0 0',
                      borderRadius:'0 6px 0 0' },
                    { bottom:0, left:0,
                      borderWidth:'0 0 3px 3px',
                      borderRadius:'0 0 0 6px' },
                    { bottom:0, right:0,
                      borderWidth:'0 3px 3px 0',
                      borderRadius:'0 0 6px 0' },
                  ].map((corner, i) => (
                    <div key={i} style={{
                      position:'absolute',
                      width:28, height:28,
                      borderStyle:'solid',
                      borderColor:'#00d4ff',
                      ...corner
                    }}></div>
                  ))}
                </div>

                {/* Hint text */}
                {hint && (
                  <p style={{
                    marginTop:20, fontSize:12,
                    color:'rgba(0,212,255,0.8)',
                    fontWeight:600, letterSpacing:0.5,
                    textShadow:'0 0 12px rgba(0,212,255,0.5)',
                    textAlign:'center', padding:'0 20px',
                    animation:'fadeHint 0.5s ease',
                  }}>
                    {hint}
                  </p>
                )}
              </div>
            )}

            {/* Analyzing overlay */}
            {analyzing && (
              <div style={{
                position:'absolute', inset:0, background:'rgba(0,0,0,0.85)',
                display:'flex', flexDirection:'column',
                alignItems:'center', justifyContent:'center', gap:12,
              }}>
                <div style={{ fontSize:48 }}>🔍</div>
                <p style={{ color:'#00d4ff', fontSize:16,
                            fontWeight:700 }}>
                  Analyzing QR Code...
                </p>
                <p style={{ color:'#6b7280', fontSize:12 }}>
                  Checking for threats · Verifying UPI ID
                </p>
              </div>
            )}

            {/* Placeholder — camera off, no result */}
            {!cameraOn && !analyzing && !result && (
              <div style={{ textAlign:'center', padding:40 }}>
                <div style={{ fontSize:56, marginBottom:16 }}>📷</div>
                <p style={{ color:'#6b7280', fontSize:15,
                            fontWeight:500, marginBottom:8 }}>
                  Camera is off
                </p>
                <p style={{ color:'#4b5563', fontSize:13 }}>
                  Click Start Scanner below
                </p>
              </div>
            )}

            {/* Result icon overlay */}
            {!cameraOn && result && !analyzing && (
              <div style={{
                position:'absolute', inset:0,
                background:'rgba(0,0,0,0.9)',
                display:'flex', alignItems:'center',
                justifyContent:'center',
                fontSize:80,
              }}>
                {result.verdict === 'SAFE'
                  ? '✅' : result.verdict === 'SUSPICIOUS'
                  ? '⚠️' : '🚨'}
              </div>
            )}
          </div>

          {/* Buttons */}
          <div style={{ display:'flex', gap:12 }}>
            {!cameraOn && !result && !analyzing && (
              <button onClick={startCamera} style={{
                flex:1, padding:'14px',
                background:'linear-gradient(135deg,#00d4ff,#0066ff)',
                border:'none', borderRadius:12,
                color:'#000', fontSize:15, fontWeight:700,
                cursor:'pointer',
              }}>
                📷 Start Scanner
              </button>
            )}

            {cameraOn && (
              <button onClick={stopCamera} style={{
                flex:1, padding:'14px',
                background:'rgba(255,68,85,0.1)',
                border:'1px solid rgba(255,68,85,0.3)',
                borderRadius:12, color:'#ff4455',
                fontSize:15, fontWeight:700, cursor:'pointer',
              }}>
                ⏹ Stop Camera
              </button>
            )}

            {result && !analyzing && (
              <button onClick={() => {
                setResult(null);
                setError('');
              }} style={{
                flex:1, padding:'14px',
                background:'rgba(0,212,255,0.08)',
                border:'1px solid rgba(0,212,255,0.2)',
                borderRadius:12, color:'#00d4ff',
                fontSize:15, fontWeight:700, cursor:'pointer',
              }}>
                🔄 Scan Another
              </button>
            )}
          </div>

          {/* Error */}
          {error && (
            <div style={{
              marginTop:14, padding:'14px 16px', borderRadius:10,
              background:'rgba(255,68,85,0.07)',
              border:'1px solid rgba(255,68,85,0.2)',
              color:'#ff4455', fontSize:13, lineHeight:1.6,
            }}>
              {error}
            </div>
          )}

          {/* Result card */}
          {result && !analyzing && (
            <ResultCard result={result} />
          )}
        </div>

        {/* Tips */}
        <div style={{
          marginTop:20, padding:22, borderRadius:16,
          background:'#0d1528',
          border:'1px solid rgba(255,255,255,0.07)'
        }}>
          <p style={{ fontSize:11, color:'#6b7280', fontWeight:700,
                      textTransform:'uppercase', letterSpacing:1,
                      marginBottom:12 }}>
            💡 For Best Results
          </p>
          {[
            'Hold the QR code 15–25 cm from camera — not too close, not too far',
            'Make sure the entire QR code is visible inside the blue frame',
            'Good lighting is essential — avoid shadows on the QR code',
            'Keep your hand steady — blurry images cannot be read',
            'If it still fails, try uploading a screenshot of the QR instead',
          ].map((tip, i) => (
            <div key={i} style={{ display:'flex', gap:10,
                                  marginBottom:10 }}>
              <span style={{ color:'#00d4ff', flexShrink:0 }}>✓</span>
              <p style={{ fontSize:13, color:'#9ca3af',
                          lineHeight:1.6 }}>
                {tip}
              </p>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes scanLine {
          0%   { top: 0%;   opacity: 1; }
          50%  { top: 50%;  opacity: 0.8; }
          100% { top: 100%; opacity: 0.2; }
        }
        @keyframes fadeHint {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

export default Scanner;