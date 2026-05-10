// src/services/firebase.js
// This file connects your React app to your Firebase project

import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';

// ── YOUR Firebase config ──────────────────────────────────
// Replace these values with YOUR project's values from
// Firebase Console → Project Settings → Your apps → SDK setup
const firebaseConfig = {
  apiKey: "AIzaSyCcrl4ioCyodKOnQcCn9GsMgdVRTgPkfyA",
  authDomain: "paysentinel-1adac.firebaseapp.com",
  projectId: "paysentinel-1adac",
  storageBucket: "paysentinel-1adac.firebasestorage.app",
  messagingSenderId: "14082305511",
  appId: "1:14082305511:web:7d69e0726c45e1d9dc2142"
};

// Initialize Firebase — this starts the connection
const app  = initializeApp(firebaseConfig);

// Get the Auth service from Firebase
export const auth = getAuth(app);

// Google provider — used for "Sign in with Google" button
export const googleProvider = new GoogleAuthProvider();

// ── Auth helper functions ─────────────────────────────────
// These wrap Firebase functions so our pages can call them simply

// Create a new account with email + password
export const signUp = (email, password) =>
  createUserWithEmailAndPassword(auth, email, password);

// Log in with email + password
export const logIn = (email, password) =>
  signInWithEmailAndPassword(auth, email, password);

// Log in with Google (opens a popup)
export const logInWithGoogle = () =>
  signInWithPopup(auth, googleProvider);

// Log out the current user
export const logOut = () => signOut(auth);

// Listen for auth state changes (called whenever user logs in/out)
// We use this in our AuthContext to know who is logged in
export { onAuthStateChanged };