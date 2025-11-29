import admin from 'firebase-admin';

export async function initializeAdminApp() {
    if (admin.apps.length > 0) {
        return;
    }
    
    try {
        // When running in a Google Cloud environment, the SDK can auto-discover credentials
        await admin.initializeApp({
             storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
        });
    } catch(e) {
        console.error("Could not initialize Firebase Admin SDK", e);
    }
}
