/**
 * Servicio de Autenticación
 * 
 * Combina Firebase Auth (para autenticación) con nuestro backend (para perfiles).
 * 
 * Flujos:
 *   - Login: Firebase Auth -> Obtener perfil del backend -> Validar rol
 *   - Registro POSTULANTE: Firebase Auth (frontend) -> Crear perfil en backend
 *   - Registro RECLUTADOR: Backend crea en Firebase Auth + envía email con link de reset
 *   - Cambio de contraseña: Firebase Auth -> Confirmar en backend
 */

import { apiService } from './api.service';
import { API_CONFIG } from './config';
import { firebaseAuthService } from './firebase.service';
import {
    LoginResponse,
    RegisterRequest,
    RegisterResponse,
} from '@/types/auth.types';

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
     * Login de usuario
     * Valida que el rol del usuario coincida con el módulo seleccionado
     * @param email Correo electrónico
     * @param password Contraseña
     * @param expectedRole Rol esperado ('candidate' o 'employer')
     */
    async login(email: string, password: string, expectedRole?: 'candidate' | 'employer'): Promise<LoginResponse> {
        // 1. Autenticar con Firebase Auth
        const { user, idToken } = await firebaseAuthService.login(email, password);

        // 2. Obtener perfil del backend
        const profileResponse = await apiService.get<{ status: string; data: any }>('/users/profile');
        const actualRole = profileResponse.data.tipoUsuario;

        // 3. Validar que el rol coincida con el módulo seleccionado
        if (expectedRole) {
            const roleMap: Record<string, 'candidate' | 'employer'> = {
                'POSTULANTE': 'candidate',
                'RECLUTADOR': 'employer'
            };

            if (roleMap[actualRole] !== expectedRole) {
                // Cerrar sesión antes de lanzar error
                await firebaseAuthService.logout();

                const roleName = actualRole === 'RECLUTADOR' ? 'Empleador' : 'Postulante';
                throw new RoleMismatchError(
                    `Estas credenciales pertenecen a un ${roleName}. Por favor selecciona el módulo correcto.`
                );
            }
        }

        return {
            idCuenta: user.uid,
            email: user.email || email,
            nombreCompleto: profileResponse.data.nombreCompleto,
            tipoUsuario: actualRole,
            token: idToken,
            needsPasswordChange: profileResponse.data.needsPasswordChange,
        };
    }

    /**
     * Registro de nuevo usuario
     * - POSTULANTE: Crea en Firebase Auth desde frontend, luego crea perfil en backend
     * - RECLUTADOR: Backend crea en Firebase Auth y envía link de activación por email
     */
    async register(data: RegisterRequest): Promise<RegisterResponse> {
        console.log('🚀 register() called with type:', data.tipoUsuario);

        // Para POSTULANTES: crear usuario en Firebase Auth primero
        if (data.tipoUsuario === 'POSTULANTE') {
            console.log('👤 Registering CANDIDATE - Client side creation');

            const { user, idToken } = await firebaseAuthService.createAuthUser(
                data.email,
                data.password
            );

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
                } catch (cleanupError) {
                    console.error('Failed to cleanup:', cleanupError);
                }
                throw error;
            }
        } else if (data.tipoUsuario === 'RECLUTADOR') {
            console.log('🏢 Registering RECRUITER - Backend side creation');

            // Para RECLUTADORES: el backend crea todo (Firebase Auth + perfil)
            // No se pasa contraseña, el backend genera una configuración segura
            const response = await apiService.post<{ status: string; data: RegisterResponse }>(
                API_CONFIG.ENDPOINTS.REGISTER,
                {
                    ...data,
                    password: undefined, // No enviar contraseña
                }
            );

            return response.data;
        } else {
            throw new Error(`Invalid user type: ${data.tipoUsuario}`);
        }
    }

    /**
     * Cambio de contraseña
     * 1. Cambiar en Firebase Auth (desde el cliente)
     * 2. Confirmar en backend (actualiza needsPasswordChange)
     */
    async changePassword(currentPassword: string, newPassword: string): Promise<void> {
        await firebaseAuthService.changePassword(currentPassword, newPassword);
        await apiService.post('/auth/password-changed');
    }

    /**
     * Cerrar sesión
     */
    async logout(): Promise<void> {
        await firebaseAuthService.logout();
    }

    /**
     * Obtener token actual (Firebase ID Token)
     */
    async getStoredToken(): Promise<string | null> {
        return await firebaseAuthService.getIdToken();
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
