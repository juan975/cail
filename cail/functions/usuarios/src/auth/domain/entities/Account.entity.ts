import { Email } from '../../../shared/domain/value-objects/Email';
import { UserId } from '../../../shared/domain/value-objects/UserId';

/**
 * Tipos de usuario en el sistema
 */
export enum TipoUsuario {
    POSTULANTE = 'POSTULANTE',
    RECLUTADOR = 'RECLUTADOR',
    ADMINISTRADOR = 'ADMINISTRADOR',
}

/**
 * Perfil del candidato/postulante
 */
export interface CandidateProfile {
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
 * Perfil del empleador/reclutador
 */
export interface EmployerProfile {
    nombreEmpresa: string;
    cargo: string;
    nombreContacto: string;
    ruc?: string;
    industry?: string;
    numberOfEmployees?: string;
    description?: string;
    website?: string;
    address?: string;
    companyValidationStatus?: 'PENDIENTE' | 'VERIFICADA' | 'RECHAZADA';
    // Estado de autorización del usuario reclutador (Supervisor Validation)
    status?: 'ACTIVO' | 'PENDIENTE' | 'NO_AUTORIZADO';
    // Campos para verificación de email (Magic Link)
    emailVerified?: boolean;
    emailVerificationToken?: string;
    emailVerificationExpiry?: Date;
}

/**
 * Propiedades de la entidad Account
 */
export interface AccountProps {
    idCuenta: UserId;
    email: Email;
    passwordHash: string;
    nombreCompleto: string;
    telefono?: string;
    tipoUsuario: TipoUsuario;
    fechaRegistro: Date;
    needsPasswordChange?: boolean;
    candidateProfile?: CandidateProfile;
    employerProfile?: EmployerProfile;
}

/**
 * Entidad Account (Cuenta de Usuario)
 * Aggregate Root del dominio de usuarios
 */
export class Account {
    private props: AccountProps;

    constructor(props: AccountProps) {
        this.props = props;
    }

    get idCuenta(): UserId {
        return this.props.idCuenta;
    }

    get email(): Email {
        return this.props.email;
    }

    get passwordHash(): string {
        return this.props.passwordHash;
    }

    set passwordHash(value: string) {
        this.props.passwordHash = value;
    }

    get nombreCompleto(): string {
        return this.props.nombreCompleto;
    }

    set nombreCompleto(value: string) {
        this.props.nombreCompleto = value;
    }

    get telefono(): string | undefined {
        return this.props.telefono;
    }

    set telefono(value: string | undefined) {
        this.props.telefono = value;
    }

    get tipoUsuario(): TipoUsuario {
        return this.props.tipoUsuario;
    }

    get fechaRegistro(): Date {
        return this.props.fechaRegistro;
    }

    get needsPasswordChange(): boolean | undefined {
        return this.props.needsPasswordChange;
    }

    set needsPasswordChange(value: boolean | undefined) {
        this.props.needsPasswordChange = value;
    }

    get candidateProfile(): CandidateProfile | undefined {
        return this.props.candidateProfile;
    }

    set candidateProfile(value: CandidateProfile | undefined) {
        this.props.candidateProfile = value;
    }

    get employerProfile(): EmployerProfile | undefined {
        return this.props.employerProfile;
    }

    set employerProfile(value: EmployerProfile | undefined) {
        this.props.employerProfile = value;
    }

    /**
     * Convierte la entidad a un objeto JSON seguro (sin passwordHash)
     */
    toJSON() {
        return {
            idCuenta: this.idCuenta.getValue(),
            email: this.email.getValue(),
            nombreCompleto: this.nombreCompleto,
            telefono: this.telefono,
            tipoUsuario: this.tipoUsuario,
            fechaRegistro: this.fechaRegistro,
            candidateProfile: this.candidateProfile,
            employerProfile: this.employerProfile,
        };
    }
}
