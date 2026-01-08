import bcrypt from 'bcryptjs';
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
 * Caso de uso: Cambio de contraseña
 */
export class ChangePasswordUseCase {
    constructor(private accountRepository: IAccountRepository) { }

    async execute(userId: string, data: ChangePasswordDto): Promise<void> {
        const account = await this.accountRepository.findById(new UserId(userId));

        if (!account) {
            throw new AppError(404, 'Account not found');
        }

        // Si se proporciona currentPassword, verificarla (flujo estándar)
        // Si no, puede ser un reset forzado (flujo de contraseña temporal)
        if (data.currentPassword) {
            const isValid = await bcrypt.compare(data.currentPassword, account.passwordHash);
            if (!isValid) {
                throw new AppError(401, 'Invalid current password');
            }
        }

        const newPasswordHash = await bcrypt.hash(data.newPassword, 10);

        account.passwordHash = newPasswordHash;
        account.needsPasswordChange = false;

        await this.accountRepository.save(account);
    }
}
