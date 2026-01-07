// src/modules/matching/domain/types.ts

export interface Experiencia {
    id_experiencia: number;
    cargo: string;
    descripcion_responsabilidades: string;
    fecha_inicio: string;
    fecha_fin: string;
}

export interface Formacion {
    id_formacion: number;
    titulo_carrera: string;
    nivel_educacion: string; // Ej: Tercer Nivel, Maestría
}

export interface Postulante {
    id_postulante: number;
    nombre: string;
    ciudad: string;
    resumen_profesional: string; // Equivalente a un perfil o intro
    modalidad_preferida: string; // Campo inferido para el match (Presencial/Remoto)
    habilidades_tecnicas: string[]; // De tabla POSTULANTE_HABILIDAD
    competencias: string[];         // De tabla POSTULANTE_COMPETENCIA
    experiencia: Experiencia[];
    formacion: Formacion[];
}

export interface Oferta {
    id_oferta: number;
    titulo: string;
    descripcion: string;
    modalidad: string; // Híbrido, Remoto, Presencial
    ciudad: string;
    competencias_requeridas: string[]; // De tabla OFERTA_COMPETENCIA_REQ
    formacion_requerida: string;
    experiencia_requerida: string; // Texto descriptivo de la exp necesaria
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