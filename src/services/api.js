// src/services/api.js
import axios from 'axios';

// In development: uses http://localhost:5000
// In production:  uses https://paysentinel-backend.onrender.com
// React automatically picks the right .env file
const BASE_URL = process.env.REACT_APP_API_URL + '/api';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// ── UTR Verification ──────────────────────────────────────
export const verifyUTR = async (utrNumber, paymentMethod, expectedAmount) => {
  const response = await api.post('/utr/verify', {
    utrNumber,
    paymentMethod,
    expectedAmount: Number(expectedAmount),
  });
  return response.data;
};

// ── Screenshot Analysis ───────────────────────────────────
export const analyzeScreenshot = async (file, paymentApp, expectedAmount) => {
  const formData = new FormData();
  formData.append('screenshot',     file);
  formData.append('paymentApp',     paymentApp     || '');
  formData.append('expectedAmount', expectedAmount || '');

  const response = await api.post('/screenshot/analyze', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

// ── QR Code Check ─────────────────────────────────────────
export const checkQRCode = async (qrContent) => {
  const response = await api.post('/qr/check', { qrContent });
  return response.data;
};

// ── Health Check ──────────────────────────────────────────
export const checkHealth = async () => {
  const response = await api.get('/health');
  return response.data;
};

export default api;