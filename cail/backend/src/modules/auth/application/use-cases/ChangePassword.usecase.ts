import { IAccountRepository } from '../../domain/repositories/IAccountRepository';
import { AppError } from '../../../../shared/infrastructure/middleware/error.middleware';
import { UserId } from '../../../../shared/domain/value-objects/UserId';
import { auth as firebaseAuth } from '../../../../shared/infrastructure/config/firebase.config';

export class ChangePasswordUseCase {
    constructor(private accountRepository: IAccountRepository) { }

    async execute(userId: string, data: { currentPassword?: string, newPassword: string }): Promise<void> {
        const account = await this.accountRepository.findById(new UserId(userId));

        if (!account) {
            throw new AppError(404, 'Account not found');
        }

        try {
            // Update password in Firebase Auth
            await firebaseAuth.updateUser(userId, {
                password: data.newPassword,
            });
            console.log('✅ Firebase Auth password updated for user:', userId);
        } catch (firebaseError: any) {
            console.error('❌ Failed to update Firebase Auth password:', firebaseError);
            throw new AppError(500, 'Failed to update password');
        }

        // Clear password change flag in Firestore
        account.needsPasswordChange = false;
        await this.accountRepository.save(account);

        console.log('✅ Password change completed for user:', userId);
    }
}
