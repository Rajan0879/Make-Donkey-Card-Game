import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyBm-8UyKYKcenjvJk76s1G4Yyw0ZwAucZI",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "make-donkey.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "make-donkey",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "make-donkey.firebasestorage.app",
  messagingSenderId: "476646419648",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:476646419648:web:1531498e95323e10065125"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];
export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;
