/**
 * Script para verificar y regenerar embedding de un usuario específico
 */
import * as admin from 'firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

const PROJECT_ID = 'cail-backend-prod';
const REGION = 'us-central1';
const ETL_SERVICE_URL = `https://${REGION}-${PROJECT_ID}.cloudfunctions.net/etl`;

if (!admin.apps.length) {
    admin.initializeApp({ projectId: PROJECT_ID });
}
const db = admin.firestore();

interface UserData {
    nombreCompleto?: string;
    candidateProfile?: {
        habilidadesTecnicas?: string[];
        softSkills?: string[];
        resumenProfesional?: string;
        competencias?: string[];
    };
}

async function preprocessWithETL(profile: UserData['candidateProfile']): Promise<string> {
    const payload = {
        habilidadesTecnicas: profile?.habilidadesTecnicas || [],
        softSkills: profile?.softSkills || [],
        resumenProfesional: profile?.resumenProfesional || '',
        competencias: profile?.competencias || []
    };

    console.log(`\n📤 Enviando a ETL:`);
    console.log(`   habilidadesTecnicas: [${payload.habilidadesTecnicas.join(', ')}]`);
    console.log(`   softSkills: [${payload.softSkills.join(', ')}]`);

    try {
        const response = await fetch(`${ETL_SERVICE_URL}/preprocess/candidate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            console.log(`   ⚠️ ETL error: ${response.status}, usando fallback`);
            return buildFallbackText(profile);
        }

        const result = await response.json() as any;
        console.log(`📥 Respuesta ETL:`);
        console.log(`   processedText: "${result.data?.processedText?.substring(0, 120)}..."`);

        return result.data?.processedText || buildFallbackText(profile);
    } catch (error) {
        console.log(`⚠️ ETL failed: ${(error as Error).message}, usando fallback`);
        return buildFallbackText(profile);
    }
}

function buildFallbackText(profile: UserData['candidateProfile']): string {
    const parts: string[] = [];
    if (profile?.habilidadesTecnicas?.length) {
        parts.push(`Habilidades técnicas: ${profile.habilidadesTecnicas.join(', ')}`);
    }
    if (profile?.softSkills?.length) {
        parts.push(`Habilidades blandas: ${profile.softSkills.join(', ')}`);
    }
    if (profile?.resumenProfesional) {
        parts.push(`Perfil: ${profile.resumenProfesional}`);
    }
    return parts.join('. ') || 'Sin habilidades especificadas';
}

async function generateEmbedding(text: string): Promise<number[]> {
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
        throw new Error(`Vertex AI error: ${response.status}`);
    }

    const data = await response.json() as any;
    return data.predictions[0].embeddings.values;
}

async function fixUserEmbedding(userId: string): Promise<void> {
    console.log(`\n🔍 Verificando usuario: ${userId}\n`);

    // 1. Get user from usuarios collection
    const userDoc = await db.collection('usuarios').doc(userId).get();
    if (!userDoc.exists) {
        console.log('❌ Usuario no encontrado en colección usuarios');
        return;
    }

    const userData = userDoc.data() as UserData;
    console.log(`👤 Nombre: ${userData.nombreCompleto}`);
    console.log(`📝 Habilidades: ${userData.candidateProfile?.habilidadesTecnicas?.join(', ')}`);
    console.log(`📋 Resumen: ${userData.candidateProfile?.resumenProfesional?.substring(0, 100)}...`);

    // 2. Check candidatos collection
    const candidatoDoc = await db.collection('candidatos').doc(userId).get();
    console.log(`\n📂 Existe en candidatos: ${candidatoDoc.exists}`);

    if (candidatoDoc.exists) {
        const candidatoData = candidatoDoc.data();
        console.log(`🔢 Tiene embedding: ${!!candidatoData?.embedding_habilidades}`);
        if (candidatoData?.embedding_habilidades) {
            // Check if it's a valid vector
            const embLength = Array.isArray(candidatoData.embedding_habilidades)
                ? candidatoData.embedding_habilidades.length
                : candidatoData.embedding_habilidades?.toArray?.()?.length || 'VectorValue';
            console.log(`📏 Dimensiones: ${embLength}`);
        }
    }

    // 3. Regenerate embedding
    console.log('\n🔄 Regenerando embedding...');
    const processedText = await preprocessWithETL(userData.candidateProfile);
    console.log(`📝 Texto procesado: "${processedText.substring(0, 100)}..."`);

    const vector = await generateEmbedding(processedText);
    console.log(`✅ Embedding generado: ${vector.length} dimensiones`);

    // 4. Update candidatos collection
    await db.collection('candidatos').doc(userId).set({
        nombre: userData.nombreCompleto || '',
        habilidades_tecnicas: userData.candidateProfile?.habilidadesTecnicas || [],
        soft_skills: userData.candidateProfile?.softSkills || [],
        competencias: userData.candidateProfile?.competencias || [],
        resumen_profesional: userData.candidateProfile?.resumenProfesional || '',
        embedding_habilidades: FieldValue.vector(vector),
        fecha_actualizacion_vector: new Date()
    }, { merge: true });

    console.log('✅ Candidato actualizado con nuevo embedding\n');
}

// Execute
const userId = process.argv[2] || 'Id6tHzICR9WIB5P34tZMRYcxkCx2';
fixUserEmbedding(userId)
    .then(() => {
        console.log('✨ Proceso completado');
        process.exit(0);
    })
    .catch((error) => {
        console.error('❌ Error:', error);
        process.exit(1);
    });
