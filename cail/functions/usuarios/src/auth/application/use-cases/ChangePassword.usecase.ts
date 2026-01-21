import { getAuth } from '../../../config/firebase.config';
import { IAccountRepository } from '../../domain/repositories/IAccountRepository';
import { AppError } from '../../../shared/middleware/error.middleware';
import { UserId } from '../../../shared/domain/value-objects/UserId';

/**
 * DTO para cambio de contraseña
 */
export interface ChangePasswordDto {
    currentPassword?: string;
    newPassword: string;
}

/**
 * Caso de uso: Cambio de contraseña usando Firebase Auth
 * 
 * El backend actualiza la contraseña directamente en Firebase Auth usando Admin SDK.
 * Esto funciona tanto para candidatos como empleadores.
 */
export class ChangePasswordUseCase {
    constructor(private accountRepository: IAccountRepository) { }

    async execute(userId: string, data: ChangePasswordDto): Promise<void> {
        console.log('ChangePassword started for userId:', userId);

        const account = await this.accountRepository.findById(new UserId(userId));

        if (!account) {
            throw new AppError(404, 'Account not found');
        }

        try {
            // Update password in Firebase Auth using Admin SDK
            const auth = getAuth();
            await auth.updateUser(userId, {
                password: data.newPassword,
            });
            console.log('✅ Firebase Auth password updated for user:', userId);
        } catch (firebaseError: any) {
            console.error('❌ Failed to update Firebase Auth password:', firebaseError);
            throw new AppError(500, 'Failed to update password: ' + (firebaseError.message || 'Unknown error'));
        }

        // Clear password change flag in Firestore
        account.needsPasswordChange = false;
        await this.accountRepository.save(account);

        console.log('✅ Password change completed for user:', userId);
    }
}
