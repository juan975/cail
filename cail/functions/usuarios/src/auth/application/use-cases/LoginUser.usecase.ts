import { IAccountRepository } from '../../domain/repositories/IAccountRepository';
import { Email } from '../../../shared/domain/value-objects/Email';
import { UserId } from '../../../shared/domain/value-objects/UserId';
import { AppError } from '../../../shared/middleware/error.middleware';

/**
 * DTO de respuesta para obtener perfil
 */
export interface GetProfileResponseDto {
    idCuenta: string;
    email: string;
    nombreCompleto: string;
    tipoUsuario: string;
    needsPasswordChange?: boolean;
    telefono?: string;
    candidateProfile?: any;
    employerProfile?: any;
}

/**
 * Caso de uso: Obtener perfil de usuario
 * 
 * Con Firebase Auth, el login ocurre directamente entre el frontend y Firebase.
 * Este caso de uso ahora solo obtiene los datos del perfil del usuario ya autenticado.
 * 
 * Flujo:
 *   1. Frontend hace login con Firebase Auth (signInWithEmailAndPassword)
 *   2. Frontend obtiene ID Token de Firebase
 *   3. Frontend llama a /users/profile con el ID Token
 *   4. Backend valida el token y retorna el perfil de Firestore
 */
export class LoginUserUseCase {
    constructor(private accountRepository: IAccountRepository) { }

    /**
     * Obtiene el perfil del usuario por email
     * Usado después del login exitoso con Firebase Auth
     */
    async getProfileByEmail(email: string): Promise<GetProfileResponseDto> {
        const account = await this.accountRepository.findByEmail(new Email(email));

        if (!account) {
            throw new AppError(404, 'User profile not found. Please complete registration.');
        }

        return {
            idCuenta: account.idCuenta.getValue(),
            email: account.email.getValue(),
            nombreCompleto: account.nombreCompleto,
            tipoUsuario: account.tipoUsuario,
            needsPasswordChange: account.needsPasswordChange,
            telefono: account.telefono,
            candidateProfile: account.candidateProfile,
            employerProfile: account.employerProfile,
        };
    }

    /**
     * Obtiene el perfil del usuario por UID de Firebase
     * Preferido ya que usa el UID directamente
     */
    async getProfileByUid(uid: string): Promise<GetProfileResponseDto> {
        const account = await this.accountRepository.findById(new UserId(uid));

        if (!account) {
            throw new AppError(404, 'User profile not found. Please complete registration.');
        }

        return {
            idCuenta: account.idCuenta.getValue(),
            email: account.email.getValue(),
            nombreCompleto: account.nombreCompleto,
            tipoUsuario: account.tipoUsuario,
            needsPasswordChange: account.needsPasswordChange,
            telefono: account.telefono,
            candidateProfile: account.candidateProfile,
            employerProfile: account.employerProfile,
        };
    }
}
