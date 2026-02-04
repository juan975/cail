/**
 * Servicio de Autenticación para Web
 * 
 * Sistema unificado usando Firebase Auth para todos los usuarios.
 * 
 * Flujos:
 *   - Login: Firebase Auth -> Obtener perfil del backend -> Validar rol
 *   - Registro POSTULANTE: Firebase Auth (frontend) -> Crear perfil en backend
 *   - Registro RECLUTADOR: Backend crea en Firebase Auth + envía email con temp password
 *   - Cambio de contraseña: Backend (usa Firebase Admin para actualizar)
 */

import { apiService } from './api.service';
import { API_CONFIG } from './config';
import { firebaseAuthService } from './firebase.service';
import {
    LoginResponse,
    RegisterRequest,
    RegisterResponse,
} from '../types/auth.types';

/**
 * Error para cuando el rol seleccionado no coincide con el tipo de cuenta
 */
export class RoleMismatchError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'RoleMismatchError';
    }
}

class AuthService {
    /**
     * Login de usuario usando Firebase Auth
     * Valida que el rol del usuario coincida con el módulo seleccionado
     * @param email Correo electrónico
     * @param password Contraseña
     * @param expectedRole Rol esperado ('candidate' o 'employer')
     */
    async login(email: string, password: string, expectedRole?: 'candidate' | 'employer'): Promise<LoginResponse> {
        // 1. Autenticar con Firebase Auth
        const { user, idToken } = await firebaseAuthService.login(email, password);

        // 2. Guardar token para las peticiones al API
        await apiService.saveToken(idToken);

        try {
            // 3. Obtener perfil del backend
            const profileResponse = await apiService.get<{ status: string; data: any }>('/users/profile');
            const actualRole = profileResponse.data.tipoUsuario;

            // 4. Validar que el rol coincida con el módulo seleccionado
            if (expectedRole) {
                const roleMap: Record<string, 'candidate' | 'employer'> = {
                    'POSTULANTE': 'candidate',
                    'RECLUTADOR': 'employer'
                };

                if (roleMap[actualRole] !== expectedRole) {
                    // Cerrar sesión antes de lanzar error
                    await firebaseAuthService.logout();
                    await apiService.removeToken();

                    const roleName = actualRole === 'RECLUTADOR' ? 'Empleador' : 'Postulante';
                    throw new RoleMismatchError(
                        `Estas credenciales pertenecen a un ${roleName}. Por favor selecciona el módulo correcto.`
                    );
                }
            }

            return {
                idCuenta: user.uid,
                email: user.email || email,
                nombreCompleto: profileResponse.data.nombreCompleto || 'Usuario',
                tipoUsuario: actualRole || 'POSTULANTE',
                token: idToken,
                needsPasswordChange: profileResponse.data.needsPasswordChange || false,
            };
        } catch (error: any) {
            // Si es RoleMismatchError, re-lanzar
            if (error instanceof RoleMismatchError) {
                throw error;
            }

            // If 403 (forbidden - e.g. recruiter not verified), propagate with original message
            if (error?.response?.status === 403) {
                const backendMessage = error?.response?.data?.message || 'Acceso denegado';
                console.error('🚫 Access denied (403) during login:', backendMessage);
                await firebaseAuthService.logout();
                await apiService.removeToken();
                throw new Error(backendMessage);
            }

            // Si falla obtener el perfil, cerrar sesión y lanzar error
            console.warn('Could not fetch profile:', error);
            await firebaseAuthService.logout();
            await apiService.removeToken();
            throw new Error('No se pudo obtener el perfil del usuario');
        }
    }

