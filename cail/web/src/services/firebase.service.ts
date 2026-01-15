/**
 * Servicio de Firebase Authentication para Web
 * 
 * Wrapper para las operaciones de Firebase Auth en el navegador.
 * Este servicio maneja: login, registro, logout, cambio de contraseña y tokens.
 */

import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    User,
    updatePassword,
    EmailAuthProvider,
    reauthenticateWithCredential,
    onAuthStateChanged as firebaseOnAuthStateChanged,
    UserCredential,
} from 'firebase/auth';
import { auth } from '../config/firebase.config';

/**
 * Resultado del login/registro con Firebase
 */
export interface FirebaseAuthResult {
    user: User;
    idToken: string;
}

class FirebaseAuthService {
    /**
     * Login con email y contraseña
     * @returns Usuario y ID Token de Firebase
     */
    async login(email: string, password: string): Promise<FirebaseAuthResult> {
        const userCredential: UserCredential = await signInWithEmailAndPassword(
            auth,
            email,
            password
        );
        const idToken = await userCredential.user.getIdToken();

        console.log('🔐 Firebase login successful:', email);

        return {
            user: userCredential.user,
            idToken
        };
    }

    /**
     * Crear usuario en Firebase Auth (solo auth, no perfil)
     * Usado para registro de CANDIDATOS
     * El perfil se crea después llamando al backend
     */
    async createAuthUser(email: string, password: string): Promise<FirebaseAuthResult> {
        const userCredential: UserCredential = await createUserWithEmailAndPassword(
            auth,
            email,
            password
        );
        const idToken = await userCredential.user.getIdToken();

        console.log('✅ Firebase user created:', email, 'UID:', userCredential.user.uid);

        return {
            user: userCredential.user,
            idToken
        };
    }

    /**
     * Cerrar sesión
     */
    async logout(): Promise<void> {
        await signOut(auth);
        console.log('👋 Firebase logout successful');
    }

    /**
     * Obtener ID Token actual
     * Firebase se encarga de refrescar el token automáticamente si está expirado
     * 
     * @param forceRefresh Si es true, fuerza un refresh del token aunque no haya expirado
     */
    async getIdToken(forceRefresh = false): Promise<string | null> {
        const user = auth.currentUser;
        if (!user) {
            return null;
        }
        return await user.getIdToken(forceRefresh);
    }

    /**
     * Cambiar contraseña del usuario actual
     * Requiere re-autenticación por seguridad
     */
    async changePassword(currentPassword: string, newPassword: string): Promise<void> {
        const user = auth.currentUser;
        if (!user || !user.email) {
            throw new Error('No user logged in');
        }

        // Re-autenticar antes de cambiar contraseña (requerido por Firebase)
        const credential = EmailAuthProvider.credential(user.email, currentPassword);
        await reauthenticateWithCredential(user, credential);

        // Cambiar contraseña
        await updatePassword(user, newPassword);

        console.log('🔐 Password changed successfully for:', user.email);
    }

    /**
     * Obtener usuario actual (sincrónico)
     */
    getCurrentUser(): User | null {
        return auth.currentUser;
    }

    /**
     * Obtener UID del usuario actual
     */
    getCurrentUserId(): string | null {
        return auth.currentUser?.uid || null;
    }

    /**
     * Obtener email del usuario actual
     */
    getCurrentUserEmail(): string | null {
        return auth.currentUser?.email || null;
    }

    /**
     * Suscribirse a cambios de estado de autenticación
     * Retorna una función para desuscribirse
     */
    onAuthStateChanged(callback: (user: User | null) => void): () => void {
        return firebaseOnAuthStateChanged(auth, callback);
    }

    /**
     * Verificar si hay un usuario autenticado
     */
    isAuthenticated(): boolean {
        return auth.currentUser !== null;
    }
}

export const firebaseAuthService = new FirebaseAuthService();
