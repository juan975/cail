// src/matching/services/matching.service.ts
// Servicio de Matching con Clean Architecture y scoring completo

import {
    IMatchingRepository,
    IPostulacionRepository,
    ICatalogoRepository,
    IEmbeddingProvider,
    Postulante,
    Oferta,
    MatchResult,
    Postulacion,
    OfertaNoEncontradaError,
    CatalogoInvalidoError,
    PostulacionDuplicadaError,
    LimitePostulacionesError
} from '../domain/types';

/**
 * Configuración del algoritmo de scoring
 * Pesos basados en especificación CU08
 */
const SCORING_WEIGHTS = {
    SIMILITUD_VECTORIAL: 0.40,      // 40% - Similaridad semántica
    HABILIDADES_OBLIGATORIAS: 0.30, // 30% - Skills requeridas
    HABILIDADES_DESEABLES: 0.15,    // 15% - Skills deseables
    NIVEL_JERARQUICO: 0.15          // 15% - Match de nivel
};

const MAX_POSTULACIONES_DIA = 10;

/**
 * Servicio de Matching - Orquesta la lógica de negocio
 * Sigue Clean Architecture: sin dependencias directas de infraestructura
 */
export class MatchingService {
    constructor(
        private matchingRepository: IMatchingRepository,
        private postulacionRepository: IPostulacionRepository,
        private catalogoRepository: ICatalogoRepository,
        private embeddingProvider: IEmbeddingProvider
    ) { }

    /**
     * Caso de Uso: Generar recomendaciones de candidatos para una vacante
     * Implementa el algoritmo de matching híbrido con scoring ponderado
     */
    async executeMatching(offerId: string): Promise<MatchResult[]> {
        // 1. Obtener y validar oferta
        const oferta = await this.matchingRepository.getOferta(offerId);
        if (!oferta) {
            throw new OfertaNoEncontradaError(offerId);
        }

        // 2. Validar catálogos
        await this.validarCatalogos(oferta.id_sector_industrial, oferta.id_nivel_requerido);

        // 3. Generar vector semántico de la oferta
        const textoParaVector = this.construirTextoOferta(oferta);
        const vector = await this.embeddingProvider.generateEmbedding(textoParaVector);

        // 4. Búsqueda híbrida: filtro duro + KNN vectorial
        const candidatos = await this.matchingRepository.buscarCandidatosSimilares(
            vector,
            oferta.id_sector_industrial,
            20 // Traer más para luego rankear
        );

        // 5. Calcular scoring completo y rankear
        const resultados = candidatos.map(candidato =>
            this.calcularScoreCompleto(candidato, oferta)
        );

        // 6. Ordenar por score descendente y limitar
        return resultados
            .sort((a, b) => b.match_score - a.match_score)
            .slice(0, 10);
    }

    /**
     * Caso de Uso: Postular a una oferta
     * Incluye validaciones de duplicados y límites diarios
     */
    async aplicarAOferta(
        idPostulante: string,
        idOferta: string
    ): Promise<{ postulacionId: string; mensaje: string }> {
        // 1. Verificar que la oferta existe
        const oferta = await this.matchingRepository.getOferta(idOferta);
        if (!oferta) {
            throw new OfertaNoEncontradaError(idOferta);
        }

        // 2. Verificar postulación duplicada
        const yaPostulo = await this.postulacionRepository.existePostulacion(
            idPostulante,
            idOferta
        );
        if (yaPostulo) {
            throw new PostulacionDuplicadaError();
        }

        // 3. Verificar límite de postulaciones diarias
        const postulacionesHoy = await this.postulacionRepository.contarPostulacionesHoy(
            idPostulante
        );
        if (postulacionesHoy >= MAX_POSTULACIONES_DIA) {
            throw new LimitePostulacionesError();
        }

        // 4. Crear postulación
        const nuevaPostulacion: Omit<Postulacion, 'id'> = {
            id_postulante: idPostulante,
            id_oferta: idOferta,
            fecha_postulacion: new Date(),
            estado: 'PENDIENTE'
        };

        const postulacionId = await this.postulacionRepository.crear(nuevaPostulacion);

        return {
            postulacionId,
            mensaje: 'Postulación registrada exitosamente'
        };
    }

    /**
     * Caso de Uso: Obtener postulaciones del candidato
     */
    async obtenerMisPostulaciones(idPostulante: string): Promise<Postulacion[]> {
        return this.postulacionRepository.getByPostulante(idPostulante);
    }

