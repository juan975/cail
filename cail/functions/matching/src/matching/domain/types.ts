// src/matching/domain/types.ts
// Entidades y contratos del dominio de Matching - Clean Architecture

// ============================================
// CATÁLOGOS PERMITIDOS (Taxonomía CAIL)
// ============================================

export const SECTORES_INDUSTRIALES = [
    'SEC_001', 'SEC_002', 'SEC_003', 'SEC_004', 'SEC_005',
    'SEC_006', 'SEC_007', 'SEC_008', 'SEC_009', 'SEC_010'
] as const;

export const NIVELES_JERARQUICOS = [
    'NIV_JUNIOR', 'NIV_SEMI_SENIOR', 'NIV_SENIOR',
    'NIV_LEAD', 'NIV_MANAGER', 'NIV_DIRECTOR'
] as const;

export type SectorIndustrial = typeof SECTORES_INDUSTRIALES[number];
export type NivelJerarquico = typeof NIVELES_JERARQUICOS[number];

// ============================================
// ENTIDADES DEL DOMINIO
// ============================================

/**
 * Entidad Postulante - Basada en el Diccionario de Datos del SAD
 * Representa al candidato en el contexto de matching
 */
export interface Postulante {
    id: string;
    nombre: string;
    habilidades_tecnicas: string[];
    id_nivel_actual: string;
    id_sector_industrial: string;
    embedding_habilidades?: number[];
}

/**
 * Entidad Oferta - Sincronizada con microservicio ofertas
 * Campos requeridos para el motor de matching híbrido
 */
export interface Oferta {
    id: string;
    titulo: string;
    descripcion: string;
    id_sector_industrial: string;
    id_nivel_requerido: string;
    // Campos adicionales sincronizados con ofertas microservice
    modalidad?: string;
    competencias_requeridas?: string[];
    habilidades_obligatorias?: OfertaSkill[];
    habilidades_deseables?: OfertaSkill[];
    // Vector embedding para búsqueda semántica (generado de título + descripción + habilidades)
    embedding_oferta?: number[];
}

/**
 * Relación Oferta-Habilidad con peso (REL_OFERTA_SKILL)
 */
export interface OfertaSkill {
    nombre: string;
    es_obligatorio: boolean;
    peso: number; // 0.0 a 1.0
}

/**
 * Entidad Postulación/Aplicación
 */
export interface Postulacion {
    id: string;
    id_postulante: string;
    id_oferta: string;
    fecha_postulacion: Date;
    estado: 'PENDIENTE' | 'EN_REVISION' | 'ACEPTADA' | 'RECHAZADA';
    match_score?: number;
}

/**
 * Resultado del matching con score detallado
 */
export interface MatchResult {
    postulante: Postulante;
    match_score: number;
    score_detalle: {
        similitud_vectorial: number;
        habilidades_obligatorias: number;
        habilidades_deseables: number;
        nivel_jerarquico: number;
    };
}

/**
 * Resultado del matching inverso: ofertas para un candidato
 * Usado en la página de descubrimiento para candidatos
 */
export interface OfferMatchResult {
    oferta: Oferta;
    match_score: number;
    score_detalle: {
        similitud_vectorial: number;
        habilidades_match: number;
        nivel_jerarquico: number;
    };
}

// ============================================
// INTERFACES DE REPOSITORIO (Contratos)
// ============================================

/**
 * Contrato para repositorio de matching
 * La infraestructura implementará esto con Firestore
 */
export interface IMatchingRepository {
    getOferta(id: string): Promise<Oferta | null>;
    buscarCandidatosSimilares(
        vector: number[],
        sectorId: string,
        limite: number
    ): Promise<Postulante[]>;
    updateVectorCandidato(id: string, vector: number[]): Promise<void>;
    // Métodos para matching inverso (ofertas para candidato)
    getPostulante(id: string): Promise<Postulante | null>;
    buscarOfertasSimilares(
        sectorId: string,
        limite: number
    ): Promise<Oferta[]>;
    buscarOfertasPorVector(
        vector: number[],
        sectorId: string,
        limite: number
    ): Promise<Oferta[]>;
}

