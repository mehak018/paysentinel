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
// ── Firestore: Save a scan result ────────────────────────
export const saveScanResult = async (userId, scanData) => {
  try {
    console.log('Saving scan to Firestore...', { userId, scanData });
    const docRef = await addDoc(collection(db, 'scans'), {
      userId,
      ...scanData,
      createdAt: serverTimestamp()
    });
    console.log('✅ Scan saved successfully! Doc ID:', docRef.id);
  } catch (error) {
    console.error('❌ Failed to save scan:', error.message);
  }
};

// ── Firestore: Get a user's scan history ─────────────────
// ── Firestore: Get a user's scan history ─────────────────
export const getScanHistory = async (userId, maxResults = 20) => {
  try {
    // Simpler query — no composite index needed
    const q = query(
      collection(db, 'scans'),
      where('userId', '==', userId),
      limit(maxResults)
    );
    const snapshot = await getDocs(q);

    // Sort by date on the client side instead
    const results = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate?.()?.toLocaleString()
                 || 'Just now'
    }));

    // Sort newest first on frontend
    results.sort((a, b) => {
      const dateA = new Date(a.createdAt);
      const dateB = new Date(b.createdAt);
      return dateB - dateA;
    });

    return results;
  } catch (error) {
    console.error('Failed to fetch history:', error.message);
    return [];
  }
};