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

// Tipos de rol para la UI
export type UIUserRole = 'candidate' | 'employer';

// Error específico para rol incorrecto
export class RoleMismatchError extends Error {
    public readonly expectedRole: UIUserRole;
    public readonly actualRole: UIUserRole;

    constructor(expectedRole: UIUserRole, actualRole: UIUserRole) {
        const message = expectedRole === 'candidate'
            ? 'Esta cuenta es de Empleador. Por favor selecciona "Soy Empleador".'
            : 'Esta cuenta es de Candidato. Por favor selecciona "Busco Empleo".';
        super(message);
        this.name = 'RoleMismatchError';
        this.expectedRole = expectedRole;
        this.actualRole = actualRole;
    }
}

class AuthService {
    /**
     * Login de usuario con validación de rol
     * 
     * @param email Email del usuario
     * @param password Contraseña
     * @param expectedRole Rol que el usuario seleccionó en la UI (candidate o employer)
     * @throws RoleMismatchError si el rol del usuario no coincide con el esperado
     */
    async login(email: string, password: string, expectedRole?: UIUserRole): Promise<LoginResponse> {
        // 1. Autenticar con Firebase Auth
        const { user, idToken } = await firebaseAuthService.login(email, password);

        try {
            // 2. Obtener perfil del backend
            const profileResponse = await apiService.get<{ status: string; data: any }>('/auth/profile');

            const tipoUsuario = profileResponse.data.tipoUsuario;
            const actualRole: UIUserRole = tipoUsuario === 'POSTULANTE' ? 'candidate' : 'employer';

            // 3. Validar que el rol coincida (si se especificó un rol esperado)
            if (expectedRole && actualRole !== expectedRole) {
                // Cerrar sesión de Firebase ANTES de lanzar el error
                console.log('❌ Role mismatch: expected', expectedRole, 'got', actualRole);
                await firebaseAuthService.logout();
                throw new RoleMismatchError(expectedRole, actualRole);
            }

            return {
                idCuenta: user.uid,
                email: user.email || email,
                nombreCompleto: profileResponse.data.nombreCompleto,
                tipoUsuario: tipoUsuario,
                token: idToken,
                needsPasswordChange: profileResponse.data.needsPasswordChange,
            };
        } catch (error) {
            // Si hay cualquier error después del login de Firebase, cerrar sesión
            if (!(error instanceof RoleMismatchError)) {
                // Solo hacer logout si no es un RoleMismatchError (ya hicimos logout en ese caso)
                try {
                    await firebaseAuthService.logout();
                } catch (logoutError) {
                    console.error('Error during cleanup logout:', logoutError);
                }
            }
            throw error;
        }
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
