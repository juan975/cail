// src/auth/infrastructure/repositories/FirestoreEmpresaRepository.ts
// Implementación de repositorio para validación de empresas contra Firestore

import { getFirestore } from '../../../config/firebase.config';
import { IEmpresaRepository, EmpresaValidada } from '../../domain/repositories/IEmpresaRepository';

/**
 * Implementación de Firestore para validación de empresas
 * Consulta la colección 'empresas' que contiene las empresas autorizadas
 */
export class FirestoreEmpresaRepository implements IEmpresaRepository {

    /**
     * Verifica si un RUC existe en la colección de empresas autorizadas
     */
    async existeEmpresaActiva(ruc: string): Promise<boolean> {
        const empresa = await this.getByRuc(ruc);
        // Validamos que exista y que su estado sea VERIFICADA (según captura de usuario)
        return !!empresa && empresa.estado === 'VERIFICADA';
    }

    /**
     * Obtiene información de la empresa por RUC
     */
    async getByRuc(ruc: string): Promise<EmpresaValidada | null> {
        const db = getFirestore();
        const rucNormalizado = ruc.replace(/[-\s]/g, '').trim();

        try {
            // Primero intentar buscar donde el ID del documento es el RUC
            const docById = await db.collection('empresas').doc(rucNormalizado).get();
            let data: any = null;

            if (docById.exists) {
                data = docById.data();
            } else {
                // Si no, buscar por campo 'ruc'
                const querySnapshot = await db.collection('empresas')
                    .where('ruc', '==', rucNormalizado)
                    .limit(1)
                    .get();

                if (!querySnapshot.empty) {
                    data = querySnapshot.docs[0].data();
                }
            }

            if (data) {
                // Mapeo de campos snake_case (DB real) a camelCase (código interno)
                // Según captura: estado_validacion="VERIFICADA", razon_social, nombre_comercial
                return {
                    ruc: rucNormalizado,
                    razonSocial: data.razon_social || data.nombre_comercial || data.nombre || 'Sin nombre',
                    estado: data.estado_validacion || 'PENDIENTE',
                    fechaValidacion: data.created_at?.toDate() || new Date(),
                };
            }

            return null;
        } catch (error) {
            console.error('Error obteniendo empresa por RUC:', error);
            return null;
        }
    }
}
