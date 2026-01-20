import { IAccountRepository } from '../../domain/repositories/IAccountRepository';
import { Account } from '../../domain/entities/Account.entity';
import { Email } from '../../../../shared/domain/value-objects/Email';
import { UserId } from '../../../../shared/domain/value-objects/UserId';
import { RegisterRequestDto, RegisterResponseDto } from '../dtos/RegisterRequest.dto';
import { AppError } from '../../../../shared/infrastructure/middleware/error.middleware';
import { JwtUtil } from '../../../../shared/infrastructure/utils/jwt.util';
import { emailService } from '../../../../shared/infrastructure/services/email.service';
import { generatePassword } from '../../../../shared/utils/password-generator.util';
import { auth as firebaseAuth } from '../../../../shared/infrastructure/config/firebase.config';

export class RegisterUserUseCase {
    constructor(private accountRepository: IAccountRepository) { }

    async execute(dto: RegisterRequestDto): Promise<RegisterResponseDto> {
        const email = new Email(dto.email);

        const exists = await this.accountRepository.exists(email);
        if (exists) {
            throw new AppError(409, 'Email already registered');
        }

        let firebaseUid: string;
        let actualPassword = dto.password;
        let needsPasswordChange = false;

        // Handle different user types
        if (dto.tipoUsuario === 'RECLUTADOR') {
            // For employers: generate temporary password and create in Firebase Auth
            actualPassword = generatePassword(12);
            needsPasswordChange = true;

            console.log('🔐 Generated temporary password for employer:', dto.email);

            try {
                // Create user in Firebase Auth with temporary password
                const userRecord = await firebaseAuth.createUser({
                    email: dto.email,
                    password: actualPassword,
                    displayName: dto.nombreCompleto,
                });
                firebaseUid = userRecord.uid;
                console.log('✅ Firebase Auth user created for employer:', firebaseUid);
            } catch (firebaseError: any) {
                console.error('❌ Failed to create Firebase Auth user:', firebaseError);
                throw new AppError(500, 'Failed to create user account');
            }

            // Send email with temporary password
            try {
                await emailService.sendTemporaryPassword(
                    dto.email,
                    actualPassword,
                    dto.employerData?.nombreEmpresa || 'Empresa'
                );
                console.log('✅ Email sent successfully to:', dto.email);
            } catch (error) {
                console.error('❌ Failed to send email:', error);
                // Continue registration even if email fails
            }
        } else if (dto.tipoUsuario === 'POSTULANTE') {
            // For candidates: use the firebaseUid from the frontend (client-side creation)
            if (!dto.firebaseUid) {
                throw new AppError(400, 'Firebase UID is required for candidate registration');
            }
            firebaseUid = dto.firebaseUid;
            console.log('👤 Using client-provided Firebase UID for candidate:', firebaseUid);
        } else {
            throw new AppError(400, 'Invalid user type');
        }

        // Create account in Firestore (using Firebase UID as document ID)
        const account = new Account({
            idCuenta: new UserId(firebaseUid),
            email,
            passwordHash: '', // Not needed anymore - Firebase Auth handles passwords
            nombreCompleto: dto.nombreCompleto,
            telefono: dto.telefono,
            tipoUsuario: dto.tipoUsuario,
            fechaRegistro: new Date(),
            needsPasswordChange,
            candidateProfile: dto.candidateData,
            employerProfile: dto.employerData,
        });

        const savedAccount = await this.accountRepository.save(account);

        // Generate JWT for API access (compatible with our middleware)
        const token = JwtUtil.generateToken({
            uid: savedAccount.idCuenta.getValue(),
            email: savedAccount.email.getValue(),
            tipoUsuario: savedAccount.tipoUsuario,
        });

        return {
            idCuenta: savedAccount.idCuenta.getValue(),
            email: savedAccount.email.getValue(),
            nombreCompleto: savedAccount.nombreCompleto,
            tipoUsuario: savedAccount.tipoUsuario,
            token,
        };
    }
}
