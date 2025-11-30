import admin from 'firebase-admin';

// This function initializes the Firebase Admin SDK.
// It ensures that it only runs once.
export async function initializeAdminApp() {
    // If the app is already initialized, do nothing.
    if (admin.apps.length > 0) {
        return;
    }

    // When running in a local development environment, the Admin SDK will automatically
    // connect to the emulators if the FIRESTORE_EMULATOR_HOST, FIREBASE_AUTH_EMULATOR_HOST,
    // and FIREBASE_STORAGE_EMULATOR_HOST environment variables are set.
    // The 'dev' script in package.json ensures these are set.
    //
    // When deployed to Firebase App Hosting, the SDK automatically discovers the
    // project configuration and credentials.
    try {
        admin.initializeApp({
             projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'studio-4798208575-47d7c',
        });
        console.log("Firebase Admin SDK initialized successfully.");
    } catch (error) {
        // Log a more detailed error if initialization fails.
        console.error("Critical: Could not initialize Firebase Admin SDK.", error);
    }
}
