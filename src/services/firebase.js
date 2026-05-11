// src/services/firebase.js
import { initializeApp }      from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
import {
  getFirestore,       // ← NEW: Firestore database
  collection,
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
} from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCcrl4ioCyodKOnQcCn9GsMgdVRTgPkfyA",
  authDomain: "paysentinel-1adac.firebaseapp.com",
  projectId: "paysentinel-1adac",
  storageBucket: "paysentinel-1adac.firebasestorage.app",
  messagingSenderId: "14082305511",
  appId: "1:14082305511:web:7d69e0726c45e1d9dc2142"
};

const app = initializeApp(firebaseConfig);

export const auth          = getAuth(app);
export const db            = getFirestore(app);  // ← NEW
export const googleProvider = new GoogleAuthProvider();

// ── Auth functions ────────────────────────────────────────
export const signUp          = (email, password) =>
  createUserWithEmailAndPassword(auth, email, password);
export const logIn           = (email, password) =>
  signInWithEmailAndPassword(auth, email, password);
export const logInWithGoogle = () =>
  signInWithPopup(auth, googleProvider);
export const logOut          = () => signOut(auth);
export { onAuthStateChanged };

// ── Firestore: Save a scan result ────────────────────────
// Called after every UTR, QR, or Screenshot analysis
export const saveScanResult = async (userId, scanData) => {
  try {
    await addDoc(collection(db, 'scans'), {
      userId,                      // which user did this scan
      ...scanData,                 // all scan result fields
      createdAt: serverTimestamp() // Firestore server time
    });
  } catch (error) {
    // Don't crash the app if saving fails — just log it
    console.error('Failed to save scan:', error);
  }
};

// ── Firestore: Get a user's scan history ─────────────────
export const getScanHistory = async (userId, maxResults = 20) => {
  try {
    const q = query(
      collection(db, 'scans'),
      where('userId', '==', userId),   // only this user's scans
      orderBy('createdAt', 'desc'),     // newest first
      limit(maxResults)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      // Convert Firestore timestamp to readable string
      createdAt: doc.data().createdAt?.toDate?.()?.toLocaleString() || 'Just now'
    }));
  } catch (error) {
    console.error('Failed to fetch history:', error);
    return [];
  }
};