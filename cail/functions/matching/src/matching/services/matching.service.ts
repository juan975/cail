// src/matching/services/matching.service.ts
// Servicio de Matching con Clean Architecture y scoring completo

import {
    IMatchingRepository,
    IPostulacionRepository,
    ICatalogoRepository,
    IEmbeddingProvider,
    IUsuarioRepository,
    Postulante,
    Oferta,
    MatchResult,
    OfferMatchResult,
    Postulacion,
    PostulacionConCandidato,
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
    SIMILITUD_VECTORIAL: 0.40,      // 40% - Balanced with Skills
    HABILIDADES_OBLIGATORIAS: 0.40, // 40% - Trust deterministic inference
    HABILIDADES_DESEABLES: 0.10,    // 10%
    NIVEL_JERARQUICO: 0.10          // 10%
};

const MAX_POSTULACIONES_DIA = 10;

/**
 * Servicio de Matching - Orquesta la lógica de negocio
 * Sigue Clean Architecture: sin dependencias directas de infraestructura
 */
export class MatchingService {
    private usuarioRepository?: IUsuarioRepository;

    constructor(
        private matchingRepository: IMatchingRepository,
        private postulacionRepository: IPostulacionRepository,
        private catalogoRepository: ICatalogoRepository,
        private embeddingProvider: IEmbeddingProvider
    ) { }

    /**
     * Inyecta el repositorio de usuarios (opcional, para enriquecer postulaciones)
     */
    setUsuarioRepository(repo: IUsuarioRepository): void {
        this.usuarioRepository = repo;
    }

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

    /**
     * Caso de Uso: Obtener postulaciones de una oferta CON datos del candidato
     * Requiere que se haya inyectado el usuarioRepository
     */
    async obtenerPostulacionesConCandidatos(idOferta: string): Promise<PostulacionConCandidato[]> {
        // Obtener postulaciones básicas
        const postulaciones = await this.obtenerPostulacionesOferta(idOferta);

        // Si no hay repositorio de usuarios, retornar sin enriquecer
        if (!this.usuarioRepository) {
            console.warn('UsuarioRepository no configurado, retornando postulaciones sin datos de candidato');
            return postulaciones.map(p => ({ ...p }));
        }

        // Obtener IDs únicos de postulantes
        const idsPostulantes = [...new Set(postulaciones.map(p => p.id_postulante))];

        // Obtener perfiles en batch (más eficiente)
        const perfilesMap = await this.usuarioRepository.getCandidatosPerfiles(idsPostulantes);

        // Enriquecer postulaciones con datos del candidato
        return postulaciones.map(postulacion => ({
            ...postulacion,
            candidato: perfilesMap.get(postulacion.id_postulante) || undefined
        }));
    }

    /**
     * Caso de Uso: Actualizar estado de una postulación
     */
    async actualizarEstadoPostulacion(idAplicacion: string, nuevoEstado: 'PENDIENTE' | 'EN_REVISION' | 'ACEPTADA' | 'RECHAZADA'): Promise<void> {
        // Verificar que existe
        const postulacion = await this.postulacionRepository.getById(idAplicacion);
        if (!postulacion) {
            throw new Error('Postulación no encontrada');
        }

        await this.postulacionRepository.updateEstado(idAplicacion, nuevoEstado);
    }

    /**
     * Caso de Uso: Obtener ofertas rankeadas para un candidato
     * Matching inverso con búsqueda vectorial - usado en la página de descubrimiento
     */
    async getOffersForCandidate(candidatoId: string, limite: number = 20): Promise<OfferMatchResult[]> {
        // 1. Obtener perfil del candidato
        const candidato = await this.matchingRepository.getPostulante(candidatoId);
        if (!candidato) {
            throw new Error('Candidato no encontrado');
        }

        // 2. Generar vector del candidato (o usar el almacenado)
        let vector = candidato.embedding_habilidades;
        if (!vector || vector.length === 0) {
            // Generar embedding del candidato basado en sus habilidades
            const textoParaVector = this.construirTextoCandidato(candidato);
            vector = await this.embeddingProvider.generateEmbedding(textoParaVector);
        }

        // [CRITICAL] Guard: Ensure sector is present to prevent unfiltered results
        if (!candidato.id_sector_industrial) {
            console.warn(`[MatchingService] Candidato ${candidatoId} has NO sector. Aborting to prevent leak.`);
            return [];
        }

        // 3. Buscar ofertas similares usando búsqueda vectorial + filtro de sector
        let ofertas: Oferta[];
        try {
            console.log(`[MatchingService] Searching offers for sector: ${candidato.id_sector_industrial}`);
            ofertas = await this.matchingRepository.buscarOfertasPorVector(
                vector,
                candidato.id_sector_industrial,
                50 // Traer más para rankear
            );
        } catch (error) {
            // Fallback si falla la búsqueda vectorial
            console.warn('Vector search failed, using fallback:', error);
            ofertas = await this.matchingRepository.buscarOfertasSimilares(
                candidato.id_sector_industrial,
                50
            );
        }

        // [CRITICAL] Brute Force Filter: Ensure NO leaks from other sectors
        // This acts as a final safety net against DB query issues
        const sectorRequerido = candidato.id_sector_industrial.toLowerCase().trim();
        const ofertasOriginales = ofertas.length;
        ofertas = ofertas.filter(o => {
            const sectorOferta = (o.id_sector_industrial || '').toLowerCase().trim();
            return sectorOferta === sectorRequerido;
        });

        if (ofertas.length < ofertasOriginales) {
            console.warn(`[MatchingService] FILTERED OUT ${ofertasOriginales - ofertas.length} offers with mismatching sector!`);
        }

        // 4. Calcular score completo para cada oferta
        const resultados = ofertas.map((oferta, index) =>
            this.calcularScoreOfertaParaCandidato(candidato, oferta, index, ofertas.length)
        );

        // 5. Ordenar por score descendente y limitar
        return resultados
            .sort((a, b) => b.match_score - a.match_score)
            .slice(0, limite);
    }

