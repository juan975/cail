import { Request, Response } from 'express';
import { RegisterUserUseCase } from '../../application/use-cases/RegisterUser.usecase';
import { LoginUserUseCase } from '../../application/use-cases/LoginUser.usecase';
import { ChangePasswordUseCase } from '../../application/use-cases/ChangePassword.usecase';
import { FirestoreAccountRepository } from '../repositories/FirestoreAccountRepository';
import { ApiResponse } from '../../../shared/utils/response.util';
import { asyncHandler, AppError } from '../../../shared/middleware/error.middleware';
import { AuthRequest } from '../../../shared/middleware/auth.middleware';

/**
 * Controlador de autenticación con Firebase Auth
 * 
 * Cambios respecto a la versión anterior (JWT custom):
 * - /auth/login ya no valida contraseñas (eso lo hace Firebase Auth en el frontend)
 * - /auth/register para candidatos espera firebaseUid del frontend
 * - /auth/register para empleadores crea el usuario en Firebase Auth con contraseña temporal
 * - /auth/password-changed solo actualiza el flag en Firestore
 */
export class AuthController {
    private registerUseCase: RegisterUserUseCase;
    private loginUseCase: LoginUserUseCase;
    private changePasswordUseCase: ChangePasswordUseCase;

    constructor() {
        const repository = new FirestoreAccountRepository();
        this.registerUseCase = new RegisterUserUseCase(repository);
        this.loginUseCase = new LoginUserUseCase(repository);
        this.changePasswordUseCase = new ChangePasswordUseCase(repository);
    }

    /**
     * POST /auth/register
     * Registra un nuevo usuario
     * 
     * Para CANDIDATOS: Requiere firebaseUid (frontend ya creó el usuario en Firebase Auth)
     * Para EMPLEADORES: Crea usuario en Firebase Auth y envía contraseña temporal por email
     */
    register = asyncHandler(async (req: Request, res: Response) => {
        const result = await this.registerUseCase.execute(req.body);
        ApiResponse.created(res, result, 'User registered successfully');
    });

    /**
     * GET /auth/profile (requiere autenticación)
     * Obtiene el perfil del usuario autenticado
     * 
     * Este endpoint reemplaza al antiguo /auth/login para obtener datos del usuario
     * El login real ocurre en el frontend con Firebase Auth
     */
    getProfile = asyncHandler(async (req: AuthRequest, res: Response) => {
        const userId = req.user?.uid;
        if (!userId) {
            throw new AppError(401, 'Unauthorized');
        }
        const result = await this.loginUseCase.getProfileByUid(userId);
        ApiResponse.success(res, result, 'Profile retrieved successfully');
    });

    /**
     * POST /auth/password-changed
     * Confirma que el usuario cambió su contraseña en Firebase Auth
     * 
     * El cambio de contraseña real ocurre en el frontend usando Firebase Auth SDK.
     * Este endpoint solo actualiza needsPasswordChange: false en Firestore.
     */
    confirmPasswordChanged = asyncHandler(async (req: AuthRequest, res: Response) => {
        const userId = req.user?.uid;
        if (!userId) {
            throw new AppError(401, 'Unauthorized');
        }
        await this.changePasswordUseCase.confirmPasswordChanged(userId);
        ApiResponse.success(res, null, 'Password change confirmed');
    });

    /**
     * POST /auth/validate-token
     * Valida un Firebase ID Token (para comunicación entre servicios)
     * 
     * Si el middleware de autenticación deja pasar la petición,
     * el token es válido.
     */
    validateToken = asyncHandler(async (req: AuthRequest, res: Response) => {
        if (!req.user) {
            throw new AppError(401, 'Invalid token');
        }

        // Obtener perfil completo para incluir tipoUsuario
        const profile = await this.loginUseCase.getProfileByUid(req.user.uid);

        ApiResponse.success(res, {
            valid: true,
            user: {
                uid: req.user.uid,
                email: req.user.email,
                tipoUsuario: profile.tipoUsuario,
            }
        }, 'Token is valid');
    });

    // =========================================
    // DEPRECATED ENDPOINTS (mantener por compatibilidad temporal)
    // =========================================

    /**
     * @deprecated Use Firebase Auth SDK for login, then call /auth/profile
     * POST /auth/login - Mantener por compatibilidad
     */
    login = asyncHandler(async (req: AuthRequest, res: Response) => {
        // Este endpoint ya no hace autenticación real
        // Solo retorna error indicando el nuevo flujo
        throw new AppError(400,
            'Login endpoint deprecated. Use Firebase Auth SDK for authentication, ' +
            'then call GET /auth/profile with the Firebase ID Token.'
        );
    });

    /**
     * @deprecated Use Firebase Auth SDK for password change
     * POST /auth/change-password - Mantener para mensajes de migración
     */
    changePassword = asyncHandler(async (req: AuthRequest, res: Response) => {
        throw new AppError(400,
            'Password change via backend deprecated. Use Firebase Auth SDK ' +
            '(updatePassword), then call POST /auth/password-changed'
        );
    });
}
