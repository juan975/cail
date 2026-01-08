import { Response } from 'express';
import { FirestoreAccountRepository } from '../../../../modules/auth/infrastructure/repositories/FirestoreAccountRepository';
import { AuthRequest } from '../../../../shared/infrastructure/middleware/auth.middleware';
import { ApiResponse } from '../../../../shared/infrastructure/utils/response.util';
import { asyncHandler, AppError } from '../../../../shared/infrastructure/middleware/error.middleware';
import { UserId } from '../../../../shared/domain/value-objects/UserId';

const accountRepository = new FirestoreAccountRepository();

export const getProfile = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user?.uid;
    if (!userId) {
        throw new AppError(401, 'Unauthorized');
    }

    const account = await accountRepository.findById(new UserId(userId));
    if (!account) {
        throw new AppError(404, 'User profile not found');
    }

    return ApiResponse.success(res, account.toJSON());
});

export const updateProfile = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user?.uid;
    if (!userId) {
        throw new AppError(401, 'Unauthorized');
    }

    const account = await accountRepository.findById(new UserId(userId));
    if (!account) {
        throw new AppError(404, 'User profile not found');
    }

    if ((req as any).body.nombreCompleto) account.nombreCompleto = (req as any).body.nombreCompleto;
    if ((req as any).body.telefono) account.telefono = (req as any).body.telefono;
    if ((req as any).body.candidateProfile) account.candidateProfile = (req as any).body.candidateProfile;
    if ((req as any).body.employerProfile) account.employerProfile = (req as any).body.employerProfile;

    await accountRepository.save(account);

    return ApiResponse.success(res, account.toJSON(), 'Profile updated successfully');
});
