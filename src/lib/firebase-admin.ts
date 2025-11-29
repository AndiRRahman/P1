import admin from 'firebase-admin';

export async function initializeAdminApp() {
    if (admin.apps.length > 0) {
        return;
    }
    
    try {
        await admin.initializeApp();
    } catch(e) {
        console.error("Could not initialize Firebase Admin SDK");
    }
}
