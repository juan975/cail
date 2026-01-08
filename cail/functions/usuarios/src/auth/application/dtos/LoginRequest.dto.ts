/**
 * DTO de solicitud de login
 */
export interface LoginRequestDto {
    email: string;
    password: string;
}

/**
 * DTO de respuesta de login
 */
export interface LoginResponseDto {
    idCuenta: string;
    email: string;
    nombreCompleto: string;
    tipoUsuario: string;
    token: string;
    needsPasswordChange?: boolean;
}
