import bcrypt from 'bcryptjs';
import { IAccountRepository } from '../../domain/repositories/IAccountRepository';
import { AppError } from '../../../../shared/infrastructure/middleware/error.middleware';
import { UserId } from '../../../../shared/domain/value-objects/UserId';

export class ChangePasswordUseCase {
    constructor(private accountRepository: IAccountRepository) { }

    async execute(userId: string, data: { currentPassword?: string, newPassword: string }): Promise<void> {
        const account = await this.accountRepository.findById(new UserId(userId));

        if (!account) {
            throw new AppError(404, 'Account not found');
        }

        // If currentPassword is provided, verify it (standard flow)
        // If not, it might be a forced reset (employer temporary password flow)
        if (data.currentPassword) {
            const isValid = await bcrypt.compare(data.currentPassword, account.passwordHash);
            if (!isValid) {
                throw new AppError(401, 'Invalid current password');
            }
        }

        const newPasswordHash = await bcrypt.hash(data.newPassword, 10);

        // Update account with new hash and clear password change flag
        // Note: We need a way to update only these fields in the repo or save the whole entity
        account.passwordHash = newPasswordHash;
        account.needsPasswordChange = false;

        await this.accountRepository.save(account);
    }
}
