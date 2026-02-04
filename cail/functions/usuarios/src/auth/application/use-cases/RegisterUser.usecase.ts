import { getAuth } from '../../../config/firebase.config';
import { IAccountRepository } from '../../domain/repositories/IAccountRepository';
import { IEmpresaRepository } from '../../domain/repositories/IEmpresaRepository';
import { Account, TipoUsuario } from '../../domain/entities/Account.entity';
import { Email } from '../../../shared/domain/value-objects/Email';
import { UserId } from '../../../shared/domain/value-objects/UserId';
import { RegisterRequestDto, RegisterResponseDto } from '../dtos/RegisterRequest.dto';
import { AppError } from '../../../shared/middleware/error.middleware';
import { emailService } from '../../../shared/services/email.service';
import { generatePassword } from '../../../shared/utils/password-generator.util';
import crypto from 'crypto';

/**
 * Caso de uso: Registro de usuario con Firebase Authentication
 * 
 * POSTULANTES: Frontend crea usuario en Firebase Auth, envía firebaseUid al backend
 * RECLUTADORES: Backend crea usuario en Firebase Auth, valida RUC contra colección empresas,
 *              envía Magic Link para verificación de email.
 */
export class RegisterUserUseCase {
    constructor(
        private accountRepository: IAccountRepository,
        private empresaRepository?: IEmpresaRepository
    ) { }

    /**
     * Genera un token único para verificación de email
     */
    private generateVerificationToken(): string {
        return crypto.randomBytes(32).toString('hex');
    }

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
        let companyValidationStatus: 'PENDIENTE' | 'VERIFICADA' | 'RECHAZADA' = 'PENDIENTE';

        // Para RECLUTADORES: crear (o recuperar) usuario en Firebase Auth y enviar magic link de verificación
        if (dto.tipoUsuario === TipoUsuario.RECLUTADOR) {
            const auth = getAuth();
            // Use password provided by user (no more temp password)
            const userPassword = dto.password;
            if (!userPassword || userPassword.length < 6) {
                throw new AppError(400, 'Password is required and must be at least 6 characters');
            }
            needsPasswordChange = false; // User already set their password

            // 🔐 VALIDACIÓN DE RUC contra colección empresas
            if (this.empresaRepository && dto.employerData?.ruc) {
                const ruc = dto.employerData.ruc;
                console.log('🔍 Validando RUC contra colección empresas:', ruc);

                const empresaValida = await this.empresaRepository.existeEmpresaActiva(ruc);

                if (empresaValida) {
                    companyValidationStatus = 'VERIFICADA';
                    console.log('✅ RUC verificado exitosamente:', ruc);
                } else {
                    companyValidationStatus = 'PENDIENTE';
                    console.log('⚠️ RUC no encontrado o empresa inactiva, marcado como PENDIENTE:', ruc);
                }
            } else {
                // Sin RUC proporcionado o sin repositorio, queda pendiente
                companyValidationStatus = 'PENDIENTE';
                console.log('⚠️ Sin RUC para validar, companyValidationStatus = PENDIENTE');
            }

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
                        // Usuario no existe, lo creamos con la contraseña del usuario
                        console.log('User not found in Auth, creating new...');
                        const userRecord = await auth.createUser({
                            email: dto.email,
                            password: userPassword,
                            displayName: dto.nombreCompleto,
                            emailVerified: false, // Se marcará true al hacer clic en el magic link
                        });
                        firebaseUid = userRecord.uid;
                        console.log('🔐 Created Firebase Auth user for employer:', dto.email, 'UID:', firebaseUid);
                    } else {
                        throw error; // Otro error real
                    }
                }

                // 🔗 GENERAR TOKEN DE VERIFICACIÓN Y ENVIAR MAGIC LINK
                // El token es único y expira en 24 horas
                const verificationToken = this.generateVerificationToken();
                const tokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 horas

                // Guardar token en Firestore para validación posterior
                // Se guardará junto con el perfil del usuario más abajo

                try {
                    // Determinar email del supervisor (Fallback a admin hardcoded si no hay env var)
                    let supervisorEmail = process.env.SUPERVISOR_EMAIL || 'admin@cail.com';

                    // Intentar obtener el email de contacto de la empresa para autorización corporativa
                    if (dto.employerData?.ruc && this.empresaRepository) {
                        try {
                            const empresa = await this.empresaRepository.getByRuc(dto.employerData.ruc);
                            if (empresa?.emailContacto) {
                                supervisorEmail = empresa.emailContacto;
                                console.log('🏢 Using Company Contact Email for Authorization:', supervisorEmail);
                            } else {
                                console.log('⚠️ Company found but has no contact email, using default Supervisor Email:', supervisorEmail);
                            }
                        } catch (err) {
                            console.warn('⚠️ Error fetching company email:', err);
                        }
                    }

                    // Enviar solicitud de autorización al Supervisor (o Email de Empresa)

                    // Enviar solicitud de autorización al Supervisor en lugar del Magic Link al usuario
                    await emailService.sendAuthorizationRequest(
                        supervisorEmail,
                        dto.nombreCompleto,
                        dto.employerData?.nombreEmpresa || 'Empresa No Especificada',
                        dto.employerData?.ruc || 'N/A',
                        verificationToken
                    );
                    console.log(`✅ Authorization request sent to supervisor (${supervisorEmail}) for:`, dto.email);

                    // Guardar los datos del token y estado PENDIENTE
                    dto.employerData = {
                        ...dto.employerData!,
                        emailVerificationToken: verificationToken,
                        emailVerificationExpiry: tokenExpiry,
                        emailVerified: false, // Se marcará true cuando el supervisor autorice
                        status: 'PENDIENTE', // Nuevo estado explícito
                    };
                } catch (emailError) {
                    console.error('⚠️ Failed to send verification email:', emailError);
                    // Continuar aunque falle el email (el usuario puede pedir reenvío luego)
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

        // Agregar companyValidationStatus al employerData si es reclutador
        const employerData = dto.employerData ? {
            ...dto.employerData,
            companyValidationStatus
        } : undefined;

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
            employerProfile: employerData,
        });

        await this.accountRepository.save(account);
        console.log('✅ User profile created in Firestore:', firebaseUid, 'Type:', dto.tipoUsuario);
        if (dto.tipoUsuario === TipoUsuario.RECLUTADOR) {
            console.log('   Company validation status:', companyValidationStatus);
        }

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

