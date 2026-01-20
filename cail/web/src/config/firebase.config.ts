/**
 * Configuración de Firebase para la versión Web
 * 
 * Las credenciales se obtienen de variables de entorno para seguridad.
 * Ver env.example para las variables necesarias.
 */

import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

// Inicializar Firebase solo si no está inicializado
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Obtener instancia de Auth
const auth = getAuth(app);

export { app, auth };
export default app;
