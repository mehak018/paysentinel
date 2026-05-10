// src/context/AuthContext.js
// This file creates a global "shelf" that stores who is logged in.
// Any component in the app can read from this shelf.

import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, onAuthStateChanged, logOut } from '../services/firebase';

// Step 1: Create the shelf (empty context)
const AuthContext = createContext();

// Step 2: Create a custom hook so any component can easily
// grab the auth data: const { user } = useAuth();
export const useAuth = () => useContext(AuthContext);

// Step 3: The Provider wraps our entire app and puts user
// data onto the shelf so everyone can access it
export function AuthProvider({ children }) {
  // 'user' holds the logged-in user object, or null if logged out
  const [user,    setUser]    = useState(null);
  // 'loading' is true while Firebase checks if user is logged in
  // (this prevents a flash of the login page on refresh)
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // onAuthStateChanged fires every time the login state changes:
    // - When the app first loads (checks if user was already logged in)
    // - When user logs in
    // - When user logs out
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);   // null if logged out, user object if logged in
      setLoading(false);       // done checking
    });

    // Cleanup: stop listening when the component unmounts
    return () => unsubscribe();
  }, []);

  // The value we put on the shelf — available to every component
  const value = {
    user,       // the logged-in user (or null)
    loading,    // still checking auth state?
    logOut,     // function to log out
  };

  return (
    <AuthContext.Provider value={value}>
      {/* Don't render children until we know auth state */}
      {/* This prevents flickering between login/home */}
      {!loading && children}
    </AuthContext.Provider>
  );
}