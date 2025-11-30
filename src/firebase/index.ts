'use client';

import { firebaseConfig } from '@/firebase/config';
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getStorage, connectStorageEmulator } from 'firebase/storage';

// This flag ensures we only attempt to connect to emulators once.
let emulatorsConnected = false;

// IMPORTANT: DO NOT MODIFY THIS FUNCTION
export function initializeFirebase() {
  const isInitialized = getApps().length > 0;
  const app = isInitialized ? getApp() : initializeApp(firebaseConfig);
  return getSdks(app);
}

export function getSdks(firebaseApp: FirebaseApp) {
  const firestore = getFirestore(firebaseApp);
  const auth = getAuth(firebaseApp);
  const storage = getStorage(firebaseApp);

  if (process.env.NODE_ENV === 'development' && !emulatorsConnected) {
    try {
      // Connect to the running emulators
      connectFirestoreEmulator(firestore, '127.0.0.1', 8080);
      connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true });
      connectStorageEmulator(storage, '127.0.0.1', 9199);
      console.log("CLIENT SDK: Connected to Firebase emulators.");
      emulatorsConnected = true; // Set the flag to true after successful connection
    } catch (e: any) {
      // It's okay if it fails, means emulators aren't running.
      // We only log a warning if it's not the expected 'failed-precondition' error.
       if (e.code !== 'failed-precondition') {
         console.warn("CLIENT SDK: Could not connect to Firebase emulators. This is expected if they are not running.", e);
       }
    }
  }

  return {
    firebaseApp,
    auth,
    firestore,
    storage, // Export storage instance
  };
}


export * from './provider';
export * from './client-provider';
export * from './firestore/use-collection';
export * from './firestore/use-doc';
export * from './non-blocking-updates';
export * from './non-blocking-login';
export * from './errors';
export * from './error-emitter';
