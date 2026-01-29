/**
 * Script para regenerar embeddings de ofertas usando ETL + Vertex AI
 * 
 * Ejecutar con: npx ts-node scripts/regenerate-offer-embeddings.ts
 * 
 * Flujo:
 * 1. Lee ofertas activas de Firestore
 * 2. Envía cada oferta al servicio ETL para preprocesamiento
 * 3. Genera embedding con Vertex AI
 * 4. Actualiza el documento en Firestore
 * 
 * Requiere:
 * - GOOGLE_APPLICATION_CREDENTIALS apuntando al archivo de credenciales de servicio
 */

import * as admin from 'firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

// Configuración
const PROJECT_ID = 'cail-backend-prod';
const REGION = 'us-central1';
const ETL_SERVICE_URL = `https://${REGION}-${PROJECT_ID}.cloudfunctions.net/etl`;
const USE_ETL = true;  // Cambiar a false para usar procesamiento local
const USE_VERTEX_AI = true;  // Cambiar a false para usar mock embeddings
const EMBEDDING_DIMENSION = 768;

// Inicializar Firebase Admin
if (!admin.apps.length) {
    admin.initializeApp({
        projectId: PROJECT_ID
    });
}

const db = admin.firestore();

/**
 * Interfaz para los datos de una oferta
 */
interface OfertaData {
    titulo?: string;
    descripcion?: string;
    habilidades_obligatorias?: Array<string | { nombre: string }>;
    habilidades_deseables?: Array<string | { nombre: string }>;
    competencias_requeridas?: string[];
    estado?: string;
    embedding_oferta?: number[];
}

interface ETLResponse {
    success: boolean;
    data?: {
        processedText: string;
        skillsObligatorias?: string[];
        skillsDeseables?: string[];
        keyPhrases?: string[];
        processingTimeMs?: number;
    };
    error?: string;
}

/**
 * Extrae nombres de habilidades
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
 * Construye el texto para generar el embedding (fallback local)
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
 * Llama al servicio ETL para preprocesar el texto de la oferta
 */
async function preprocessWithETL(oferta: OfertaData): Promise<string> {
    try {
        const response = await fetch(`${ETL_SERVICE_URL}/preprocess/offer`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                titulo: oferta.titulo || '',
                descripcion: oferta.descripcion || '',
                habilidades_obligatorias: extractSkillNames(oferta.habilidades_obligatorias),
                habilidades_deseables: extractSkillNames(oferta.habilidades_deseables),
                competencias_requeridas: oferta.competencias_requeridas || []
            })
        });

        if (!response.ok) {
            console.log(`   ⚠️ ETL retornó ${response.status}, usando fallback local`);
            return buildOfferEmbeddingText(oferta);
        }

        const result = await response.json() as ETLResponse;

        if (result.success && result.data?.processedText) {
            console.log(`   📝 ETL procesó en ${result.data.processingTimeMs}ms`);
            return result.data.processedText;
        }

        return buildOfferEmbeddingText(oferta);
    } catch (error) {
        console.log(`   ⚠️ Error en ETL: ${(error as Error).message}, usando fallback`);
        return buildOfferEmbeddingText(oferta);
    }
}

/**
 * Genera embedding usando Vertex AI
 */
async function generateVertexAIEmbedding(text: string): Promise<number[]> {
    const { VertexAI } = await import('@google-cloud/vertexai');

    const vertexAI = new VertexAI({
        project: PROJECT_ID,
        location: REGION
    });

    // Usar text-embedding-004 (modelo estable de embeddings)
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
        const errorText = await response.text();
        throw new Error(`Vertex AI error: ${response.status} - ${errorText}`);
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
async function regenerateOfertaEmbeddings(): Promise<void> {
    console.log('🚀 Iniciando regeneración de embeddings de ofertas...\n');
    console.log(`📌 Configuración:`);
    console.log(`   - ETL Service: ${USE_ETL ? 'ACTIVADO' : 'DESACTIVADO'}`);
    console.log(`   - Vertex AI: ${USE_VERTEX_AI ? 'ACTIVADO' : 'Mock'}`);
    console.log('');

    // Obtener todas las ofertas activas
    const snapshot = await db.collection('ofertas')
        .where('estado', '==', 'ACTIVA')
        .get();

    console.log(`📊 Encontradas ${snapshot.size} ofertas activas\n`);

    let processed = 0;
    let errors = 0;

    for (const doc of snapshot.docs) {
        try {
            const ofertaData = doc.data() as OfertaData;

            console.log(`📝 [${processed + 1}/${snapshot.size}] Procesando: ${ofertaData.titulo}`);

            // Paso 1: Preprocesar con ETL o local
            let processedText: string;
            if (USE_ETL) {
                processedText = await preprocessWithETL(ofertaData);
            } else {
                processedText = buildOfferEmbeddingText(ofertaData);
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
            await db.collection('ofertas').doc(doc.id).update({
                embedding_oferta: FieldValue.vector(vector),
                fecha_actualizacion_embedding: new Date()
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
    console.log(`   ✅ Procesadas: ${processed}`);
    console.log(`   ❌ Errores: ${errors}`);
    console.log(`   📊 Total: ${snapshot.size}`);
}

// Ejecutar
regenerateOfertaEmbeddings()
    .then(() => {
        console.log('\n✨ Script finalizado exitosamente');
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n💥 Error fatal:', error);
        process.exit(1);
    });
