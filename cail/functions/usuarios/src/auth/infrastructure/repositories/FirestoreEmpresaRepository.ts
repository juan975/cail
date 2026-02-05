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
                return this.mapToEntity(rucNormalizado, data);
            }

            return null;
        } catch (error) {
            console.error('Error obteniendo empresa por RUC:', error);
            return null;
        }
    }

    /**
     * Obtiene todas las empresas validadas
     */
    async getAll(): Promise<EmpresaValidada[]> {
        console.log('🔍 FirestoreEmpresaRepository: fetching all companies from "empresas" collection...');
        try {
            const db = getFirestore();
            if (!db) {
                console.error('❌ Firestore DB instance is undefined in getAll');
                throw new Error('Firestore not initialized');
            }

            // Limit to 100 to prevent massive reads/timeouts during debug
            const snapshot = await db.collection('empresas')
                .limit(100)
                .get();

            if (snapshot.empty) {
                console.warn('⚠️ No companies found in "empresas" collection.');
                return [];
            }

            console.log(`✅ Found ${snapshot.size} companies. Mapping to entity...`);

            return snapshot.docs.map(doc => {
                const data = doc.data();
                const ruc = data.ruc || doc.id;
                return this.mapToEntity(ruc, data);
            });
        } catch (error) {
            console.error('❌ Error fetching companies from Firestore:', error);
            // Return empty array instead of throwing to prevent 503 crash
            return [];
        }
    }

    private mapToEntity(ruc: string, data: any): EmpresaValidada {
        return {
            ruc: ruc,
            razonSocial: data.razon_social || data.nombre_comercial || data.nombre || 'Sin nombre',
            estado: data.estado_validacion || 'VERIFICADA',
            direccion: data.direccion || data.address || '',
            ciudad: data.ciudad || data.city || '',
            website: data.sitio_web || data.website || data.pagina_web || data.url || '',
            descripcion: data.descripcion || data.description || data.detalle || '',
            // Priorizar contacto.email (si es objeto), luego campos directos variados
            emailContacto: (typeof data.contacto === 'object' ? data.contacto?.email : undefined) ||
                data.email ||
                data.correo ||
                data.email_contacto ||
                data.contacto_email ||
                undefined,
            fechaValidacion: data.created_at?.toDate() || new Date(),
        };
    }
}
