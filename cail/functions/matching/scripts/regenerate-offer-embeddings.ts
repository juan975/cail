/**
 * Script para regenerar embeddings de ofertas existentes
 * 
 * Ejecutar con: npx ts-node scripts/regenerate-offer-embeddings.ts
 * 
 * Requiere:
 * - GOOGLE_APPLICATION_CREDENTIALS apuntando al archivo de credenciales de servicio
 * - O estar ejecutando en un entorno con ADC (Application Default Credentials)
 */

import * as admin from 'firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

// Configuración
const PROJECT_ID = 'cail-backend-prod';
const REGION = 'us-central1';
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
 * Construye el texto para generar el embedding
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
 * Genera un embedding mock basado en el texto
 * En producción, esto debería llamar a Vertex AI
 */
function generateMockEmbedding(text: string): number[] {
    // Hash simple para generar vectores consistentes
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
            const embeddingText = buildOfferEmbeddingText(ofertaData);

            console.log(`📝 [${processed + 1}/${snapshot.size}] Procesando: ${ofertaData.titulo}`);
            console.log(`   Texto: "${embeddingText.substring(0, 80)}..."`);

            // Generar embedding (mock - en producción usar Vertex AI)
            const vector = generateMockEmbedding(embeddingText);

            // Actualizar documento
            await db.collection('ofertas').doc(doc.id).update({
                embedding_oferta: FieldValue.vector(vector),
                fecha_actualizacion_embedding: new Date()
            });

            processed++;
            console.log(`   ✅ Embedding generado (${vector.length} dimensiones)\n`);
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
