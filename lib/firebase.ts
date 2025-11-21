import { initializeApp, getApps, FirebaseApp } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";

// Firebase configuration from environment variables
const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Check if we're in demo mode (missing Firebase config)
const isDemoMode = !firebaseConfig.apiKey || firebaseConfig.apiKey === "demo";

let app: FirebaseApp;
let auth: Auth;
let db: Firestore;

if (isDemoMode) {
    console.warn("⚠️ Running in DEMO MODE - Firebase not configured. Using mock data.");
    // Create placeholder objects for demo mode
    app = {} as FirebaseApp;
    auth = {} as Auth;
    db = {} as Firestore;
} else {
    // Initialize Firebase only if not already initialized
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
    auth = getAuth(app);
    db = getFirestore(app);
}

export { app, auth, db, isDemoMode };
