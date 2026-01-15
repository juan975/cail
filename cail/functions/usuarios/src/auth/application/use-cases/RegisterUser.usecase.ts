import { getAuth } from '../../../config/firebase.config';
import { IAccountRepository } from '../../domain/repositories/IAccountRepository';
import { Account, TipoUsuario } from '../../domain/entities/Account.entity';
import { Email } from '../../../shared/domain/value-objects/Email';
import { UserId } from '../../../shared/domain/value-objects/UserId';
import { RegisterRequestDto, RegisterResponseDto } from '../dtos/RegisterRequest.dto';
import { AppError } from '../../../shared/middleware/error.middleware';
import { emailService } from '../../../shared/services/email.service';
import { generatePassword } from '../../../shared/utils/password-generator.util';

/**
 * Caso de uso: Registro de usuario con Firebase Authentication
 * 
 * POSTULANTES: Frontend crea usuario en Firebase Auth, envía firebaseUid al backend
 * RECLUTADORES: Backend crea usuario en Firebase Auth y envía LINK DE RESET de contraseña.
 *              - Maneja usuarios huérfanos (Auth existe, Firestore no) recuperándolos.
 */
export class RegisterUserUseCase {
    constructor(private accountRepository: IAccountRepository) { }

    async execute(dto: RegisterRequestDto): Promise<RegisterResponseDto> {
        console.log('RegisterUserUseCase started for:', dto.email, 'Type:', dto.tipoUsuario);

        const email = new Email(dto.email);

        // 1. Verificar si ya existe en nuestra DB de perfiles (Firestore) PRIMERO
        // Esto evita duplicados reales
        const exists = await this.accountRepository.exists(email);
        if (exists) {
            console.warn('Email already registered in profile database:', dto.email);
            throw new AppError(409, 'Email already registered in profile database');
        }

        let firebaseUid = dto.firebaseUid;
        let needsPasswordChange = false;

        // Para RECLUTADORES: crear (o recuperar) usuario en Firebase Auth y enviar link de password
        if (dto.tipoUsuario === TipoUsuario.RECLUTADOR) {
            const auth = getAuth();
            const tempPassword = generatePassword(16); // Contraseña inicial compleja (no se envía)
            needsPasswordChange = true;

            try {
                // Verificar si ya existe en Firebase Auth
                try {
                    console.log('Checking if user exists in Firebase Auth...');
                    const existingUser = await auth.getUserByEmail(dto.email);

                    // Si llegamos aquí, el usuario existe en Auth pero NO en Firestore (pasó el chequeo #1)
                    // Es un usuario "huérfano" o creado por el frontend erróneamente. Lo recuperamos.
                    console.log('⚠️ Orphan Auth user found, recovering UID:', existingUser.uid);
                    firebaseUid = existingUser.uid;

                } catch (error: any) {
                    if (error.code === 'auth/user-not-found') {
                        // Usuario no existe, lo creamos
                        console.log('User not found in Auth, creating new...');
                        const userRecord = await auth.createUser({
                            email: dto.email,
                            password: tempPassword,
                            displayName: dto.nombreCompleto,
                            emailVerified: false,
                        });
                        firebaseUid = userRecord.uid;
                        console.log('🔐 Created Firebase Auth user for employer:', dto.email, 'UID:', firebaseUid);
                    } else {
                        throw error; // Otro error real
                    }
                }

                // Enviar contraseña temporal por email
                // Esta contraseña es la misma que se usó para crear el usuario en Firebase Auth
                try {
                    await emailService.sendTemporaryPassword(
                        dto.email,
                        tempPassword,
                        dto.employerData?.nombreEmpresa || dto.nombreCompleto
                    );
                    console.log('✅ Temporary password sent to:', dto.email);
                } catch (emailError) {
                    console.error('⚠️ Failed to send email:', emailError);
                    // Continuar aunque falle el email (el usuario puede pedir reset manual luego)
                }
            } catch (error: any) {
                if (error instanceof AppError) throw error;
                console.error('Firebase Auth error:', error);
                throw new AppError(500, 'Failed to create/recover employer account: ' + (error.message || 'Unknown error'));
            }
        }

        // Para POSTULANTES: validar que el frontend envió el firebaseUid
        if (dto.tipoUsuario === TipoUsuario.POSTULANTE) {
            if (!firebaseUid) {
                throw new AppError(400, 'Firebase UID is required for candidates');
            }
        }

        if (!firebaseUid) {
            throw new AppError(400, 'Firebase UID could not be determined');
        }

        // Crear cuenta/perfil en Firestore
        const account = new Account({
            idCuenta: new UserId(firebaseUid),
            email,
            passwordHash: '', // Firebase Auth maneja la autenticación
            nombreCompleto: dto.nombreCompleto,
            telefono: dto.telefono,
            tipoUsuario: dto.tipoUsuario,
            fechaRegistro: new Date(),
            needsPasswordChange,
            candidateProfile: dto.candidateData,
            employerProfile: dto.employerData,
        });

        await this.accountRepository.save(account);
        console.log('✅ User profile created in Firestore:', firebaseUid, 'Type:', dto.tipoUsuario);

        return {
            idCuenta: firebaseUid,
            email: dto.email,
            nombreCompleto: dto.nombreCompleto,
            tipoUsuario: dto.tipoUsuario,
            token: '',
            needsPasswordChange,
        };
    }
}
