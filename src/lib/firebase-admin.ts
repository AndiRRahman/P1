
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
    // For local development with emulators, we use a dummy projectId and credentials.
    // The Admin SDK will automatically connect to the emulators if their
    // respective environment variables (e.g., FIRESTORE_EMULATOR_HOST) are set,
    // which they are by default in the Firebase Studio environment.
    try {
      admin.initializeApp({
        projectId: 'dev-project', // Use a dummy project ID for emulator
        credential: admin.credential.applicationDefault()
      });
      console.log("Firebase Admin SDK initialized for DEVELOPMENT (Emulators).");
    } catch (error: any) {
        // Fallback for environments where ADC is not available
        if (error.code === 'GOOGLE_APPLICATION_CREDENTIALS_NOT_SET') {
             admin.initializeApp({ projectId: 'dev-project' });
             console.log("Firebase Admin SDK initialized for DEVELOPMENT (Emulators) without credentials.");
        } else {
            console.error("Critical: Could not initialize Firebase Admin SDK for development.", error);
        }
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
