// src/index.js
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { AuthProvider } from './contexts/AuthContext.js';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    {/* AuthProvider wraps everything — now every page knows
        who is logged in without passing props manually */}
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>
);