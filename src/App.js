// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Navbar         from './components/Navbar.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import History from './pages/History.jsx';

import Home       from './pages/Homes.jsx';
import Dashboard  from './pages/Dashboard.jsx';
import Scanner    from './pages/Scanner.jsx';
import Login      from './pages/Login.jsx';
import Signup     from './pages/Signup.jsx';
import VerifyUTR  from './pages/VerifyUTR.jsx';
import Screenshot from './pages/Screenshot.jsx';

function App() {
  return (
    <Router>
      <div style={{ minHeight: '100vh',
                    background: '#04060d', color: 'white' }}>
        <Navbar />
        <Routes>
         <Route path="/history" element={
        <ProtectedRoute><History /></ProtectedRoute>
}/>
          {/* Public */}
          <Route path="/"       element={<Home />}   />
          <Route path="/login"  element={<Login />}  />
          <Route path="/signup" element={<Signup />} />

          {/* Protected — must be logged in */}
          <Route path="/dashboard" element={
            <ProtectedRoute><Dashboard /></ProtectedRoute>
          }/>
          <Route path="/scanner" element={
            <ProtectedRoute><Scanner /></ProtectedRoute>
          }/>
          <Route path="/verify-utr" element={
            <ProtectedRoute><VerifyUTR /></ProtectedRoute>
          }/>
          <Route path="/screenshot" element={
            <ProtectedRoute><Screenshot /></ProtectedRoute>
          }/>
        </Routes>
      </div>
    </Router>
  );
}

export default App;