    /**
     * Construye texto del candidato para vectorización
     */
    private construirTextoCandidato(candidato: Postulante): string {
        const habilidades = candidato.habilidades_tecnicas?.join(', ') || '';
        return `Profesional con habilidades en: ${habilidades}. ` +
            `Nivel: ${candidato.id_nivel_actual}. ` +
            `Sector: ${candidato.id_sector_industrial}.`;
    }

    /**
     * Calcula el score de match de una oferta para un candidato
     * Incluye similitud vectorial basada en posición en resultados KNN
     */
    private calcularScoreOfertaParaCandidato(
        candidato: Postulante,
        oferta: Oferta,
        posicionKNN: number = 0,
        totalResultados: number = 1
    ): OfferMatchResult {
        // Score de similitud vectorial (basado en posición en resultados KNN)
        // Los primeros resultados tienen score más alto
        const scoreSimilitud = totalResultados > 1
            ? 1 - (posicionKNN / totalResultados) * 0.4  // De 1.0 a 0.6
            : 0.8;

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

        // Score combinado de habilidades (obligatorias pesan más)
        const scoreHabilidades = (scoreObligatorias * 0.7) + (scoreDeseables * 0.3);

        // Score de nivel jerárquico
        const scoreNivel = (!candidato.id_nivel_actual || candidato.id_nivel_actual === oferta.id_nivel_requerido) ? 1.0 : 0.5;

        // Score ponderado final con vectorización
        const matchScore =
            (scoreSimilitud * SCORING_WEIGHTS.SIMILITUD_VECTORIAL) +
            (scoreHabilidades * (SCORING_WEIGHTS.HABILIDADES_OBLIGATORIAS + SCORING_WEIGHTS.HABILIDADES_DESEABLES)) +
            (scoreNivel * SCORING_WEIGHTS.NIVEL_JERARQUICO);

        return {
            oferta,
            match_score: Math.round(matchScore * 100) / 100,
            score_detalle: {
                similitud_vectorial: scoreSimilitud,
                habilidades_match: scoreHabilidades,
                nivel_jerarquico: scoreNivel
            }
        };
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
        const scoreNivel = (!candidato.id_nivel_actual || candidato.id_nivel_actual === oferta.id_nivel_requerido) ? 1.0 : 0.5;

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

    // ============================================
    // LOGICA DE INFERENCIA
    // ============================================
    private readonly SKILL_INFERENCE_MAP: Record<string, string[]> = {
        'javascript': ['react', 'angular', 'vue', 'node', 'typescript', 'express', 'next'],
        'node.js': ['express', 'nest', 'mean', 'mern', 'javascript', 'typescript'],
        'sql': ['mysql', 'postgresql', 'postgres', 'oracle', 'sql server', 'database', 'bases de datos'],
        'python': ['django', 'flask', 'fastapi', 'pandas', 'numpy', 'pytorch', 'tensorflow'],
        'java': ['spring', 'hibernate', 'jakarta'],
        'c#': ['.net', 'dotnet', 'entity framework'],
    };

    /**
     * Calcula score de coincidencia de habilidades con inferencia
     */
    private calcularScoreHabilidades(
        habilidadesCandidato: string[],
        habilidadesOferta: { nombre: string; peso: number }[]
    ): number {
        if (habilidadesOferta.length === 0) {
            return 1.0;
        }

        const habilidadesCandidatoLower = habilidadesCandidato.map(h => h.toLowerCase());
        let pesoTotal = 0;
        let pesoCoincidencias = 0;

        for (const habilidad of habilidadesOferta) {
            pesoTotal += habilidad.peso;
            const skillRequerida = habilidad.nombre.toLowerCase();

            // 1. Busqueda Exacta
            const coincidenciaExacta = habilidadesCandidatoLower.some(hc =>
                hc.includes(skillRequerida) || skillRequerida.includes(hc)
            );

            if (coincidenciaExacta) {
                pesoCoincidencias += habilidad.peso;
                continue;
            }

            // 2. Inferencia (Si tengo React, sé JavaScript)
            // Verificamos si alguna habilidad del candidato IMPLICA la habilidad requerida
            const inferredSkills = this.SKILL_INFERENCE_MAP[skillRequerida];
            if (inferredSkills) {
                const inferredMatch = habilidadesCandidatoLower.some(hc =>
                    inferredSkills.some(is => hc.includes(is))
                );
                if (inferredMatch) {
                    // Damos crédito completo o parcial (aquí completo para potenciar el match)
                    pesoCoincidencias += habilidad.peso;
                    continue;
                }
            }
        }

        return pesoTotal > 0 ? pesoCoincidencias / pesoTotal : 0;
    }
}