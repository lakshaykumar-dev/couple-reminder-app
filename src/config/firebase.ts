import { initializeApp, getApps, getApp } from 'firebase/app';
import { initializeFirestore } from 'firebase/firestore';

// Firebase configuration from lakshaykumar-dev/lens-of-lakshay
export const firebaseConfig = {
  apiKey: "AIzaSyAtIEXQOp3bvTk-zpLw533kI4NjaAJE3TY",
  authDomain: "lens-of-lakshay.firebaseapp.com",
  projectId: "lens-of-lakshay",
  storageBucket: "lens-of-lakshay.firebasestorage.app",
  messagingSenderId: "957500636729",
  appId: "1:957500636729:web:03ad440a7b19dc17d117e8",
  measurementId: "G-39YPLMQMD1"
};

// Initialize Firebase App singleton
export const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize Firestore with long-polling to ensure stable real-time connections on Android
export const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
});
