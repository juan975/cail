/**
 * Configuración de Firebase para el cliente (React Native / Expo)
 * 
 * Credenciales de Firebase Console - cail-backend-prod
 */

import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

// Configuración de Firebase - cail-backend-prod
const firebaseConfig = {
    apiKey: "AIzaSyA2nDXPnQeCmePp3-6xDmurhUBeSRuNW_g",
    authDomain: "cail-backend-prod.firebaseapp.com",
    projectId: "cail-backend-prod",
    storageBucket: "cail-backend-prod.firebasestorage.app",
    messagingSenderId: "346693146426",
    appId: "1:346693146426:web:0f8dde0713d71fe8b92203",
    measurementId: "G-7QFNGV9J2K"
};

// Inicializar Firebase solo si no está inicializado
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Obtener instancia de Auth
const auth = getAuth(app);

export { app, auth };
export default app;
