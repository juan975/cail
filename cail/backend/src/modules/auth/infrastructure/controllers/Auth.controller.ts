import { Request, Response, NextFunction } from 'express';
import { RegisterUserUseCase } from '../../application/use-cases/RegisterUser.usecase';
import { LoginUserUseCase } from '../../application/use-cases/LoginUser.usecase';
import { FirestoreAccountRepository } from '../repositories/FirestoreAccountRepository';
import { ApiResponse } from '../../../../shared/infrastructure/utils/response.util';
import { asyncHandler } from '../../../../shared/infrastructure/middleware/error.middleware';

export class AuthController {
    private registerUseCase: RegisterUserUseCase;
    private loginUseCase: LoginUserUseCase;

    constructor() {
        const repository = new FirestoreAccountRepository();
        this.registerUseCase = new RegisterUserUseCase(repository);
        this.loginUseCase = new LoginUserUseCase(repository);
    }

    register = asyncHandler(async (req: Request, res: Response) => {
        const result = await this.registerUseCase.execute(req.body);
        ApiResponse.created(res, result, 'User registered successfully');
    });

    login = asyncHandler(async (req: Request, res: Response) => {
        const result = await this.loginUseCase.execute(req.body);
        ApiResponse.success(res, result, 'Login successful');
    });
}