    /**
     * Caso de Uso: Obtener postulaciones de una oferta (para reclutador)
     */
    async obtenerPostulacionesOferta(idOferta: string): Promise<Postulacion[]> {
        // Verificar que la oferta existe
        const oferta = await this.matchingRepository.getOferta(idOferta);
        if (!oferta) {
            throw new OfertaNoEncontradaError(idOferta);
        }

        return this.postulacionRepository.getByOferta(idOferta);
    }

    // ============================================
    // MÉTODOS PRIVADOS
    // ============================================

    /**
     * Valida que los IDs de catálogo sean válidos
     */
    private async validarCatalogos(sectorId: string, nivelId: string): Promise<void> {
        const [sectorValido, nivelValido] = await Promise.all([
            this.catalogoRepository.existeSector(sectorId),
            this.catalogoRepository.existeNivel(nivelId)
        ]);

        if (!sectorValido) {
            throw new CatalogoInvalidoError('SECTOR_INDUSTRIAL', sectorId);
        }
        if (!nivelValido) {
            throw new CatalogoInvalidoError('NIVEL_JERARQUICO', nivelId);
        }
    }

    /**
     * Construye texto para vectorización incluyendo habilidades
     */
    private construirTextoOferta(oferta: Oferta): string {
        const partes = [oferta.titulo, oferta.descripcion];

        if (oferta.habilidades_obligatorias) {
            const nombresObligatorias = oferta.habilidades_obligatorias.map(h => h.nombre);
            partes.push(`Habilidades requeridas: ${nombresObligatorias.join(', ')}`);
        }

        if (oferta.habilidades_deseables) {
            const nombresDeseables = oferta.habilidades_deseables.map(h => h.nombre);
            partes.push(`Habilidades deseables: ${nombresDeseables.join(', ')}`);
        }

        return partes.join(' ');
    }

    /**
     * Calcula el score completo con todos los criterios ponderados
     */
    private calcularScoreCompleto(candidato: Postulante, oferta: Oferta): MatchResult {
        // Score de habilidades obligatorias
        const scoreObligatorias = this.calcularScoreHabilidades(
            candidato.habilidades_tecnicas,
            oferta.habilidades_obligatorias || []
        );

        // Score de habilidades deseables
        const scoreDeseables = this.calcularScoreHabilidades(
            candidato.habilidades_tecnicas,
            oferta.habilidades_deseables || []
        );

        // Score de nivel jerárquico
        const scoreNivel = candidato.id_nivel_actual === oferta.id_nivel_requerido ? 1.0 : 0.5;

        // Score de similitud vectorial (implícito en el orden de KNN, normalizamos a 0.8)
        const scoreSimilitud = 0.8; // Base score por estar en top KNN

        // Cálculo ponderado final
        const matchScore =
            (scoreSimilitud * SCORING_WEIGHTS.SIMILITUD_VECTORIAL) +
            (scoreObligatorias * SCORING_WEIGHTS.HABILIDADES_OBLIGATORIAS) +
            (scoreDeseables * SCORING_WEIGHTS.HABILIDADES_DESEABLES) +
            (scoreNivel * SCORING_WEIGHTS.NIVEL_JERARQUICO);

        return {
            postulante: candidato,
            match_score: Math.round(matchScore * 100) / 100, // Redondear a 2 decimales
            score_detalle: {
                similitud_vectorial: scoreSimilitud,
                habilidades_obligatorias: scoreObligatorias,
                habilidades_deseables: scoreDeseables,
                nivel_jerarquico: scoreNivel
            }
        };
    }

    /**
     * Calcula score de coincidencia de habilidades
     */
    private calcularScoreHabilidades(
        habilidadesCandidato: string[],
        habilidadesOferta: { nombre: string; peso: number }[]
    ): number {
        if (habilidadesOferta.length === 0) {
            return 1.0; // Si no hay requisitos, score perfecto
        }

        const habilidadesCandidatoLower = habilidadesCandidato.map(h => h.toLowerCase());
        let pesoTotal = 0;
        let pesoCoincidencias = 0;

        for (const habilidad of habilidadesOferta) {
            pesoTotal += habilidad.peso;

            const coincide = habilidadesCandidatoLower.some(hc =>
                hc.includes(habilidad.nombre.toLowerCase()) ||
                habilidad.nombre.toLowerCase().includes(hc)
            );

            if (coincide) {
                pesoCoincidencias += habilidad.peso;
            }
        }

        return pesoTotal > 0 ? pesoCoincidencias / pesoTotal : 0;
    }
}