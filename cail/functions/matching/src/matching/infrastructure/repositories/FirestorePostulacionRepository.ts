// src/matching/infrastructure/repositories/FirestorePostulacionRepository.ts
// Repositorio de postulaciones con validación de duplicados y límites

import { Firestore, FieldValue } from '@google-cloud/firestore';
import {
    IPostulacionRepository,
    Postulacion,
    ICatalogoRepository,
    SECTORES_INDUSTRIALES,
    NIVELES_JERARQUICOS
} from '../../domain/types';

/**
 * Implementación de IPostulacionRepository usando Firestore
 */
export class FirestorePostulacionRepository implements IPostulacionRepository {
    private readonly COLLECTION = 'postulaciones';

    constructor(private db: Firestore) { }

    async crear(postulacion: Omit<Postulacion, 'id'>): Promise<string> {
        const docRef = await this.db.collection(this.COLLECTION).add({
            ...postulacion,
            fecha_postulacion: FieldValue.serverTimestamp(),
            created_at: FieldValue.serverTimestamp()
        });
        return docRef.id;
    }

    async getById(id: string): Promise<Postulacion | null> {
        const doc = await this.db.collection(this.COLLECTION).doc(id).get();
        if (!doc.exists) return null;
        return this.mapToPostulacion(doc);
    }

    async getByPostulante(idPostulante: string): Promise<Postulacion[]> {
        // Evitar índice compuesto: filtrar sin orderBy, luego ordenar en memoria
        const snapshot = await this.db.collection(this.COLLECTION)
            .where('id_postulante', '==', idPostulante)
            .get();

        const postulaciones = snapshot.docs.map(doc => this.mapToPostulacion(doc));

        // Ordenar en memoria por fecha descendente
        return postulaciones.sort((a, b) => {
            const dateA = a.fecha_postulacion instanceof Date ? a.fecha_postulacion : new Date(a.fecha_postulacion);
            const dateB = b.fecha_postulacion instanceof Date ? b.fecha_postulacion : new Date(b.fecha_postulacion);
            return dateB.getTime() - dateA.getTime();
        });
    }

    async getByOferta(idOferta: string): Promise<Postulacion[]> {
        // Evitar índice compuesto: filtrar sin orderBy, luego ordenar en memoria
        const snapshot = await this.db.collection(this.COLLECTION)
            .where('id_oferta', '==', idOferta)
            .get();

        const postulaciones = snapshot.docs.map(doc => this.mapToPostulacion(doc));

        // Ordenar en memoria por fecha descendente
        return postulaciones.sort((a, b) => {
            const dateA = a.fecha_postulacion instanceof Date ? a.fecha_postulacion : new Date(a.fecha_postulacion);
            const dateB = b.fecha_postulacion instanceof Date ? b.fecha_postulacion : new Date(b.fecha_postulacion);
            return dateB.getTime() - dateA.getTime();
        });
    }

    /**
     * Verifica si ya existe una postulación activa para evitar duplicados
     */
    async existePostulacion(idPostulante: string, idOferta: string): Promise<boolean> {
        // Evitar índice compuesto: hacer dos queries separados
        const snapshot = await this.db.collection(this.COLLECTION)
            .where('id_postulante', '==', idPostulante)
            .where('id_oferta', '==', idOferta)
            .limit(1)
            .get();

        if (snapshot.empty) {
            return false;
        }

        // Verificar estado en memoria
        const doc = snapshot.docs[0];
        const data = doc.data();
        const estado = data.estado;
        return estado === 'PENDIENTE' || estado === 'EN_REVISION';
    }

    /**
     * Cuenta postulaciones del día actual para validar límite de 10/día
     */
    async contarPostulacionesHoy(idPostulante: string): Promise<number> {
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);

        // Solo usar un where para evitar índice compuesto
        const snapshot = await this.db.collection(this.COLLECTION)
            .where('id_postulante', '==', idPostulante)
            .get();

        // Filtrar por fecha en memoria
        let count = 0;
        for (const doc of snapshot.docs) {
            const data = doc.data();
            const fechaPostulacion = data.fecha_postulacion?.toDate?.() || new Date(data.fecha_postulacion);
            if (fechaPostulacion >= hoy) {
                count++;
            }
        }
        return count;
    }

    async updateEstado(id: string, estado: string): Promise<void> {
        await this.db.collection(this.COLLECTION).doc(id).update({
            estado: estado,
            updated_at: FieldValue.serverTimestamp()
        });
    }

    private mapToPostulacion(doc: FirebaseFirestore.DocumentSnapshot): Postulacion {
        const data = doc.data()!;
        return {
            id: doc.id,
            id_postulante: data.id_postulante,
            id_oferta: data.id_oferta,
            fecha_postulacion: data.fecha_postulacion?.toDate() || new Date(),
            estado: data.estado,
            match_score: data.match_score
        };
    }
}

/**
 * Implementación de validación de catálogos
 * Para este caso, usamos validación estática basada en las constantes del dominio
 */
export class CatalogoValidator implements ICatalogoRepository {
    async existeSector(id: string): Promise<boolean> {
        // Validación contra catálogo estático
        // En producción, esto podría consultar una colección 'catalogos' en Firestore
        return (SECTORES_INDUSTRIALES as readonly string[]).includes(id);
    }

    async existeNivel(id: string): Promise<boolean> {
        return (NIVELES_JERARQUICOS as readonly string[]).includes(id);
    }
}
