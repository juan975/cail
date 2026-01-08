import bcrypt from 'bcryptjs';
import { IAccountRepository } from '../../domain/repositories/IAccountRepository';
import { Account } from '../../domain/entities/Account.entity';
import { Email } from '../../../../shared/domain/value-objects/Email';
import { UserId } from '../../../../shared/domain/value-objects/UserId';
import { RegisterRequestDto, RegisterResponseDto } from '../dtos/RegisterRequest.dto';
import { AppError } from '../../../../shared/infrastructure/middleware/error.middleware';
import { JwtUtil } from '../../../../shared/infrastructure/utils/jwt.util';
import { emailService } from '../../../../shared/infrastructure/services/email.service';
import { generatePassword } from '../../../../shared/utils/password-generator.util';

export class RegisterUserUseCase {
    constructor(private accountRepository: IAccountRepository) { }

    async execute(dto: RegisterRequestDto): Promise<RegisterResponseDto> {
        const email = new Email(dto.email);

        const exists = await this.accountRepository.exists(email);
        if (exists) {
            throw new AppError(409, 'Email already registered');
        }

        // For employers, generate temporary password and send email
        let actualPassword = dto.password;
        let needsPasswordChange = false;

        if (dto.tipoUsuario === 'RECLUTADOR') {
            actualPassword = generatePassword(12);
            needsPasswordChange = true;

            console.log('🔐 Generated temporary password for employer:', dto.email);
            console.log('📧 Attempting to send email...');

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
                console.error('Error details:', JSON.stringify(error, null, 2));
                // Continue registration even if email fails
            }
        }

        const passwordHash = await bcrypt.hash(actualPassword, 10);

        const account = new Account({
            idCuenta: new UserId(this.generateId()),
            email,
            passwordHash,
            nombreCompleto: dto.nombreCompleto,
            telefono: dto.telefono,
            tipoUsuario: dto.tipoUsuario,
            fechaRegistro: new Date(),
            needsPasswordChange,
            // Agregar perfiles según el tipo de usuario
            candidateProfile: dto.candidateData,
            employerProfile: dto.employerData,
        });

        const savedAccount = await this.accountRepository.save(account);

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

    private generateId(): string {
        return `account_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
}
