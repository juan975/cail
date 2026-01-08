import admin from 'firebase-admin';
import { config } from './env.config';

let initialized = false;

/**
 * Inicializa Firebase Admin SDK
 * Solo se ejecuta una vez por instancia de la función
 */
export const initializeFirebase = (): void => {
    if (initialized || admin.apps.length > 0) {
        return;
    }

    try {
        const serviceAccount = {
            projectId: config.firebase.projectId,
            clientEmail: config.firebase.clientEmail,
            privateKey: config.firebase.privateKey,
        };

        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
            projectId: config.firebase.projectId,
        });

        initialized = true;
        console.log('✅ Firebase initialized successfully');
    } catch (error) {
        console.error('❌ Failed to initialize Firebase:', error);
        throw error;
    }
};

/**
 * Obtiene la instancia de Firestore
 */
export const getFirestore = (): admin.firestore.Firestore => {
    if (!initialized && admin.apps.length === 0) {
        initializeFirebase();
    }
    return admin.firestore();
};

/**
 * Obtiene la instancia de Auth
 */
export const getAuth = (): admin.auth.Auth => {
    if (!initialized && admin.apps.length === 0) {
        initializeFirebase();
    }
    return admin.auth();
};

export default admin;
