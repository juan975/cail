import { Request, Response, NextFunction } from 'express';
import { RegisterUserUseCase } from '../../application/use-cases/RegisterUser.usecase';
import { LoginUserUseCase } from '../../application/use-cases/LoginUser.usecase';
import { ChangePasswordUseCase } from '../../application/use-cases/ChangePassword.usecase';
import { FirestoreAccountRepository } from '../repositories/FirestoreAccountRepository';
import { ApiResponse } from '../../../../shared/infrastructure/utils/response.util';
import { asyncHandler } from '../../../../shared/infrastructure/middleware/error.middleware';
import { AuthRequest } from '../../../../shared/infrastructure/middleware/auth.middleware';

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

    register = asyncHandler(async (req: Request, res: Response) => {
        const result = await this.registerUseCase.execute(req.body);
        ApiResponse.created(res, result, 'User registered successfully');
    });

    login = asyncHandler(async (req: Request, res: Response) => {
        const result = await this.loginUseCase.execute(req.body);
        ApiResponse.success(res, result, 'Login successful');
    });

    changePassword = asyncHandler(async (req: AuthRequest, res: Response) => {
        const userId = req.user?.uid;
        if (!userId) {
            return res.status(401).json({ status: 'error', message: 'Unauthorized' });
        }
        const result = await this.changePasswordUseCase.execute(userId, req.body);
        return ApiResponse.success(res, result, 'Password changed successfully');
    });
}
