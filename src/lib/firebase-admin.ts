import admin from 'firebase-admin';

export async function initializeAdminApp() {
    if (admin.apps.length > 0) {
        return;
    }
    
    // The GOOGLE_APPLICATION_CREDENTIALS env var is not set in the local dev environment,
    // so we can use this to determine if we're running locally.
    const isLocalDevelopment = !process.env.GOOGLE_APPLICATION_CREDENTIALS;

    try {
        if (isLocalDevelopment) {
            // When running locally, connect to the emulators using the environment variables
            // set in .env.local. The Admin SDK automatically detects these variables.
            await admin.initializeApp({
                projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'studio-4798208575-47d7c',
                storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
            });
        } else {
            // When running in a deployed Google Cloud environment (like App Hosting),
            // the SDK can auto-discover credentials without any config.
            await admin.initializeApp({
                storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
            });
        }
    } catch(e) {
        console.error("Could not initialize Firebase Admin SDK", e);
    }
}
