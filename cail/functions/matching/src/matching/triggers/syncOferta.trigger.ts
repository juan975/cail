/**
 * Cloud Function Trigger: Sincronización ofertas → embeddings
 * 
 * Este trigger escucha cambios en documentos de la colección `ofertas`
 * y genera/actualiza el embedding cuando cambia el contenido relevante.
 * 
 * Flujo:
 * 1. Reclutador crea o actualiza una oferta
 * 2. Trigger detecta el cambio
 * 3. Si cambió título, descripción o habilidades, regenera el embedding
 * 4. Almacena embedding_oferta en el documento
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
 * Interfaz para los datos de una oferta
 */
interface OfertaData {
    titulo?: string;
    descripcion?: string;
    habilidades_obligatorias?: Array<string | { nombre: string }>;
    habilidades_deseables?: Array<string | { nombre: string }>;
    competencias_requeridas?: string[];
    id_sector_industrial?: string;
    id_nivel_requerido?: string;
    estado?: string;
    embedding_oferta?: number[];
}

/**
 * Extrae nombres de habilidades de un array que puede ser strings o objetos
 */
function extractSkillNames(skills: Array<string | { nombre: string }> | undefined): string[] {
    if (!skills || !Array.isArray(skills)) return [];

    return skills.map(skill => {
        if (typeof skill === 'string') return skill;
        if (typeof skill === 'object' && skill.nombre) return skill.nombre;
        return '';
    }).filter(Boolean);
}

/**
 * Construye el texto para generar el embedding basado en la oferta
 */
function buildOfferEmbeddingText(oferta: OfertaData): string {
    const parts: string[] = [];

    if (oferta.titulo) {
        parts.push(`Puesto: ${oferta.titulo}`);
    }

    if (oferta.descripcion) {
        parts.push(`Descripción: ${oferta.descripcion}`);
    }

    const obligatorias = extractSkillNames(oferta.habilidades_obligatorias);
    if (obligatorias.length) {
        parts.push(`Habilidades requeridas: ${obligatorias.join(', ')}`);
    }

    const deseables = extractSkillNames(oferta.habilidades_deseables);
    if (deseables.length) {
        parts.push(`Habilidades deseables: ${deseables.join(', ')}`);
    }

    if (oferta.competencias_requeridas?.length) {
        parts.push(`Competencias: ${oferta.competencias_requeridas.join(', ')}`);
    }

    return parts.join('. ') || 'Sin información especificada';
}

/**
 * Compara si el contenido relevante para embedding cambió
 */
function contentChanged(
    before: OfertaData | undefined,
    after: OfertaData | undefined
): boolean {
    // Comparar título
    if ((before?.titulo || '') !== (after?.titulo || '')) return true;

    // Comparar descripción
    if ((before?.descripcion || '') !== (after?.descripcion || '')) return true;

    // Comparar habilidades obligatorias
    const beforeObligatorias = extractSkillNames(before?.habilidades_obligatorias).sort().join(',');
    const afterObligatorias = extractSkillNames(after?.habilidades_obligatorias).sort().join(',');
    if (beforeObligatorias !== afterObligatorias) return true;

    // Comparar habilidades deseables
    const beforeDeseables = extractSkillNames(before?.habilidades_deseables).sort().join(',');
    const afterDeseables = extractSkillNames(after?.habilidades_deseables).sort().join(',');
    if (beforeDeseables !== afterDeseables) return true;

    // Comparar competencias
    const beforeCompetencias = (before?.competencias_requeridas || []).sort().join(',');
    const afterCompetencias = (after?.competencias_requeridas || []).sort().join(',');
    if (beforeCompetencias !== afterCompetencias) return true;

    return false;
}

/**
 * Cloud Function Trigger: onOfertaWritten
 * 
 * Se dispara cuando un documento de la colección `ofertas` es creado o actualizado.
 * Genera el embedding_oferta automáticamente.
 */
export const syncOfertaEmbedding = onDocumentWritten(
    {
        document: 'ofertas/{ofertaId}',
        region: REGION,
    },
    async (event: FirestoreEvent<Change<any> | undefined, { ofertaId: string }>) => {
        const ofertaId = event.params.ofertaId;
        const change = event.data;

        if (!change) {
            console.log(`[SyncOferta] No hay datos de cambio para ${ofertaId}`);
            return;
        }

        const beforeData = change.before?.data() as OfertaData | undefined;
        const afterData = change.after?.data() as OfertaData | undefined;

        // Si se eliminó la oferta, no hacer nada
        if (!afterData) {
            console.log(`[SyncOferta] Oferta ${ofertaId} eliminada, no se requiere acción`);
            return;
        }

        // Verificar si es necesario regenerar el embedding
        const needsEmbedding = !afterData.embedding_oferta ||
            afterData.embedding_oferta.length === 0 ||
            contentChanged(beforeData, afterData);

        if (!needsEmbedding) {
            console.log(`[SyncOferta] Oferta ${ofertaId} no requiere actualización de embedding`);
            return;
        }

        console.log(`[SyncOferta] Generando embedding para oferta ${ofertaId}`);

        try {
            const embeddingText = buildOfferEmbeddingText(afterData);
            console.log(`[SyncOferta] Texto para embedding: "${embeddingText.substring(0, 150)}..."`);

            const vector = await embeddingProvider.generateEmbedding(embeddingText);

            // Actualizar el documento con el nuevo embedding
            await db.collection('ofertas').doc(ofertaId).update({
                embedding_oferta: FieldValue.vector(vector),
                fecha_actualizacion_embedding: new Date()
            });

            console.log(`[SyncOferta] Embedding generado exitosamente para ${ofertaId} (${vector.length} dimensiones)`);
        } catch (error) {
            console.error(`[SyncOferta] Error generando embedding para ${ofertaId}:`, error);
            // No lanzamos el error para que el trigger no falle completamente
            // El embedding se puede regenerar en el próximo update
        }
    }
);

/**
 * Función para regenerar embeddings de todas las ofertas activas
 * Útil para migraciones o correcciones masivas
 */
export const regenerateOfertaEmbeddings = async (ofertaId?: string): Promise<{ processed: number; errors: number }> => {
    let processed = 0;
    let errors = 0;

    const query = ofertaId
        ? db.collection('ofertas').where('__name__', '==', ofertaId)
        : db.collection('ofertas').where('estado', '==', 'ACTIVA');

    const snapshot = await query.get();
    console.log(`[RegenerateOfertaEmbeddings] Procesando ${snapshot.size} ofertas`);

    for (const doc of snapshot.docs) {
        try {
            const ofertaData = doc.data() as OfertaData;
            const embeddingText = buildOfferEmbeddingText(ofertaData);

            console.log(`[RegenerateOfertaEmbeddings] Generando embedding para ${doc.id}`);
            const vector = await embeddingProvider.generateEmbedding(embeddingText);

            await db.collection('ofertas').doc(doc.id).update({
                embedding_oferta: FieldValue.vector(vector),
                fecha_actualizacion_embedding: new Date()
            });

            processed++;
            console.log(`[RegenerateOfertaEmbeddings] Procesado ${doc.id} (${processed}/${snapshot.size})`);
        } catch (error) {
            errors++;
            console.error(`[RegenerateOfertaEmbeddings] Error en ${doc.id}:`, error);
        }
    }

    console.log(`[RegenerateOfertaEmbeddings] Completado: ${processed} procesados, ${errors} errores`);
    return { processed, errors };
};
