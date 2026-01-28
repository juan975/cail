/**
 * Script para regenerar embeddings de candidatos usando ETL + Vertex AI
 * 
 * Ejecutar con: npx ts-node scripts/regenerate-candidate-embeddings.ts
 * 
 * Flujo:
 * 1. Lee candidatos de Firestore (colección candidatos)
 * 2. Envía cada candidato al servicio ETL para preprocesamiento
 * 3. Genera embedding con Vertex AI
 * 4. Actualiza el documento en Firestore
 */

import * as admin from 'firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

// Configuración
const PROJECT_ID = 'cail-backend-prod';
const REGION = 'us-central1';
const ETL_SERVICE_URL = `https://${REGION}-${PROJECT_ID}.cloudfunctions.net/etl`;
const USE_ETL = true;
const USE_VERTEX_AI = true;
const EMBEDDING_DIMENSION = 768;

// Inicializar Firebase Admin
if (!admin.apps.length) {
    admin.initializeApp({
        projectId: PROJECT_ID
    });
}

const db = admin.firestore();

/**
 * Interfaz para los datos de un candidato
 */
interface CandidatoData {
    nombre?: string;
    habilidades_tecnicas?: string[];
    soft_skills?: string[];
    competencias?: string[];
    resumen_profesional?: string;
    id_nivel_actual?: string;
    id_sector_industrial?: string;
}

interface ETLResponse {
    success: boolean;
    data?: {
        processedText: string;
        processingTimeMs?: number;
    };
    error?: string;
}

/**
 * Construye el texto para generar el embedding (fallback local)
 */
function buildCandidateEmbeddingText(candidato: CandidatoData): string {
    const parts: string[] = [];

    if (candidato.habilidades_tecnicas?.length) {
        parts.push(`Habilidades técnicas: ${candidato.habilidades_tecnicas.join(', ')}`);
    }

    if (candidato.soft_skills?.length) {
        parts.push(`Habilidades blandas: ${candidato.soft_skills.join(', ')}`);
    }

    if (candidato.competencias?.length) {
        parts.push(`Competencias: ${candidato.competencias.join(', ')}`);
    }

    if (candidato.resumen_profesional) {
        parts.push(`Perfil: ${candidato.resumen_profesional}`);
    }

    return parts.join('. ') || 'Sin habilidades especificadas';
}

/**
 * Llama al servicio ETL para preprocesar el texto del candidato
 */
async function preprocessWithETL(candidato: CandidatoData): Promise<string> {
    try {
        const response = await fetch(`${ETL_SERVICE_URL}/preprocess/candidate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                habilidadesTecnicas: candidato.habilidades_tecnicas || [],
                softSkills: candidato.soft_skills || [],
                resumenProfesional: candidato.resumen_profesional || '',
                competencias: candidato.competencias || []
            })
        });

        if (!response.ok) {
            console.log(`   ⚠️ ETL retornó ${response.status}, usando fallback local`);
            return buildCandidateEmbeddingText(candidato);
        }

        const result = await response.json() as ETLResponse;

        if (result.success && result.data?.processedText) {
            console.log(`   📝 ETL procesó en ${result.data.processingTimeMs}ms`);
            return result.data.processedText;
        }

        return buildCandidateEmbeddingText(candidato);
    } catch (error) {
        console.log(`   ⚠️ Error en ETL: ${(error as Error).message}, usando fallback`);
        return buildCandidateEmbeddingText(candidato);
    }
}

/**
 * Genera embedding usando Vertex AI
 */
async function generateVertexAIEmbedding(text: string): Promise<number[]> {
    const endpoint = `https://${REGION}-aiplatform.googleapis.com/v1/projects/${PROJECT_ID}/locations/${REGION}/publishers/google/models/text-embedding-004:predict`;

    const { GoogleAuth } = await import('google-auth-library');
    const auth = new GoogleAuth({
        scopes: ['https://www.googleapis.com/auth/cloud-platform']
    });
    const client = await auth.getClient();
    const accessToken = await client.getAccessToken();

    const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${accessToken.token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            instances: [{ content: text }]
        })
    });

    if (!response.ok) {
        throw new Error(`Vertex AI error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json() as any;
    return data.predictions[0].embeddings.values;
}

/**
 * Genera un embedding mock basado en el texto (fallback)
 */
function generateMockEmbedding(text: string): number[] {
    const hash = (str: string): number => {
        let h = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            h = ((h << 5) - h) + char;
            h = h & h;
        }
        return h;
    };

    const baseHash = hash(text);
    const vector: number[] = [];

    for (let i = 0; i < EMBEDDING_DIMENSION; i++) {
        vector.push(Math.sin(baseHash + i) * 0.5 + 0.5);
    }

    return vector;
}

/**
 * Función principal para regenerar embeddings
 */
async function regenerateCandidatoEmbeddings(): Promise<void> {
    console.log('🚀 Iniciando regeneración de embeddings de candidatos...\n');
    console.log(`📌 Configuración:`);
    console.log(`   - ETL Service: ${USE_ETL ? 'ACTIVADO' : 'DESACTIVADO'}`);
    console.log(`   - Vertex AI: ${USE_VERTEX_AI ? 'ACTIVADO' : 'Mock'}`);
    console.log('');

    // Obtener todos los candidatos
    const snapshot = await db.collection('candidatos').get();

    console.log(`📊 Encontrados ${snapshot.size} candidatos\n`);

    let processed = 0;
    let errors = 0;

    for (const doc of snapshot.docs) {
        try {
            const candidatoData = doc.data() as CandidatoData;

            console.log(`📝 [${processed + 1}/${snapshot.size}] Procesando: ${candidatoData.nombre || doc.id}`);

            // Paso 1: Preprocesar con ETL o local
            let processedText: string;
            if (USE_ETL) {
                processedText = await preprocessWithETL(candidatoData);
            } else {
                processedText = buildCandidateEmbeddingText(candidatoData);
            }
            console.log(`   Texto: "${processedText.substring(0, 80)}..."`);

            // Paso 2: Generar embedding
            let vector: number[];
            if (USE_VERTEX_AI) {
                console.log(`   🤖 Generando embedding con Vertex AI...`);
                vector = await generateVertexAIEmbedding(processedText);
            } else {
                vector = generateMockEmbedding(processedText);
            }

            // Paso 3: Actualizar documento
            await db.collection('candidatos').doc(doc.id).update({
                embedding_habilidades: FieldValue.vector(vector),
                fecha_actualizacion_vector: new Date()
            });

            processed++;
            console.log(`   ✅ Embedding generado (${vector.length} dimensiones)\n`);

            // Pequeña pausa para no saturar APIs
            await new Promise(resolve => setTimeout(resolve, 200));
        } catch (error) {
            errors++;
            console.error(`   ❌ Error en ${doc.id}:`, (error as Error).message, '\n');
        }
    }

    console.log('═'.repeat(50));
    console.log(`\n🎉 Completado!`);
    console.log(`   ✅ Procesados: ${processed}`);
    console.log(`   ❌ Errores: ${errors}`);
    console.log(`   📊 Total: ${snapshot.size}`);
}

// Ejecutar
regenerateCandidatoEmbeddings()
    .then(() => {
        console.log('\n✨ Script finalizado exitosamente');
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n💥 Error fatal:', error);
        process.exit(1);
    });
