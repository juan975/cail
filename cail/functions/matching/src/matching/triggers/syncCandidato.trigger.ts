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
 * 4. Si cambiaron las habilidades:
 *    a. Llama al ETL para preprocesar el texto
 *    b. Envía texto procesado a Vertex AI para embeddings
 */

import { onDocumentWritten, Change, FirestoreEvent } from 'firebase-functions/v2/firestore';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { createEmbeddingProvider } from '../infrastructure/providers/VertexAIEmbeddingProvider';

// Configuración del proyecto
const PROJECT_ID = process.env.GCLOUD_PROJECT || 'cail-backend-prod';
const REGION = 'us-central1';
const ETL_SERVICE_URL = `https://${REGION}-${PROJECT_ID}.cloudfunctions.net/etl`;

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

interface ETLResponse {
    success: boolean;
    data?: {
        processedText: string;
        skillsNormalized?: string[];
        keyPhrases?: string[];
        processingTimeMs?: number;
    };
    error?: string;
}

/**
 * Llama al servicio ETL para preprocesar el texto del candidato
 */
async function preprocessCandidateWithETL(profile: CandidateProfileData): Promise<string> {
    try {
        const response = await fetch(`${ETL_SERVICE_URL}/preprocess/candidate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                habilidadesTecnicas: profile.habilidadesTecnicas || [],
                softSkills: profile.softSkills || [],
                resumenProfesional: profile.resumenProfesional || '',
                competencias: profile.competencias || []
            })
        });

        if (!response.ok) {
            console.warn(`[SyncCandidato] ETL respondió con error ${response.status}, usando fallback`);
            return buildFallbackEmbeddingText(profile);
        }

        const result = await response.json() as ETLResponse;

        if (result.success && result.data?.processedText) {
            console.log(`[SyncCandidato] ETL procesó texto en ${result.data.processingTimeMs}ms`);
            return result.data.processedText;
        }

        return buildFallbackEmbeddingText(profile);
    } catch (error) {
        console.warn(`[SyncCandidato] Error llamando a ETL, usando fallback:`, error);
        return buildFallbackEmbeddingText(profile);
    }
}

/**
 * Construye el texto de embedding sin ETL (fallback)
 */
function buildFallbackEmbeddingText(profile: CandidateProfileData): string {
    const parts: string[] = [];

    // [CRITICAL] IDENTITY FIRST: The professional summary defines "WHO" the candidate is (e.g., "Software Engineer").
    // We place this first and repeat it to set the primary semantic context.
    if (profile.resumenProfesional) {
        parts.push(`ROL PRINCIPAL: ${profile.resumenProfesional}.`);
        parts.push(`RESUMEN PROFESIONAL: ${profile.resumenProfesional}.`);
    }

    // [SUPPORTING] SKILLS SECOND: The skills support the role.
    // Repeating them ensures they are captured, but the context is now set by the role above.
    if (profile.habilidadesTecnicas?.length) {
        const skillsString = profile.habilidadesTecnicas.join(', ');
        parts.push(`Dominio tecnológico experto en: ${skillsString}.`);
        parts.push(`Stack técnico: ${skillsString}.`);
    }

    // [CONTEXT] Additional details
    if (profile.softSkills?.length) {
        parts.push(`Habilidades blandas: ${profile.softSkills.join(', ')}`);
    }

    if (profile.competencias?.length) {
        parts.push(`Otras competencias: ${profile.competencias.join(', ')}`);
    }

    // Explicitly add sector context if available to semantic search
    if (profile.sectorIndustrial) {
        parts.push(`Industria o sector de enfoque: ${profile.sectorIndustrial}`);
    }

    return parts.join(' ');
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

    // También verificar si cambió el resumen
    const beforeResumen = before?.resumenProfesional || '';
    const afterResumen = after?.resumenProfesional || '';

    return beforeSkills !== afterSkills || beforeResumen !== afterResumen;
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
                // Paso 1: Preprocesar con ETL
                console.log(`[SyncCandidato] Preprocesando con ETL...`);
                const processedText = await preprocessCandidateWithETL(profile);
                console.log(`[SyncCandidato] Texto procesado: "${processedText.substring(0, 100)}..."`);

                // Paso 2: Generar embedding con Vertex AI
                console.log(`[SyncCandidato] Generando embedding con Vertex AI...`);
                const vector = await embeddingProvider.generateEmbedding(processedText);
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

            // Preprocesar con ETL
            const processedText = await preprocessCandidateWithETL(profile);

            // Generar embedding
            const vector = await embeddingProvider.generateEmbedding(processedText);

            await db.collection('candidatos').doc(doc.id).set({
                nombre: userData.nombreCompleto || '',
                habilidades_tecnicas: profile.habilidadesTecnicas || [],
                soft_skills: profile.softSkills || [],
                competencias: profile.competencias || [],
                id_sector_industrial: profile.sectorIndustrial || '', // Ensure sector is preserved
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
