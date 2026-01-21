/**
 * Cloud Function Trigger: Sincronización usuarios → candidatos
 * 
 * Este trigger escucha cambios en documentos de la colección `usuarios`
 * y sincroniza los datos relevantes a la colección `candidatos` para el matching.
 * 
 * Flujo:
 * 1. Usuario actualiza su perfil en `usuarios.candidateProfile`
 * 2. Trigger detecta el cambio
 * 3. Sincroniza datos relevantes a `candidatos`
 * 4. Si cambiaron las habilidades, regenera el embedding
 */

import { onDocumentWritten, Change, FirestoreEvent } from 'firebase-functions/v2/firestore';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { createEmbeddingProvider } from '../infrastructure/providers/VertexAIEmbeddingProvider';

// Configuración del proyecto
const PROJECT_ID = process.env.GCLOUD_PROJECT || 'cail-b6e7c';
const REGION = 'us-central1';

// Inicializar providers
const embeddingProvider = createEmbeddingProvider(PROJECT_ID, REGION);
const db = getFirestore();

/**
 * Interfaz para los datos del perfil de candidato
 */
interface CandidateProfileData {
    habilidadesTecnicas?: string[];
    softSkills?: string[];
    nivelProfesional?: string;
    sectorIndustrial?: string;
    ciudad?: string;
    resumenProfesional?: string;
    experienciaLaboral?: any[];
    competencias?: string[];
}

interface UserDocument {
    tipoUsuario?: string;
    nombreCompleto?: string;
    email?: string;
    candidateProfile?: CandidateProfileData;
}

/**
 * Construye el texto para generar el embedding basado en las habilidades del candidato
 */
function buildEmbeddingText(profile: CandidateProfileData): string {
    const parts: string[] = [];

    if (profile.habilidadesTecnicas?.length) {
        parts.push(`Habilidades técnicas: ${profile.habilidadesTecnicas.join(', ')}`);
    }

    if (profile.softSkills?.length) {
        parts.push(`Habilidades blandas: ${profile.softSkills.join(', ')}`);
    }

    if (profile.competencias?.length) {
        parts.push(`Competencias: ${profile.competencias.join(', ')}`);
    }

    if (profile.resumenProfesional) {
        parts.push(`Perfil: ${profile.resumenProfesional}`);
    }

    return parts.join('. ') || 'Sin habilidades especificadas';
}

/**
 * Compara si las habilidades cambiaron entre versiones del documento
 */
function skillsChanged(
    before: CandidateProfileData | undefined,
    after: CandidateProfileData | undefined
): boolean {
    const beforeSkills = [
        ...(before?.habilidadesTecnicas || []),
        ...(before?.softSkills || []),
        ...(before?.competencias || [])
    ].sort().join(',');

    const afterSkills = [
        ...(after?.habilidadesTecnicas || []),
        ...(after?.softSkills || []),
        ...(after?.competencias || [])
    ].sort().join(',');

    return beforeSkills !== afterSkills;
}

/**
 * Cloud Function Trigger: onUserProfileUpdate
 * 
 * Se dispara cuando un documento de la colección `usuarios` es creado, actualizado o eliminado.
 * Solo procesa documentos de tipo POSTULANTE.
 */
