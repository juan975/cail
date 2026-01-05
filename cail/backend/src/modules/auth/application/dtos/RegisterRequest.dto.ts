import { TipoUsuario } from '../../domain/entities/Account.entity';

export interface RegisterRequestDto {
    email: string;
    password: string;
    nombreCompleto: string;
    telefono?: string;
    tipoUsuario: TipoUsuario;
}

export interface RegisterResponseDto {
    idCuenta: string;
    email: string;
    nombreCompleto: string;
    tipoUsuario: string;
    token: string;
}
