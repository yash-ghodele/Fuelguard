import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Check if Firebase config is valid (not demo/placeholder)
const isValidConfig = firebaseConfig.apiKey &&
    !firebaseConfig.apiKey.includes('demo') &&
    firebaseConfig.projectId &&
    !firebaseConfig.projectId.includes('demo');

// Initialize Firebase only if config is valid
let app;
let auth;
let db;

if (isValidConfig) {
    try {
        app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
        auth = getAuth(app);
        db = getFirestore(app);
    } catch (error) {
        console.warn('Firebase initialization failed:', error);
        console.warn('Running in mock data mode');
    }
}

export { app, auth, db };
export default app;
