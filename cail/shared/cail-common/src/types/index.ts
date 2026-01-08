/**
 * Tipos comunes compartidos entre microservicios CAIL
 */

/**
 * Tipos de usuario en el sistema
 */
export type TipoUsuario = 'POSTULANTE' | 'RECLUTADOR' | 'ADMIN';

/**
 * Datos básicos de cuenta
 */
export interface AccountData {
    idCuenta: string;
    email: string;
    nombreCompleto: string;
    telefono?: string;
    tipoUsuario: TipoUsuario;
    fechaRegistro: Date;
    needsPasswordChange?: boolean;
}

/**
 * Perfil de candidato/postulante
 */
export interface CandidateProfile {
    fechaNacimiento?: string;
    genero?: string;
    direccion?: string;
    ciudad?: string;
    pais?: string;
    modalidad_preferida?: string;
    habilidades_tecnicas?: string[];
    competencias?: string[];
    experiencia?: ExperienciaLaboral[];
    formacion?: FormacionAcademica[];
}

/**
 * Experiencia laboral
 */
export interface ExperienciaLaboral {
    empresa: string;
    cargo: string;
    fechaInicio: string;
    fechaFin?: string;
    descripcion_responsabilidades: string;
    actualmenteAqui?: boolean;
}

/**
 * Formación académica
 */
export interface FormacionAcademica {
    institucion: string;
    titulo_carrera: string;
    fechaInicio: string;
    fechaFin?: string;
    estado: 'EN_CURSO' | 'COMPLETADO' | 'ABANDONADO';
}

/**
 * Perfil de empleador/reclutador
 */
export interface EmployerProfile {
    nombreEmpresa: string;
    cargo?: string;
    sector?: string;
    tamanoEmpresa?: string;
    descripcionEmpresa?: string;
    sitioWeb?: string;
}

/**
 * Oferta laboral
 */
export interface Oferta {
    idOferta: string;
    titulo: string;
    descripcion: string;
    empresa: string;
    ciudad: string;
    modalidad: string;
    tipoContrato: string;
    salarioMin?: number;
    salarioMax?: number;
    experiencia_requerida: string;
    formacion_requerida: string;
    competencias_requeridas: string[];
    fechaPublicacion: Date;
    fechaCierre?: Date;
    estado: 'ACTIVA' | 'CERRADA' | 'PAUSADA';
    idReclutador: string;
}

/**
 * Resultado de matching
 */
export interface MatchResult {
    idPostulante: string;
    idOferta: string;
    score: number;
    detalles: {
        habilidades: number;
        experiencia: number;
        logistica: number;
        formacion: number;
    };
    fechaCalculo: Date;
}

/**
 * Aplicación a oferta
 */
export interface Aplicacion {
    idAplicacion: string;
    idPostulante: string;
    idOferta: string;
    fechaAplicacion: Date;
    estado: 'PENDIENTE' | 'EN_REVISION' | 'ACEPTADA' | 'RECHAZADA';
    matchScore?: number;
}
