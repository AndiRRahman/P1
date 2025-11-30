
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
    try {
      // IMPORTANT: Set emulator hosts BEFORE initializing the app.
      // Use 127.0.0.1 consistently to avoid resolution issues.
      process.env['FIREBASE_AUTH_EMULATOR_HOST'] = '127.0.0.1:9099';
      process.env['FIRESTORE_EMULATOR_HOST'] = '127.0.0.1:8080';
      process.env['FIREBASE_STORAGE_EMULATOR_HOST'] = '127.0.0.1:9199';
      
      admin.initializeApp({
        projectId: 'demo-app', // Use a dummy project ID for emulators
        storageBucket: 'demo-app.appspot.com', // Use a dummy bucket for emulators
      });
      
      console.log("ADMIN SDK: Connected to Firebase emulators.");
    } catch (error: any) {
        console.error("ADMIN SDK: Critical - Could not initialize Firebase Admin SDK for development.", error);
    }
  } else {
    // When deployed to a live environment (like App Hosting),
    // the SDK automatically discovers the project configuration and credentials.
    try {
      admin.initializeApp();
    } catch (error) {
      console.error("ADMIN SDK: Critical - Could not initialize Firebase Admin SDK for production.", error);
    }
  }
}