export const syncCandidatoFromUsuario = onDocumentWritten(
    {
        document: 'usuarios/{userId}',
        region: REGION,
    },
    async (event: FirestoreEvent<Change<any> | undefined, { userId: string }>) => {
        const userId = event.params.userId;
        const change = event.data;

        if (!change) {
            console.log(`[SyncCandidato] No hay datos de cambio para ${userId}`);
            return;
        }

        const beforeData = change.before?.data() as UserDocument | undefined;
        const afterData = change.after?.data() as UserDocument | undefined;

        // Solo procesar usuarios de tipo POSTULANTE
        const isCandidate = afterData?.tipoUsuario === 'POSTULANTE' || beforeData?.tipoUsuario === 'POSTULANTE';
        if (!isCandidate) {
            console.log(`[SyncCandidato] Usuario ${userId} no es POSTULANTE, ignorando`);
            return;
        }

        const candidatosRef = db.collection('candidatos').doc(userId);

        // Caso 1: Usuario eliminado → Eliminar de candidatos
        if (!afterData || afterData.tipoUsuario !== 'POSTULANTE') {
            console.log(`[SyncCandidato] Eliminando candidato ${userId} de la colección candidatos`);
            await candidatosRef.delete();
            return;
        }

        // Caso 2: Usuario creado o actualizado → Sincronizar a candidatos
        const profile = afterData.candidateProfile || {};
        const shouldRegenerateEmbedding = skillsChanged(beforeData?.candidateProfile, afterData.candidateProfile);

        console.log(`[SyncCandidato] Sincronizando candidato ${userId}, regenerar embedding: ${shouldRegenerateEmbedding}`);

        // Datos base a sincronizar
        const candidatoData: Record<string, any> = {
            nombre: afterData.nombreCompleto || '',
            email: afterData.email || '',
            habilidades_tecnicas: profile.habilidadesTecnicas || [],
            soft_skills: profile.softSkills || [],
            competencias: profile.competencias || [],
            id_nivel_actual: profile.nivelProfesional || '',
            id_sector_industrial: profile.sectorIndustrial || '',
            ciudad: profile.ciudad || '',
            resumen_profesional: profile.resumenProfesional || '',
            experiencia_laboral: profile.experienciaLaboral || [],
            fecha_actualizacion: new Date(),
        };

        // Regenerar embedding si las habilidades cambiaron
        if (shouldRegenerateEmbedding) {
            try {
                const embeddingText = buildEmbeddingText(profile);
                console.log(`[SyncCandidato] Generando embedding para: "${embeddingText.substring(0, 100)}..."`);

                const vector = await embeddingProvider.generateEmbedding(embeddingText);
                candidatoData.embedding_habilidades = FieldValue.vector(vector);
                candidatoData.fecha_actualizacion_vector = new Date();

                console.log(`[SyncCandidato] Embedding generado con ${vector.length} dimensiones`);
            } catch (error) {
                console.error(`[SyncCandidato] Error generando embedding para ${userId}:`, error);
                // Continuar sin el embedding, se puede regenerar después
            }
        }

        // Guardar en Firestore
        await candidatosRef.set(candidatoData, { merge: true });
        console.log(`[SyncCandidato] Candidato ${userId} sincronizado exitosamente`);
    }
);

/**
 * Cloud Function HTTP: Regenerar embeddings manualmente
 * 
 * Endpoint para regenerar embeddings de todos los candidatos o uno específico.
 * Útil para migraciones o correcciones.
 * 
 * POST /regenerate-embeddings
 * Body: { userId?: string } // Si no se especifica, procesa todos
 */
export const regenerateEmbeddings = async (userId?: string): Promise<{ processed: number; errors: number }> => {
    let processed = 0;
    let errors = 0;

    const query = userId
        ? db.collection('usuarios').where('__name__', '==', userId).where('tipoUsuario', '==', 'POSTULANTE')
        : db.collection('usuarios').where('tipoUsuario', '==', 'POSTULANTE');

    const snapshot = await query.get();

    for (const doc of snapshot.docs) {
        try {
            const userData = doc.data() as UserDocument;
            const profile = userData.candidateProfile || {};
            const embeddingText = buildEmbeddingText(profile);

            const vector = await embeddingProvider.generateEmbedding(embeddingText);

            await db.collection('candidatos').doc(doc.id).set({
                nombre: userData.nombreCompleto || '',
                habilidades_tecnicas: profile.habilidadesTecnicas || [],
                soft_skills: profile.softSkills || [],
                competencias: profile.competencias || [],
                embedding_habilidades: FieldValue.vector(vector),
                fecha_actualizacion_vector: new Date(),
            }, { merge: true });

            processed++;
            console.log(`[RegenerateEmbeddings] Procesado ${doc.id}`);
        } catch (error) {
            errors++;
            console.error(`[RegenerateEmbeddings] Error en ${doc.id}:`, error);
        }
    }

    return { processed, errors };
};
