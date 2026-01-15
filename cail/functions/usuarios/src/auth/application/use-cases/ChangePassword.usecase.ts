import { IAccountRepository } from '../../domain/repositories/IAccountRepository';
import { AppError } from '../../../shared/middleware/error.middleware';
import { UserId } from '../../../shared/domain/value-objects/UserId';

/**
 * Caso de uso: Confirmar cambio de contraseña
 * 
 * Con Firebase Auth, el cambio de contraseña ocurre directamente en el frontend
 * usando el SDK de Firebase (updatePassword).
 * 
 * Este endpoint solo actualiza el flag needsPasswordChange en Firestore.
 * 
 * Flujo:
 *   1. Frontend cambia contraseña con Firebase Auth (reauthenticateWithCredential + updatePassword)
 *   2. Frontend llama a /auth/password-changed
 *   3. Backend actualiza needsPasswordChange: false en Firestore
 */
export class ChangePasswordUseCase {
    constructor(private accountRepository: IAccountRepository) { }

    /**
     * Marca que el usuario ya cambió su contraseña
     * Se llama después de que el frontend haya cambiado la contraseña en Firebase Auth
     */
    async confirmPasswordChanged(userId: string): Promise<void> {
        const account = await this.accountRepository.findById(new UserId(userId));

        if (!account) {
            throw new AppError(404, 'Account not found');
        }

        // Solo actualizar el flag
        account.needsPasswordChange = false;
        await this.accountRepository.save(account);

        console.log('✅ Password change confirmed for user:', userId);
    }
}
