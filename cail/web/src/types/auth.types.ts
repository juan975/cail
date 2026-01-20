// TypeScript types for authentication API

export interface LoginRequest {
    email: string;
    password: string;
}

export interface LoginResponse {
    idCuenta: string;
    email: string;
    nombreCompleto: string;
    tipoUsuario: 'POSTULANTE' | 'RECLUTADOR' | 'ADMINISTRADOR';
    token: string;
    needsPasswordChange?: boolean;
}

// Candidate profile data
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

// Employer profile data
export interface EmployerProfileData {
    nombreEmpresa: string;
    cargo: string;
    nombreContacto: string;
}

export interface RegisterRequest {
    email: string;
    password: string;
    nombreCompleto: string;
    telefono?: string;
    tipoUsuario: 'POSTULANTE' | 'RECLUTADOR';
    candidateData?: CandidateProfileData;
    employerData?: EmployerProfileData;
    firebaseUid?: string; // UID from Firebase Auth when creating user client-side
}

export interface RegisterResponse {
    idCuenta: string;
    email: string;
    nombreCompleto: string;
    tipoUsuario: string;
    token: string;
}

export interface ApiError {
    status: number;
    message: string;
    details?: any;
}
