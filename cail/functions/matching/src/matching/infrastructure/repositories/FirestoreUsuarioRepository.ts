// src/matching/infrastructure/repositories/FirestoreUsuarioRepository.ts
// Repositorio para obtener perfiles de candidatos desde la colección usuarios

import { getFirestore, Firestore } from 'firebase-admin/firestore';
import { IUsuarioRepository, CandidatoPerfil } from '../../domain/types';

/**
 * Implementación de Firestore para obtener perfiles de candidatos
 * Lee de la colección 'usuarios' y extrae candidateProfile
 */
export class FirestoreUsuarioRepository implements IUsuarioRepository {
    private db: Firestore;

    constructor() {
        this.db = getFirestore();
    }

    /**
     * Obtiene el perfil de un candidato por su ID
     */
    async getCandidatoPerfil(idUsuario: string): Promise<CandidatoPerfil | null> {
        try {
            const userDoc = await this.db.collection('usuarios').doc(idUsuario).get();

            if (!userDoc.exists) {
                console.warn(`Usuario ${idUsuario} no encontrado`);
                return null;
            }

            const userData = userDoc.data();
            if (!userData) {
                return null;
            }

            // Extraer datos relevantes del usuario y su candidateProfile
            const candidateProfile = userData.candidateProfile || {};

            return {
                nombreCompleto: userData.nombreCompleto || 'Sin nombre',
                email: userData.email || '',
                telefono: candidateProfile.phone || candidateProfile.telefono,
                ciudad: candidateProfile.city || candidateProfile.ciudad,
                nivelEducativo: candidateProfile.educationLevel || candidateProfile.nivelEducativo,
                resumenProfesional: candidateProfile.professionalSummary || candidateProfile.resumen,
                habilidadesTecnicas: candidateProfile.technicalSkills || candidateProfile.habilidadesTecnicas || [],
                habilidadesBlandas: candidateProfile.softSkills || candidateProfile.habilidadesBlandas || [],
                experienciaAnios: candidateProfile.yearsOfExperience || candidateProfile.aniosExperiencia,
                cvUrl: candidateProfile.cvUrl || candidateProfile.cvFile || userData.cvUrl,
            };
        } catch (error) {
            console.error(`Error obteniendo perfil de usuario ${idUsuario}:`, error);
            return null;
        }
    }

    /**
     * Obtiene perfiles de múltiples candidatos en batch
     * Optimizado para reducir llamadas a Firestore
     */
    async getCandidatosPerfiles(idsUsuarios: string[]): Promise<Map<string, CandidatoPerfil>> {
        const perfilesMap = new Map<string, CandidatoPerfil>();

        if (idsUsuarios.length === 0) {
            return perfilesMap;
        }

        try {
            // Firestore limita getAll a 500 documentos, pero para nuestro caso debería ser suficiente
            const refs = idsUsuarios.map(id => this.db.collection('usuarios').doc(id));
            const snapshots = await this.db.getAll(...refs);

            snapshots.forEach((doc, index) => {
                if (doc.exists) {
                    const userData = doc.data();
                    if (userData) {
                        const candidateProfile = userData.candidateProfile || {};

                        perfilesMap.set(idsUsuarios[index], {
                            nombreCompleto: userData.nombreCompleto || 'Sin nombre',
                            email: userData.email || '',
                            telefono: candidateProfile.phone || candidateProfile.telefono,
                            ciudad: candidateProfile.city || candidateProfile.ciudad,
                            nivelEducativo: candidateProfile.educationLevel || candidateProfile.nivelEducativo,
                            resumenProfesional: candidateProfile.professionalSummary || candidateProfile.resumen,
                            habilidadesTecnicas: candidateProfile.technicalSkills || candidateProfile.habilidadesTecnicas || [],
                            habilidadesBlandas: candidateProfile.softSkills || candidateProfile.habilidadesBlandas || [],
                            experienciaAnios: candidateProfile.yearsOfExperience || candidateProfile.aniosExperiencia,
                            cvUrl: candidateProfile.cvUrl || candidateProfile.cvFile || userData.cvUrl,
                        });
                    }
                }
            });
        } catch (error) {
            console.error('Error obteniendo perfiles de usuarios en batch:', error);
        }

        return perfilesMap;
    }
}
