/**
 * TypeScript types for authentication API
 * 
 * Actualizado para Firebase Authentication
 */

// =========================================
// Request Types
// =========================================

/** @deprecated Firebase Auth maneja el login directamente */
export interface LoginRequest {
    email: string;
    password: string;
}

export interface RegisterRequest {
    email: string;
    password: string;
    nombreCompleto: string;
    telefono?: string;
    tipoUsuario: 'POSTULANTE' | 'RECLUTADOR';
    candidateData?: CandidateProfileData;
    employerData?: EmployerProfileData;
    firebaseUid?: string; // Para candidatos: UID del usuario creado en Firebase Auth
}

// =========================================
// Response Types
// =========================================

export interface LoginResponse {
    idCuenta: string;
    email: string;
    nombreCompleto: string;
    tipoUsuario: 'POSTULANTE' | 'RECLUTADOR' | 'ADMINISTRADOR';
    token: string; // Firebase ID Token
    needsPasswordChange?: boolean;
}

export interface RegisterResponse {
    idCuenta: string;
    email: string;
    nombreCompleto: string;
    tipoUsuario: string;
    token: string;
    needsPasswordChange?: boolean;
}

export interface ProfileResponse {
    idCuenta: string;
    email: string;
    nombreCompleto: string;
    tipoUsuario: string;
    needsPasswordChange?: boolean;
    telefono?: string;
    candidateProfile?: CandidateProfileData;
    employerProfile?: EmployerProfileData;
}

// =========================================
// Profile Data Types
// =========================================

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
    experienciaLaboral?: WorkExperienceData[];
}

export interface WorkExperienceData {
    id?: string;
    company: string;
    position: string;
    startDate: string;
    endDate?: string;
    isCurrent: boolean;
    description: string;
}

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

// =========================================
// Error Types
// =========================================

export interface ApiError {
    status: number;
    message: string;
    details?: any;
}

// =========================================
// Firebase Auth Types (re-export for convenience)
// =========================================

export interface FirebaseUser {
    uid: string;
    email: string | null;
    displayName: string | null;
    emailVerified: boolean;
}
