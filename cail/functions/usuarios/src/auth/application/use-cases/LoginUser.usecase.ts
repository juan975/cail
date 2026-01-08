import bcrypt from 'bcryptjs';
import { IAccountRepository } from '../../domain/repositories/IAccountRepository';
import { Email } from '../../../shared/domain/value-objects/Email';
import { LoginRequestDto, LoginResponseDto } from '../dtos/LoginRequest.dto';
import { AppError } from '../../../shared/middleware/error.middleware';
import { JwtUtil } from '../../../shared/utils/jwt.util';

/**
 * Caso de uso: Login de usuario
 */
export class LoginUserUseCase {
    constructor(private accountRepository: IAccountRepository) { }

    async execute(dto: LoginRequestDto): Promise<LoginResponseDto> {
        const email = new Email(dto.email);

        const account = await this.accountRepository.findByEmail(email);
        if (!account) {
            throw new AppError(401, 'Invalid credentials');
        }

        const isPasswordValid = await bcrypt.compare(dto.password, account.passwordHash);
        if (!isPasswordValid) {
            throw new AppError(401, 'Invalid credentials');
        }

        const token = JwtUtil.generateToken({
            uid: account.idCuenta.getValue(),
            email: account.email.getValue(),
            tipoUsuario: account.tipoUsuario,
        });

        return {
            idCuenta: account.idCuenta.getValue(),
            email: account.email.getValue(),
            nombreCompleto: account.nombreCompleto,
            tipoUsuario: account.tipoUsuario,
            token,
            needsPasswordChange: account.needsPasswordChange,
        };
    }
}
