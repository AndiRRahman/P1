import admin from 'firebase-admin';

export async function initializeAdminApp() {
    if (admin.apps.length > 0) {
        return;
    }
    
    // The GOOGLE_APPLICATION_CREDENTIALS env var is not set in the local dev environment,
    // so we can use this to determine if we're running locally.
    const isLocalDevelopment = !process.env.GOOGLE_APPLICATION_CREDENTIALS;

    if (isLocalDevelopment) {
        // **CRUCIAL FIX**: Explicitly set the AUTH emulator host for the Admin SDK.
        // The Admin SDK checks for this specific environment variable to route auth requests to the emulator.
        process.env.FIREBASE_AUTH_EMULATOR_HOST = "127.0.0.1:9099";
    }

    try {
        if (isLocalDevelopment) {
            // When running locally, the SDK will now correctly connect to all emulators
            // using environment variables.
            await admin.initializeApp({
                projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'studio-4798208575-47d7c',
                storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
            });
             console.log("Firebase Admin SDK initialized for LOCAL DEVELOPMENT (Emulators).");
        } else {
            // When running in a deployed Google Cloud environment (like App Hosting),
            // the SDK can auto-discover credentials without any config.
            await admin.initializeApp({
                storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
            });
             console.log("Firebase Admin SDK initialized for PRODUCTION.");
        }
    } catch(e) {
        console.error("Could not initialize Firebase Admin SDK", e);
    }
}
