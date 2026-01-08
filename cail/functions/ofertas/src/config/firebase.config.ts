import admin from 'firebase-admin';
import { config } from './env.config';

let initialized = false;

export const initializeFirebase = (): void => {
    if (initialized || admin.apps.length > 0) return;

    try {
        admin.initializeApp({
            credential: admin.credential.cert({
                projectId: config.firebase.projectId,
                clientEmail: config.firebase.clientEmail,
                privateKey: config.firebase.privateKey,
            } as admin.ServiceAccount),
            projectId: config.firebase.projectId,
        });
        initialized = true;
        console.log('✅ Firebase initialized for Ofertas');
    } catch (error) {
        console.error('❌ Firebase initialization failed:', error);
        throw error;
    }
};

export const getFirestore = (): admin.firestore.Firestore => {
    if (!initialized && admin.apps.length === 0) initializeFirebase();
    return admin.firestore();
};

export default admin;
