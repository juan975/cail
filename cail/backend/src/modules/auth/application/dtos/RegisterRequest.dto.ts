import { TipoUsuario } from '../../domain/entities/Account.entity';

// Datos específicos del candidato (información profesional)
export interface CandidateProfileData {
    cedula: string;
    fechaNacimiento?: string;
    direccion?: string;
    ciudad: string;
    resumenProfesional?: string;
    habilidadesTecnicas?: string[];
    nivelEducacion?: string;
    titulo?: string;
    competencias?: string[];
    anosExperiencia?: string;
    resumenExperiencia?: string;
}

// Datos específicos del empleador
export interface EmployerProfileData {
    nombreEmpresa: string;
    cargo: string;
    nombreContacto: string;
    industry?: string;
    numberOfEmployees?: string;
    description?: string;
    website?: string;
    address?: string;
}

export interface RegisterRequestDto {
    email: string;
    password: string;
    nombreCompleto: string;
    telefono?: string;
    tipoUsuario: TipoUsuario;
    // Firebase UID for candidates (created client-side)
    firebaseUid?: string;
    // Datos adicionales según el tipo de usuario
    candidateData?: CandidateProfileData;
    employerData?: EmployerProfileData;
}

export interface RegisterResponseDto {
    idCuenta: string;
    email: string;
    nombreCompleto: string;
    tipoUsuario: string;
    token: string;
}
