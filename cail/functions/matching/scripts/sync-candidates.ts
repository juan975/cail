/**
 * Script para sincronizar candidatos de usuarios a la colección candidatos
 * Ejecutar con: npx ts-node scripts/sync-candidates.ts
 * 
 * MODIFICADO: Lee de candidateProfile y usa Vertex AI para embeddings reales
 */

import * as admin from 'firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

const PROJECT_ID = 'cail-backend-prod';
const REGION = 'us-central1';
const EMBEDDING_DIMENSION = 768;
const USE_VERTEX_AI = true; // Set to false for mock embeddings

if (!admin.apps.length) {
    admin.initializeApp({ projectId: PROJECT_ID });
}

const db = admin.firestore();

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
 * Genera embedding mock (fallback para testing rápido)
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
 * Construye texto para embedding del candidato
 * Lee de candidateProfile (estructura correcta del usuario)
 */
function buildCandidateEmbeddingText(profile: any): string {
    const parts: string[] = [];

    if (profile?.habilidadesTecnicas?.length) {
        parts.push(`Habilidades técnicas: ${profile.habilidadesTecnicas.join(', ')}`);
    }
    if (profile?.softSkills?.length) {
        parts.push(`Habilidades blandas: ${profile.softSkills.join(', ')}`);
    }
    if (profile?.competencias?.length) {
        parts.push(`Competencias: ${profile.competencias.join(', ')}`);
    }
    if (profile?.resumenProfesional) {
        parts.push(`Perfil: ${profile.resumenProfesional}`);
    }

    return parts.join('. ') || 'Profesional en búsqueda de empleo';
}

async function syncCandidates(): Promise<void> {
    console.log('🚀 Iniciando sincronización de candidatos...\n');
    console.log(`📌 Configuración: Vertex AI = ${USE_VERTEX_AI ? 'ACTIVADO' : 'Mock'}\n`);

    // Obtener usuarios de tipo POSTULANTE
    const usuariosSnapshot = await db.collection('usuarios')
        .where('tipoUsuario', '==', 'POSTULANTE')
        .get();

    console.log(`📊 Encontrados ${usuariosSnapshot.size} usuarios POSTULANTE\n`);

    let synced = 0;
    let errors = 0;

    for (const doc of usuariosSnapshot.docs) {
        try {
            const userData = doc.data();
            const userId = doc.id;
            const profile = userData.candidateProfile || {}; // ← LEE DE candidateProfile

            console.log(`📝 [${synced + 1}/${usuariosSnapshot.size}] Procesando: ${userData.nombreCompleto || userData.email}`);

            // Construir texto para embedding desde candidateProfile
            const embeddingText = buildCandidateEmbeddingText(profile);
            console.log(`   Texto: "${embeddingText.substring(0, 60)}..."`);

            // Generar embedding (Vertex AI o Mock)
            let vector: number[];
            if (USE_VERTEX_AI) {
                console.log(`   🤖 Generando embedding con Vertex AI...`);
                vector = await generateVertexAIEmbedding(embeddingText);
            } else {
                vector = generateMockEmbedding(embeddingText);
            }

            // Datos del candidato mapeados correctamente
            const candidatoData = {
                id: userId,
                nombre: userData.nombreCompleto || '',
                email: userData.email || '',
                // Mapear desde candidateProfile
                habilidades_tecnicas: profile.habilidadesTecnicas || [],
                soft_skills: profile.softSkills || [],
                competencias: profile.competencias || [],
                resumen_profesional: profile.resumenProfesional || '',
                id_sector_industrial: profile.sectorIndustrial || 'SEC_TECH',
                id_nivel_actual: profile.nivelProfesional || 'NIV_JUNIOR',
                ciudad: profile.ciudad || '',
                experiencia_laboral: profile.experienciaLaboral || [],
                embedding_habilidades: FieldValue.vector(vector),
                fecha_sincronizacion: new Date(),
            };

            // Guardar en colección candidatos
            await db.collection('candidatos').doc(userId).set(candidatoData, { merge: true });

            synced++;
            console.log(`   ✅ Sincronizado (${vector.length} dims) - Skills: ${candidatoData.habilidades_tecnicas.length}\n`);

            // Pequeña pausa para no saturar Vertex AI
            if (USE_VERTEX_AI) {
                await new Promise(resolve => setTimeout(resolve, 200));
            }
        } catch (error) {
            errors++;
            console.error(`   ❌ Error: ${(error as Error).message}\n`);
        }
    }

    console.log('═'.repeat(50));
    console.log(`\n🎉 Completado!`);
    console.log(`   ✅ Sincronizados: ${synced}`);
    console.log(`   ❌ Errores: ${errors}`);
}

syncCandidates()
    .then(() => {
        console.log('\n✨ Script finalizado');
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n💥 Error fatal:', error);
        process.exit(1);
    });
