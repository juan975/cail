import { getFirestore } from '../../../config/firebase.config';
import { Oferta, OfertaProps } from '../../domain/entities/Oferta.entity';
import { IOfertaRepository, OfertaFilters } from '../../domain/repositories/IOfertaRepository';

/**
 * Repositorio de Ofertas usando Firestore
 * Colección: ofertas (Esquema Ofertas según el diagrama)
 */
export class FirestoreOfertaRepository implements IOfertaRepository {
    private getCollection() {
        return getFirestore().collection('ofertas');
    }

    async save(oferta: Oferta): Promise<Oferta> {
        const data = {
            ...oferta.toJSON(),
            updatedAt: new Date(),
        };
        await this.getCollection().doc(oferta.idOferta).set(data, { merge: true });
        return oferta;
    }

    async findById(id: string): Promise<Oferta | null> {
        const doc = await this.getCollection().doc(id).get();
        if (!doc.exists) return null;
        return this.mapToEntity(doc.data()!, doc.id);
    }

    async findAll(filters?: OfertaFilters): Promise<Oferta[]> {
        try {
            let query: FirebaseFirestore.Query = this.getCollection();
            let needsInMemorySort = false;

            // Aplicar filtros si existen
            if (filters?.estado) {
                query = query.where('estado', '==', filters.estado);
                needsInMemorySort = true; // Evitar índice compuesto
            }
            if (filters?.ciudad) {
                query = query.where('ciudad', '==', filters.ciudad);
                needsInMemorySort = true;
            }
            if (filters?.modalidad) {
                query = query.where('modalidad', '==', filters.modalidad);
                needsInMemorySort = true;
            }

            // Solo ordenar en Firestore si no hay filtros (evita necesidad de índice compuesto)
            if (!needsInMemorySort) {
                query = query.orderBy('fechaPublicacion', 'desc');
            }

            if (filters?.limit) {
                query = query.limit(filters.limit);
            }

            const snapshot = await query.get();
            let ofertas = snapshot.docs.map(doc => this.mapToEntity(doc.data(), doc.id));

            // Ordenar en memoria si se usaron filtros
            if (needsInMemorySort) {
                ofertas = ofertas.sort((a, b) => {
                    const dateA = a.fechaPublicacion instanceof Date ? a.fechaPublicacion : new Date(a.fechaPublicacion);
                    const dateB = b.fechaPublicacion instanceof Date ? b.fechaPublicacion : new Date(b.fechaPublicacion);
                    return dateB.getTime() - dateA.getTime();
                });
            }

            return ofertas;
        } catch (error: any) {
            console.error('Error in findAll:', error.message || error);
            throw error;
        }
    }

    async findByReclutador(idReclutador: string): Promise<Oferta[]> {
        try {
            const snapshot = await this.getCollection()
                .where('idReclutador', '==', idReclutador)
                .get();

            // Ordenar en memoria para evitar necesidad de índice compuesto
            const ofertas = snapshot.docs.map(doc => this.mapToEntity(doc.data(), doc.id));
            return ofertas.sort((a, b) => {
                const dateA = a.fechaPublicacion instanceof Date ? a.fechaPublicacion : new Date(a.fechaPublicacion);
                const dateB = b.fechaPublicacion instanceof Date ? b.fechaPublicacion : new Date(b.fechaPublicacion);
                return dateB.getTime() - dateA.getTime();
            });
        } catch (error: any) {
            console.error('Error in findByReclutador:', error.message || error);
            throw error;
        }
    }

    async delete(id: string): Promise<void> {
        await this.getCollection().doc(id).delete();
    }

    private mapToEntity(data: any, docId?: string): Oferta {
        return new Oferta({
            // Use docId as fallback if idOferta is not stored in document
            idOferta: data.idOferta || docId,
            titulo: data.titulo,
            descripcion: data.descripcion,
            empresa: data.empresa,
            ciudad: data.ciudad,
            modalidad: data.modalidad,
            tipoContrato: data.tipoContrato,
            salarioMin: data.salarioMin,
            salarioMax: data.salarioMax,
            experiencia_requerida: data.experiencia_requerida,
            formacion_requerida: data.formacion_requerida,
            competencias_requeridas: data.competencias_requeridas || [],
            fechaPublicacion: data.fechaPublicacion?.toDate?.() || new Date(data.fechaPublicacion),
            fechaCierre: data.fechaCierre?.toDate?.() || undefined,
            estado: data.estado,
            idReclutador: data.idReclutador,
        });
    }
}
