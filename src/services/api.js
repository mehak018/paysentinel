// src/services/api.js
// ─────────────────────────────────────────────────────────────
// All API calls to our backend go through this file.
// This keeps backend URLs in one place — easy to change later.
// ─────────────────────────────────────────────────────────────

import axios from 'axios';

// Base URL of our backend server
const BASE_URL = 'http://localhost:5000/api';

// Create an axios instance with default settings
const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000, // 15 second timeout
  headers: { 'Content-Type': 'application/json' },
});

// ── UTR Verification ─────────────────────────────────────────
export const verifyUTR = async (utrNumber, paymentMethod, expectedAmount) => {
  const response = await api.post('/utr/verify', {
    utrNumber,
    paymentMethod,
    expectedAmount: Number(expectedAmount),
  });
  return response.data;
};

// ── Screenshot Analysis ──────────────────────────────────────
export const analyzeScreenshot = async (file, paymentApp, expectedAmount) => {
  // Files need FormData — not regular JSON
  const formData = new FormData();
  formData.append('screenshot',     file);
  formData.append('paymentApp',     paymentApp     || '');
  formData.append('expectedAmount', expectedAmount || '');

  const response = await api.post('/screenshot/analyze', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

// ── QR Code Check ────────────────────────────────────────────
export const checkQRCode = async (qrContent) => {
  const response = await api.post('/qr/check', { qrContent });
  return response.data;
};

// ── Health Check ─────────────────────────────────────────────
export const checkHealth = async () => {
  const response = await api.get('/health');
  return response.data;
};

export default api;