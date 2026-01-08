import { Request, Response } from 'express';
import { RegisterUserUseCase } from '../../application/use-cases/RegisterUser.usecase';
import { LoginUserUseCase } from '../../application/use-cases/LoginUser.usecase';
import { ChangePasswordUseCase } from '../../application/use-cases/ChangePassword.usecase';
import { FirestoreAccountRepository } from '../repositories/FirestoreAccountRepository';
import { ApiResponse } from '../../../shared/utils/response.util';
import { asyncHandler, AppError } from '../../../shared/middleware/error.middleware';
import { AuthRequest } from '../../../shared/middleware/auth.middleware';

/**
 * Controlador de autenticación
 * Maneja los endpoints de registro, login y cambio de contraseña
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
     */
    register = asyncHandler(async (req: Request, res: Response) => {
        const result = await this.registerUseCase.execute(req.body);
        ApiResponse.created(res, result, 'User registered successfully');
    });

    /**
     * POST /auth/login
     * Inicia sesión de usuario
     */
    login = asyncHandler(async (req: Request, res: Response) => {
        const result = await this.loginUseCase.execute(req.body);
        ApiResponse.success(res, result, 'Login successful');
    });

    /**
     * POST /auth/change-password
     * Cambia la contraseña del usuario autenticado
     */
    changePassword = asyncHandler(async (req: AuthRequest, res: Response) => {
        const userId = req.user?.uid;
        if (!userId) {
            throw new AppError(401, 'Unauthorized');
        }
        await this.changePasswordUseCase.execute(userId, req.body);
        ApiResponse.success(res, null, 'Password changed successfully');
    });

    /**
     * POST /auth/validate-token
     * Valida un token JWT (para comunicación entre servicios)
     */
    validateToken = asyncHandler(async (req: AuthRequest, res: Response) => {
        if (!req.user) {
            throw new AppError(401, 'Invalid token');
        }
        ApiResponse.success(res, {
            valid: true,
            user: req.user
        }, 'Token is valid');
    });
}
