
import { db } from '../../../../shared/infrastructure/config/firebase.config';
import { Oferta } from '../../../../modules/matching/domain/types';

export class FirestoreOfferRepository {
    private collection = db.collection('ofertas');

    /**
     * Obtiene todas las ofertas activas
     */
    async findAll(): Promise<any[]> {
        const snapshot = await this.collection.get();
        if (snapshot.empty) {
            return [];
        }

        return snapshot.docs.map(doc => {
            const data = doc.data();
            // Mapeo simple para compatibilidad, ajusta según tu estructura de Firestore real
            return {
                idOferta: doc.id, // Usamos ID del doc si no hay numérico
                id: doc.id,
                titulo: data.titulo,
                descripcion: data.descripcion,
                modalidad: data.modalidad,
                ciudad: data.ciudad,
                salario: data.salario,
                estado: data.estado,
                empresa: data.empresa || {
                    nombre: "Empresa Confidencial",
                    location: data.ciudad
                },
                fechaPublicacion: data.fechaPublicacion
            };
        });
    }

    async findById(id: string): Promise<any | null> {
        const doc = await this.collection.doc(id).get();
        if (!doc.exists) {
            return null;
        }
        const data = doc.data();
        return { id: doc.id, ...data };
    }
}
