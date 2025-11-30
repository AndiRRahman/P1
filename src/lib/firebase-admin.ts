import admin from 'firebase-admin';

// This function initializes the Firebase Admin SDK.
// It ensures that it only runs once.
export async function initializeAdminApp() {
    // If the app is already initialized, do nothing.
    if (admin.apps.length > 0) {
        return;
    }

    // When running in a local development environment with the 'dev' script,
    // the FIRESTORE_EMULATOR_HOST, FIREBASE_AUTH_EMULATOR_HOST,
    // and FIREBASE_STORAGE_EMULATOR_HOST environment variables are automatically set.
    // The Admin SDK will automatically detect these and connect to the emulators.
    //
    // When deployed to Firebase App Hosting, the SDK automatically discovers the
    // project configuration and credentials from the environment.
    try {
        admin.initializeApp();
        console.log("Firebase Admin SDK initialized.");
    } catch (error) {
        console.error("Critical: Could not initialize Firebase Admin SDK.", error);
    }
}
