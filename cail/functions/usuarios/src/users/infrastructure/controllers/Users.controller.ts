import { Response } from 'express';
import { FirestoreAccountRepository } from '../../../auth/infrastructure/repositories/FirestoreAccountRepository';
import { AuthRequest } from '../../../shared/middleware/auth.middleware';
import { ApiResponse } from '../../../shared/utils/response.util';
import { asyncHandler, AppError } from '../../../shared/middleware/error.middleware';
import { UserId } from '../../../shared/domain/value-objects/UserId';

const accountRepository = new FirestoreAccountRepository();

/**
 * GET /users/profile
 * Obtiene el perfil del usuario autenticado
 */
export const getProfile = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user?.uid;
    if (!userId) {
        throw new AppError(401, 'Unauthorized');
    }

    const account = await accountRepository.findById(new UserId(userId));
    if (!account) {
        throw new AppError(404, 'User profile not found');
    }

    // CRITICAL: Verificar que reclutadores tengan emailVerified === true
    // Esta validación bloquea reclutadores no autorizados por el supervisor
    if (account.tipoUsuario === 'RECLUTADOR' && account.employerProfile) {
        const emailVerified = account.employerProfile.emailVerified;

        console.log('🔐 [/users/profile] Checking recruiter authorization. emailVerified:', emailVerified);

        if (emailVerified !== true) {
            console.warn('⚠️ [/users/profile] Recruiter access denied - emailVerified is not true:', account.email.getValue());
            throw new AppError(403,
                'Tu cuenta está pendiente de autorización. Un supervisor de tu empresa debe aprobar tu acceso haciendo clic en el enlace del correo de autorización.',
                'EMAIL_NOT_VERIFIED'
            );
        }

        console.log('✅ [/users/profile] Recruiter authorized - emailVerified is true');
    }

    return ApiResponse.success(res, account.toJSON());
});

/**
 * PUT /users/profile
 * Actualiza el perfil del usuario autenticado
 */
export const updateProfile = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user?.uid;
    if (!userId) {
        throw new AppError(401, 'Unauthorized');
    }

    const account = await accountRepository.findById(new UserId(userId));
    if (!account) {
        throw new AppError(404, 'User profile not found');
    }

    // Actualizar campos permitidos
    const reqAny = req as any;
    console.log(`👤 Updating profile for user: ${userId}`);

    if (reqAny.body.nombreCompleto) {
        console.log(`   - Name update: ${reqAny.body.nombreCompleto}`);
        account.nombreCompleto = reqAny.body.nombreCompleto;
    }
    if (reqAny.body.telefono) {
        console.log(`   - Phone update: ${reqAny.body.telefono}`);
        account.telefono = reqAny.body.telefono;
    }
    if (reqAny.body.candidateProfile) {
        console.log(`   - Candidate Profile update:`, JSON.stringify(reqAny.body.candidateProfile));
        account.candidateProfile = {
            ...(account.candidateProfile || {}),
            ...reqAny.body.candidateProfile
        };
    }
    if (reqAny.body.employerProfile) {
        console.log(`   - Employer Profile update:`, JSON.stringify(reqAny.body.employerProfile));
        account.employerProfile = {
            ...(account.employerProfile || {}),
            ...reqAny.body.employerProfile
        };
    }

    try {
        await accountRepository.save(account);
        console.log(`✅ Profile saved successfully in Firestore`);
    } catch (error) {
        console.error(`❌ Error saving profile in Firestore:`, error);
        throw error;
    }

    return ApiResponse.success(res, account.toJSON(), 'Profile updated successfully');
});

/**
 * GET /users/:id
 * Obtiene un usuario por ID (para comunicación entre servicios)
 */
export const getUserById = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = (req as any).params;

    const account = await accountRepository.findById(new UserId(id));
    if (!account) {
        throw new AppError(404, 'User not found');
    }

    return ApiResponse.success(res, account.toJSON());
});

/**
 * PUT /users/push-token
 * Actualiza el pushToken del usuario para notificaciones
 */
export const updatePushToken = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user?.uid;
    if (!userId) {
        throw new AppError(401, 'Unauthorized');
    }

    const { pushToken } = (req as any).body;
    if (!pushToken) {
        // Permitir null para desactivar notificaciones
        // throw new AppError(400, 'Push token is required'); 
    }

    const account = await accountRepository.findById(new UserId(userId));
    if (!account) {
        throw new AppError(404, 'User not found');
    }

    account.pushToken = pushToken || null;
    await accountRepository.save(account);

    console.log(`✅ Push token updated for user ${userId}: ${pushToken}`);

    return ApiResponse.success(res, { success: true }, 'Push token updated successfully');
});
