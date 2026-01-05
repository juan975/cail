export interface LoginRequestDto {
    email: string;
    password: string;
}

export interface LoginResponseDto {
    idCuenta: string;
    email: string;
    nombreCompleto: string;
    tipoUsuario: string;
    token: string;
}