    /**
     * Registro de nuevo usuario
     * - POSTULANTE: Crea en Firebase Auth desde frontend, luego crea perfil en backend
     * - RECLUTADOR: Backend crea todo (Firebase Auth + perfil + envía email)
     */
    async register(data: RegisterRequest): Promise<RegisterResponse> {
        console.log('🚀 register() called with type:', data.tipoUsuario);

        if (data.tipoUsuario === 'POSTULANTE') {
            // For CANDIDATES: create in Firebase Auth first (client-side)
            console.log('👤 Registering CANDIDATE - Client side creation');

            const { user, idToken } = await firebaseAuthService.createAuthUser(
                data.email,
                data.password
            );

            await apiService.saveToken(idToken);

            try {
                console.log('✅ Auth User created, creating profile...', user.uid);
                const response = await apiService.post<{ status: string; data: RegisterResponse }>(
                    API_CONFIG.ENDPOINTS.REGISTER,
                    {
                        ...data,
                        firebaseUid: user.uid,
                    }
                );

                return {
                    ...response.data,
                    token: idToken,
                };
            } catch (error) {
                console.error('❌ Profile creation failed, cleaning up...');
                try {
                    await firebaseAuthService.logout();
                    await apiService.removeToken();
                } catch (cleanupError) {
                    console.error('Failed to cleanup:', cleanupError);
                }
                throw error;
            }
        } else if (data.tipoUsuario === 'RECLUTADOR') {
            // For EMPLOYERS: backend creates everything (Firebase Auth + profile)
            console.log('🏢 Registering RECRUITER - Backend side creation');

            const response = await apiService.post<{ status: string; data: RegisterResponse }>(
                API_CONFIG.ENDPOINTS.REGISTER,
                data // Send full data including password
            );

            return response.data;
        } else {
            throw new Error(`Invalid user type: ${data.tipoUsuario}`);
        }
    }

    /**
     * Obtener lista de empresas validadas
     */
    async getCompanies(): Promise<any[]> {
        const response = await apiService.get<{ status: string; data: any[] }>('/auth/companies');
        return response.data;
    }

    /**
     * Cambio de contraseña
     * Re-authenticates with Firebase, then calls backend to update password
     * 
     * @param currentPassword The current (or temporary) password
     * @param newPassword The new password to set
     * @param email Optional email - if not provided, gets from Firebase current user
     */
    async changePassword(currentPassword: string, newPassword: string, email?: string): Promise<void> {
        // Get email from parameter or from Firebase current user
        const userEmail = email || firebaseAuthService.getCurrentUserEmail();
        if (!userEmail) {
            throw new Error('No user email available');
        }

        console.log('🔐 Changing password for:', userEmail);

        // Re-authenticate with the current (temporary) password to get fresh token
        const { idToken } = await firebaseAuthService.login(userEmail, currentPassword);
        await apiService.saveToken(idToken);

        // Call backend to update password in Firebase Auth via Admin SDK
        await apiService.post('/auth/change-password', {
            currentPassword,
            newPassword,
        });

        console.log('✅ Password changed, re-logging in with new password');

        // After password is changed, sign out and re-login with new password
        await firebaseAuthService.logout();

        // Re-login with new password
        const { idToken: newToken } = await firebaseAuthService.login(userEmail, newPassword);
        await apiService.saveToken(newToken);

        console.log('✅ Re-logged in with new password');
    }

    /**
     * Cerrar sesión
     */
    async logout(): Promise<void> {
        await firebaseAuthService.logout();
        await apiService.removeToken();
    }

    /**
     * Obtener token actual (Firebase ID Token)
     */
    async getStoredToken(): Promise<string | null> {
        const firebaseToken = await firebaseAuthService.getIdToken();
        if (firebaseToken) {
            return firebaseToken;
        }
        return await apiService.getToken();
    }

    /**
     * Verificar si hay un usuario autenticado
     */
    async isAuthenticated(): Promise<boolean> {
        return firebaseAuthService.isAuthenticated();
    }

    /**
     * Obtener UID del usuario actual
     */
    getCurrentUserId(): string | null {
        return firebaseAuthService.getCurrentUserId();
    }

    /**
     * Obtener email del usuario actual
     */
    getCurrentUserEmail(): string | null {
        return firebaseAuthService.getCurrentUserEmail();
    }
}

export const authService = new AuthService();
