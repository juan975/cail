import { TipoUsuario } from '../../domain/entities/Account.entity';

/**
 * Datos específicos del candidato para registro
 */
export interface CandidateProfileData {
    cedula: string;
    fechaNacimiento?: string;
    direccion?: string;
    ciudad: string;
    resumenProfesional?: string;
    habilidadesTecnicas?: string[];
    softSkills?: string[];
    nivelEducacion?: string;
    titulo?: string;
    competencias?: string[];
    anosExperiencia?: string;
    resumenExperiencia?: string;
    cvUrl?: string;
}

/**
 * Datos específicos del empleador para registro
 */
export interface EmployerProfileData {
    nombreEmpresa: string;
    cargo: string;
    nombreContacto: string;
    ruc?: string; // RUC para validación contra colección empresas
    industry?: string;
    numberOfEmployees?: string;
    description?: string;
    website?: string;
    address?: string;
    companyValidationStatus?: 'PENDIENTE' | 'VERIFICADA' | 'RECHAZADA';
    // Campos para verificación de email (Magic Link)
    emailVerified?: boolean;
    emailVerificationToken?: string;
    emailVerificationExpiry?: Date;
}

/**
 * DTO de solicitud de registro
 * 
 * Para CANDIDATOS: el frontend crea el usuario en Firebase Auth primero
 *                  y envía el firebaseUid
 * Para EMPLEADORES: el backend crea el usuario en Firebase Auth con
 *                   contraseña temporal (password no se usa)
 */
export interface RegisterRequestDto {
    email: string;
    password?: string; // Opcional - solo para compatibilidad, Firebase Auth lo maneja
    nombreCompleto: string;
    telefono?: string;
    tipoUsuario: TipoUsuario;
    firebaseUid?: string; // UID del usuario creado en Firebase Auth por el frontend
    candidateData?: CandidateProfileData;
    employerData?: EmployerProfileData;
}

/**
 * DTO de respuesta de registro
 */
export interface RegisterResponseDto {
    idCuenta: string;
    email: string;
    nombreCompleto: string;
    tipoUsuario: string;
    token: string;
    needsPasswordChange?: boolean;
}
