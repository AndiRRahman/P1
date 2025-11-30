'use client';

import { firebaseConfig } from '@/firebase/config';
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getStorage, connectStorageEmulator } from 'firebase/storage';

// IMPORTANT: DO NOT MODIFY THIS FUNCTION
export function initializeFirebase() {
  const isInitialized = getApps().length > 0;
  const app = isInitialized ? getApp() : initializeApp(firebaseConfig);
  return getSdks(app, isInitialized);
}

export function getSdks(firebaseApp: FirebaseApp, isInitialized: boolean) {
  const firestore = getFirestore(firebaseApp);
  const auth = getAuth(firebaseApp);
  const storage = getStorage(firebaseApp);

  // Use a flag to ensure emulators are only connected once.
  if (process.env.NODE_ENV === 'development' && !(globalThis as any)._firebaseEmulatorsConnected) {
    try {
      connectFirestoreEmulator(firestore, 'localhost', 8080);
      connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true });
      connectStorageEmulator(storage, 'localhost', 9199);
      console.log("CLIENT: Connected to Firebase emulators.");
      (globalThis as any)._firebaseEmulatorsConnected = true;
    } catch (e: any) {
       if (e.code !== 'failed-precondition') {
         console.warn("CLIENT: Could not connect to Firebase emulators. This is expected if they are not running.", e);
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
