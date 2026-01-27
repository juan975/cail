// src/matching/infrastructure/repositories/FirestoreAplicacionRepository.ts
// Repositorio de matching con búsqueda vectorial híbrida

import { Firestore, FieldValue } from '@google-cloud/firestore';
import {
    IMatchingRepository,
    Oferta,
    Postulante,
    OfertaNoEncontradaError
} from '../../domain/types';

/**
 * Implementación de IMatchingRepository usando Firestore con búsqueda vectorial
 */
export class FirestoreAplicacionRepository implements IMatchingRepository {
    constructor(private db: Firestore) { }

    /**
     * Obtiene una oferta por ID con campos requeridos para matching
     * Sincronizado con el microservicio de ofertas
     */
    async getOferta(id: string): Promise<Oferta | null> {
        const doc = await this.db.collection('ofertas').doc(id).get();

        if (!doc.exists) {
            return null;
        }

        const data = doc.data()!;

        // Mapeo de campos del microservicio ofertas al dominio de matching
        return {
            id: doc.id,
            titulo: data.titulo,
            descripcion: data.descripcion,
            id_sector_industrial: data.id_sector_industrial || data.sectorIndustrial || '',
            id_nivel_requerido: data.id_nivel_requerido || data.experiencia_requerida || '',
            modalidad: data.modalidad,
            competencias_requeridas: data.competencias_requeridas || [],
            habilidades_obligatorias: this.mapHabilidades(data.habilidades_obligatorias, true),
            habilidades_deseables: this.mapHabilidades(data.habilidades_deseables, false)
        };
    }

    /**
     * Implementación del algoritmo de Matching Híbrido
     * Combina filtro duro (sector) con búsqueda vectorial KNN
     */
    async buscarCandidatosSimilares(
        vector: number[],
        sectorId: string,
        limite: number
    ): Promise<Postulante[]> {
        const snapshot = await this.db.collection('candidatos')
            // Filtro Duro: Mismo sector industrial para garantizar relevancia
            .where('id_sector_industrial', '==', sectorId)
            // Búsqueda Vectorial: KNN (K-Nearest Neighbors)
            .findNearest({
                vectorField: 'embedding_habilidades',
                queryVector: vector,
                distanceMeasure: 'COSINE',
                limit: limite
            })
            .get();

        return snapshot.docs.map(doc => this.mapToPostulante(doc));
    }

    /**
     * Actualiza el vector de embedding de un candidato
     */
    async updateVectorCandidato(id: string, vector: number[]): Promise<void> {
        await this.db.collection('candidatos').doc(id).update({
            embedding_habilidades: FieldValue.vector(vector),
            fecha_actualizacion_vector: new Date()
        });
    }

    /**
     * Obtiene un candidato/postulante por ID
     */
    async getPostulante(id: string): Promise<Postulante | null> {
        const doc = await this.db.collection('candidatos').doc(id).get();
        if (!doc.exists) {
            return null;
        }
        return this.mapToPostulante(doc);
    }

    /**
     * Busca ofertas activas del mismo sector industrial
     * Usado para matching inverso (ofertas para candidato)
     */
    async buscarOfertasSimilares(
        sectorId: string,
        limite: number
    ): Promise<Oferta[]> {
        const snapshot = await this.db.collection('ofertas')
            .where('estado', '==', 'ACTIVA')
            .where('id_sector_industrial', '==', sectorId)
            .limit(limite)
            .get();

        return snapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                titulo: data.titulo,
                descripcion: data.descripcion,
                id_sector_industrial: data.id_sector_industrial || data.sectorIndustrial || '',
                id_nivel_requerido: data.id_nivel_requerido || data.experiencia_requerida || '',
                modalidad: data.modalidad,
                competencias_requeridas: data.competencias_requeridas || [],
                habilidades_obligatorias: this.mapHabilidades(data.habilidades_obligatorias, true),
                habilidades_deseables: this.mapHabilidades(data.habilidades_deseables, false),
                // Campos adicionales para el frontend
                empresa: data.empresa,
                ubicacion: data.ubicacion,
                salario_min: data.salario_min,
                salario_max: data.salario_max,
                fecha_publicacion: data.fecha_publicacion,
                id_reclutador: data.id_reclutador
            } as Oferta & Record<string, any>;
        });
    }

    /**
     * Mapea documento Firestore a entidad Postulante
     */
    private mapToPostulante(doc: FirebaseFirestore.DocumentSnapshot): Postulante {
        const data = doc.data()!;
        return {
            id: doc.id,
            nombre: data.nombre || '',
            habilidades_tecnicas: data.habilidades_tecnicas || [],
            id_nivel_actual: data.id_nivel_actual || '',
            id_sector_industrial: data.id_sector_industrial || '',
            embedding_habilidades: data.embedding_habilidades
        };
    }

    /**
     * Mapea habilidades con peso para scoring
     */
    private mapHabilidades(
        habilidades: any[] | undefined,
        esObligatorio: boolean
    ): { nombre: string; es_obligatorio: boolean; peso: number }[] {
        if (!habilidades || !Array.isArray(habilidades)) {
            return [];
        }

        return habilidades.map(h => ({
            nombre: typeof h === 'string' ? h : h.nombre || '',
            es_obligatorio: esObligatorio,
            peso: typeof h === 'object' && h.peso ? h.peso : (esObligatorio ? 0.8 : 0.4)
        }));
    }

    /**
     * Busca ofertas similares usando búsqueda vectorial (KNN)
     * Usado para matching inverso con similitud semántica
     */
    async buscarOfertasPorVector(
        vector: number[],
        sectorId: string,  // Kept for API compatibility but not used
        limite: number
    ): Promise<Oferta[]> {
        try {
            const snapshot = await this.db.collection('ofertas')
                // Solo filtrar por estado activa - mostrar TODAS las ofertas rankeadas por similitud
                .where('estado', '==', 'ACTIVA')
                // Búsqueda vectorial KNN - ordena por similitud semántica
                .findNearest({
                    vectorField: 'embedding_oferta',
                    queryVector: vector,
                    distanceMeasure: 'COSINE',
                    limit: limite
                })
                .get();

            return snapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    titulo: data.titulo,
                    descripcion: data.descripcion,
                    id_sector_industrial: data.id_sector_industrial || '',
                    id_nivel_requerido: data.id_nivel_requerido || '',
                    modalidad: data.modalidad,
                    competencias_requeridas: data.competencias_requeridas || [],
                    habilidades_obligatorias: this.mapHabilidades(data.habilidades_obligatorias, true),
                    habilidades_deseables: this.mapHabilidades(data.habilidades_deseables, false),
                    embedding_oferta: data.embedding_oferta,
                    // Campos adicionales para el frontend
                    empresa: data.empresa,
                    ubicacion: data.ubicacion,
                    ciudad: data.ciudad,
                    salario_min: data.salario_min,
                    salario_max: data.salario_max,
                    fechaPublicacion: data.fechaPublicacion,
                    tipoContrato: data.tipoContrato,
                    experiencia_requerida: data.experiencia_requerida,
                    formacion_requerida: data.formacion_requerida,
                } as Oferta & Record<string, any>;
            });
        } catch (error) {
            // Si falla la búsqueda vectorial (ej: índice faltante), usar fallback
            console.warn('Vector search failed, falling back to regular search:', error);
            return this.buscarOfertasSimilares(sectorId, limite);
        }
    }
}