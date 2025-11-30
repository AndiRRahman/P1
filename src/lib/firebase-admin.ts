
import admin from 'firebase-admin';

// This function initializes the Firebase Admin SDK.
// It ensures that it only runs once.
export function initializeAdminApp() {
  // If the app is already initialized, do nothing.
  if (admin.apps.length > 0) {
    return;
  }

  // When running in a local development environment (like Firebase Studio),
  // process.env.NODE_ENV will be 'development'.
  if (process.env.NODE_ENV === 'development') {
    // For local development, we connect to the emulators.
    // We provide a dummy projectId because the Admin SDK requires one,
    // but it's not actually used when connecting to local emulators.
    try {
      // IMPORTANT: Set emulator hosts before initializing the app
      process.env['FIREBASE_AUTH_EMULATOR_HOST'] = 'localhost:9099';
      process.env['FIRESTORE_EMULATOR_HOST'] = 'localhost:8080';
      process.env['FIREBASE_STORAGE_EMULATOR_HOST'] = 'localhost:9199';
      
      admin.initializeApp({
        projectId: 'dev-project-studio', // Use a consistent dummy project ID
        storageBucket: 'dev-project-studio.appspot.com',
      });
      console.log("Firebase Admin SDK initialized for DEVELOPMENT and connected to emulators.");
    } catch (error: any) {
        console.error("Critical: Could not initialize Firebase Admin SDK for development.", error);
    }
  } else {
    // When deployed to a live environment (like App Hosting),
    // the SDK automatically discovers the project configuration and credentials.
    try {
      admin.initializeApp();
      console.log("Firebase Admin SDK initialized for PRODUCTION.");
    } catch (error) {
      console.error("Critical: Could not initialize Firebase Admin SDK for production.", error);
    }
  }
}
