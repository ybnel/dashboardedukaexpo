import { initializeApp } from 'firebase/app';
import { initializeFirestore } from 'firebase/firestore';

// Firebase configuration using environment variables with safe fallback defaults
const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'dummy-api-key',
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'dummy-auth-domain.firebaseapp.com',
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'dummy-project-id',
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'dummy-storage-bucket.appspot.com',
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '1234567890',
    appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:1234567890:web:abcdef'
};

const app = initializeApp(firebaseConfig);

// Force Firestore to use HTTP Long Polling instead of WebSockets.
// This resolves issues where corporate/educational firewalls block WebSocket connections.
export const db = initializeFirestore(app, {
    experimentalForceLongPolling: true
});

console.log("Firebase initialized successfully with Project ID:", firebaseConfig.projectId);
