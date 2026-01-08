/**
 * Tipos para el módulo de Matching
 */

export interface Postulante {
    idPostulante: string;
    nombreCompleto: string;
    email: string;
    ciudad: string;
    modalidad_preferida: string;
    habilidades_tecnicas: string[];
    competencias: string[];
    experiencia: ExperienciaLaboral[];
    formacion: FormacionAcademica[];
}

export interface ExperienciaLaboral {
    empresa: string;
    cargo: string;
    fechaInicio: string;
    fechaFin?: string;
    descripcion_responsabilidades: string;
}

export interface FormacionAcademica {
    institucion: string;
    titulo_carrera: string;
    fechaInicio: string;
    fechaFin?: string;
    estado: string;
}

export interface Oferta {
    idOferta: string;
    titulo: string;
    descripcion: string;
    empresa: string;
    ciudad: string;
    modalidad: string;
    experiencia_requerida: string;
    formacion_requerida: string;
    competencias_requeridas: string[];
}

export interface MatchResult {
    postulante: Postulante;
    score: number;
    detalles: {
        habilidades: number;
        experiencia: number;
        logistica: number;
        formacion: number;
    };
}

export interface Aplicacion {
    idAplicacion: string;
    idPostulante: string;
    idOferta: string;
    fechaAplicacion: Date;
    estado: 'PENDIENTE' | 'EN_REVISION' | 'ACEPTADA' | 'RECHAZADA';
    matchScore?: number;
}
