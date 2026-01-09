import { getFirestore } from '../../../config/firebase.config';
import { Aplicacion } from '../../domain/types';

/**
 * Repositorio de Aplicaciones usando Firestore
 * Colección: aplicaciones (Esquema Matching según el diagrama)
 */
export class FirestoreAplicacionRepository {
    private getCollection() {
        return getFirestore().collection('aplicaciones');
    }

    async save(aplicacion: Aplicacion): Promise<Aplicacion> {
        await this.getCollection().doc(aplicacion.idAplicacion).set({
            ...aplicacion,
            updatedAt: new Date(),
        });
        return aplicacion;
    }

    async findByPostulante(idPostulante: string): Promise<Aplicacion[]> {
        try {
            // Intentar con orderBy (requiere índice compuesto)
            const snapshot = await this.getCollection()
                .where('idPostulante', '==', idPostulante)
                .orderBy('fechaAplicacion', 'desc')
                .get();

            return snapshot.docs.map(doc => this.mapToEntity(doc.data()));
        } catch (error: any) {
            console.error('Error in findByPostulante:', error.message);

            // Si falla por índice, intentar sin orderBy
            if (error.code === 9 || error.message?.includes('index')) {
                console.log('Fallback: fetching without orderBy due to missing index');
                const snapshot = await this.getCollection()
                    .where('idPostulante', '==', idPostulante)
                    .get();

                const results = snapshot.docs.map(doc => this.mapToEntity(doc.data()));
                // Ordenar manualmente
                return results.sort((a, b) =>
                    new Date(b.fechaAplicacion).getTime() - new Date(a.fechaAplicacion).getTime()
                );
            }
            throw error;
        }
    }

    async findByOferta(idOferta: string): Promise<Aplicacion[]> {
        try {
            const snapshot = await this.getCollection()
                .where('idOferta', '==', idOferta)
                .orderBy('fechaAplicacion', 'desc')
                .get();

            return snapshot.docs.map(doc => this.mapToEntity(doc.data()));
        } catch (error: any) {
            console.error('Error in findByOferta:', error.message);

            // Si falla por índice, intentar sin orderBy
            if (error.code === 9 || error.message?.includes('index')) {
                console.log('Fallback: fetching without orderBy due to missing index');
                const snapshot = await this.getCollection()
                    .where('idOferta', '==', idOferta)
                    .get();

                const results = snapshot.docs.map(doc => this.mapToEntity(doc.data()));
                return results.sort((a, b) =>
                    new Date(b.fechaAplicacion).getTime() - new Date(a.fechaAplicacion).getTime()
                );
            }
            throw error;
        }
    }

    async exists(idPostulante: string, idOferta: string): Promise<boolean> {
        const snapshot = await this.getCollection()
            .where('idPostulante', '==', idPostulante)
            .where('idOferta', '==', idOferta)
            .limit(1)
            .get();

        return !snapshot.empty;
    }

    private mapToEntity(data: any): Aplicacion {
        return {
            idAplicacion: data.idAplicacion,
            idPostulante: data.idPostulante,
            idOferta: data.idOferta,
            fechaAplicacion: data.fechaAplicacion?.toDate?.() || new Date(data.fechaAplicacion),
            estado: data.estado,
            matchScore: data.matchScore,
        };
    }
}