/**
 * Contrato para repositorio de postulaciones
 */
export interface IPostulacionRepository {
    crear(postulacion: Omit<Postulacion, 'id'>): Promise<string>;
    getById(id: string): Promise<Postulacion | null>;
    getByPostulante(idPostulante: string): Promise<Postulacion[]>;
    getByOferta(idOferta: string): Promise<Postulacion[]>;
    existePostulacion(idPostulante: string, idOferta: string): Promise<boolean>;
    contarPostulacionesHoy(idPostulante: string): Promise<number>;
    updateEstado(id: string, estado: string): Promise<void>;
}

/**
 * Contrato para validación de catálogos
 */
export interface ICatalogoRepository {
    existeSector(id: string): Promise<boolean>;
    existeNivel(id: string): Promise<boolean>;
}

/**
 * Perfil de candidato para postulaciones enriquecidas
 * Subset de datos relevantes para el reclutador
 */
export interface CandidatoPerfil {
    nombreCompleto: string;
    email: string;
    telefono?: string;
    ciudad?: string;
    nivelEducativo?: string;
    resumenProfesional?: string;
    habilidadesTecnicas?: string[];
    habilidadesBlandas?: string[];
    experienciaAnios?: number | string;
    experienciaLaboral?: any[];
    cvUrl?: string;
    candidateProfile?: any;
}

/**
 * Postulación enriquecida con datos del candidato
 * Usado para la vista del reclutador
 */
export interface PostulacionConCandidato extends Postulacion {
    candidato?: CandidatoPerfil;
}

/**
 * Contrato para obtener perfiles de usuarios
 */
export interface IUsuarioRepository {
    getCandidatoPerfil(idUsuario: string): Promise<CandidatoPerfil | null>;
    getCandidatosPerfiles(idsUsuarios: string[]): Promise<Map<string, CandidatoPerfil>>;
}

// ============================================
// INTERFAZ DE EMBEDDING PROVIDER (Clean Architecture)
// ============================================

/**
 * Abstracción para generación de embeddings
 * Permite desacoplar el servicio de la implementación de IA
 */
export interface IEmbeddingProvider {
    /**
     * Genera un vector de embedding para el texto dado
     * @param text - Texto a vectorizar
     * @returns Vector numérico de embeddings
     * @throws EmbeddingError si hay fallo en la generación
     */
    generateEmbedding(text: string): Promise<number[]>;
}

// ============================================
// ERRORES DEL DOMINIO
// ============================================

export class DomainError extends Error {
    constructor(
        public code: string,
        message: string,
        public statusCode: number = 400
    ) {
        super(message);
        this.name = 'DomainError';
    }
}

export class CatalogoInvalidoError extends DomainError {
    constructor(tipo: string, id: string) {
        super(
            'CATALOGO_INVALIDO',
            `El ID '${id}' no pertenece al catálogo ${tipo}`,
            400
        );
    }
}

export class PostulacionDuplicadaError extends DomainError {
    constructor() {
        super(
            'POSTULACION_DUPLICADA',
            'Ya existe una postulación activa para esta oferta',
            409
        );
    }
}

export class LimitePostulacionesError extends DomainError {
    constructor() {
        super(
            'LIMITE_POSTULACIONES',
            'Has alcanzado el límite de 10 postulaciones por día',
            429
        );
    }
}

export class OfertaNoEncontradaError extends DomainError {
    constructor(id: string) {
        super(
            'OFERTA_NO_ENCONTRADA',
            `La oferta con ID '${id}' no existe`,
            404
        );
    }
}

export class EmbeddingError extends DomainError {
    constructor(message: string) {
        super(
            'EMBEDDING_ERROR',
            `Error generando embedding: ${message}`,
            503
        );
    }
}