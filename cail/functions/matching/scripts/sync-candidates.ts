/**
 * Script para sincronizar candidatos de usuarios a la colección candidatos
 * Ejecutar con: npx ts-node scripts/sync-candidates.ts
 */

import * as admin from 'firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

const PROJECT_ID = 'cail-backend-prod';
const EMBEDDING_DIMENSION = 768;

if (!admin.apps.length) {
    admin.initializeApp({ projectId: PROJECT_ID });
}

const db = admin.firestore();

/**
 * Genera embedding mock (en producción usar Vertex AI)
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
 */
function buildCandidateEmbeddingText(userData: any): string {
    const parts: string[] = [];

    if (userData.habilidadesTecnicas?.length) {
        parts.push(`Habilidades técnicas: ${userData.habilidadesTecnicas.join(', ')}`);
    }
    if (userData.softSkills?.length) {
        parts.push(`Habilidades blandas: ${userData.softSkills.join(', ')}`);
    }
    if (userData.competencias?.length) {
        parts.push(`Competencias: ${userData.competencias.join(', ')}`);
    }
    if (userData.resumenProfesional) {
        parts.push(`Perfil: ${userData.resumenProfesional}`);
    }

    return parts.join('. ') || 'Profesional en búsqueda de empleo';
}

async function syncCandidates(): Promise<void> {
    console.log('🚀 Iniciando sincronización de candidatos...\n');

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

            console.log(`📝 [${synced + 1}/${usuariosSnapshot.size}] Procesando: ${userData.nombre || userData.email}`);

            // Construir datos del candidato
            const embeddingText = buildCandidateEmbeddingText(userData);
            const vector = generateMockEmbedding(embeddingText);

            const candidatoData = {
                id: userId,
                nombre: userData.nombre || '',
                email: userData.email || '',
                habilidades_tecnicas: userData.habilidadesTecnicas || [],
                soft_skills: userData.softSkills || [],
                competencias: userData.competencias || [],
                resumen_profesional: userData.resumenProfesional || '',
                id_sector_industrial: userData.sectorIndustrial || userData.id_sector_industrial || 'SEC_TECH',
                id_nivel_actual: userData.nivelJerarquico || userData.id_nivel_actual || 'NIV_JR',
                embedding_habilidades: FieldValue.vector(vector),
                fecha_sincronizacion: new Date(),
            };

            // Guardar en colección candidatos
            await db.collection('candidatos').doc(userId).set(candidatoData, { merge: true });

            synced++;
            console.log(`   ✅ Sincronizado con sector: ${candidatoData.id_sector_industrial}\n`);
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
