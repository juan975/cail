/**
 * Test de Verificación del Algoritmo de Matching
 * 
 * Verifica que el scoring ponderado funcione correctamente:
 * - 40% Similitud Vectorial
 * - 30% Habilidades Obligatorias  
 * - 15% Habilidades Deseables
 * - 15% Nivel Jerárquico
 * 
 * Uso: npx ts-node src/scripts/verify-matching-algorithm.ts
 */

import { initializeFirebase, getFirestore } from '../config/firebase.config';
import { MatchingService } from '../matching/services/matching.service';
import { FirestoreAplicacionRepository } from '../matching/infrastructure/repositories/FirestoreAplicacionRepository';
import { FirestorePostulacionRepository, CatalogoValidator } from '../matching/infrastructure/repositories/FirestorePostulacionRepository';
import {
    VertexAIEmbeddingProvider,
    VertexAIClient,
    MockEmbeddingClient
} from '../matching/infrastructure/providers/VertexAIEmbeddingProvider';

// ============================================
// CONFIGURACIÓN
// ============================================

const USE_REAL_EMBEDDINGS = process.env.USE_REAL_EMBEDDINGS === 'true';
const PROJECT_ID = process.env.FIREBASE_PROJECT_ID || 'cail-project';

const SCORING_WEIGHTS = {
    SIMILITUD_VECTORIAL: 0.40,
    HABILIDADES_OBLIGATORIAS: 0.30,
    HABILIDADES_DESEABLES: 0.15,
    NIVEL_JERARQUICO: 0.15
};

// ============================================
// FUNCIONES DE VERIFICACIÓN
// ============================================

async function findTechOffer(db: FirebaseFirestore.Firestore): Promise<string | null> {
    // Buscar la oferta de tecnología (Software Developer)
    const snapshot = await db.collection('ofertas')
        .where('id_sector_industrial', '==', 'SEC_TECH')
        .where('is_test_data', '==', true)
        .limit(1)
        .get();

    if (snapshot.empty) {
        console.log('⚠️ No se encontró la oferta de tecnología');

        // Intentar buscar cualquier oferta de tech
        const fallback = await db.collection('ofertas')
            .where('id_sector_industrial', '==', 'SEC_TECH')
            .limit(1)
            .get();

        if (!fallback.empty) {
            return fallback.docs[0].id;
        }
        return null;
    }

    return snapshot.docs[0].id;
}

async function verifyAlgorithm(service: MatchingService, offerId: string) {
    console.log('\n📊 Ejecutando Matching para Oferta de Tecnología...');
    console.log(`   Oferta ID: ${offerId}`);

    const startTime = Date.now();
    const results = await service.executeMatching(offerId);
    const endTime = Date.now();

    console.log(`\n⏱️  Tiempo de ejecución: ${endTime - startTime}ms`);
    console.log(`📋 Candidatos encontrados: ${results.length}`);

    if (results.length === 0) {
        console.log('\n⚠️ No se encontraron candidatos para esta oferta');
        console.log('   Posibles causas:');
        console.log('   - No hay candidatos con sector SEC_TECH');
        console.log('   - Los embeddings no se generaron correctamente');
        return;
    }

    console.log('\n═══════════════════════════════════════════════════════');
    console.log('📈 RANKING DE CANDIDATOS');
    console.log('═══════════════════════════════════════════════════════');

    results.forEach((result, index) => {
        const { postulante, match_score, score_detalle } = result;

        console.log(`\n🏆 #${index + 1} - ${postulante.nombre}`);
        console.log(`   Score Total: ${(match_score * 100).toFixed(1)}%`);
        console.log(`   Sector: ${postulante.id_sector_industrial}`);
        console.log(`   Nivel: ${postulante.id_nivel_actual}`);
        console.log(`   Habilidades: ${postulante.habilidades_tecnicas.slice(0, 3).join(', ')}...`);
        console.log(`   ─────────────────────────────────────`);
        console.log(`   Desglose de Score:`);
        console.log(`     • Vectorial (40%):     ${(score_detalle.similitud_vectorial * 100).toFixed(1)}%`);
        console.log(`     • Obligatorias (30%):  ${(score_detalle.habilidades_obligatorias * 100).toFixed(1)}%`);
        console.log(`     • Deseables (15%):     ${(score_detalle.habilidades_deseables * 100).toFixed(1)}%`);
        console.log(`     • Nivel (15%):         ${(score_detalle.nivel_jerarquico * 100).toFixed(1)}%`);
    });

    // Verificaciones
    console.log('\n═══════════════════════════════════════════════════════');
    console.log('✅ VERIFICACIONES DEL ALGORITMO');
    console.log('═══════════════════════════════════════════════════════');

    // 1. Verificar que todos son del sector correcto (filtro duro)
    const allTech = results.every(r => r.postulante.id_sector_industrial === 'SEC_TECH');
    console.log(`\n1. Filtro de Sector (Duro):`);
    console.log(`   ${allTech ? '✅' : '❌'} Todos los candidatos son del sector SEC_TECH: ${allTech}`);

    // 2. Verificar orden descendente
    let isDescending = true;
    for (let i = 1; i < results.length; i++) {
        if (results[i].match_score > results[i - 1].match_score) {
            isDescending = false;
            break;
        }
    }
    console.log(`\n2. Ordenamiento:`);
    console.log(`   ${isDescending ? '✅' : '❌'} Candidatos ordenados por score descendente: ${isDescending}`);

    // 3. Verificar ponderación calculada correctamente
    const firstResult = results[0];
    const expectedScore =
        (firstResult.score_detalle.similitud_vectorial * SCORING_WEIGHTS.SIMILITUD_VECTORIAL) +
        (firstResult.score_detalle.habilidades_obligatorias * SCORING_WEIGHTS.HABILIDADES_OBLIGATORIAS) +
        (firstResult.score_detalle.habilidades_deseables * SCORING_WEIGHTS.HABILIDADES_DESEABLES) +
        (firstResult.score_detalle.nivel_jerarquico * SCORING_WEIGHTS.NIVEL_JERARQUICO);

    const scoreDiff = Math.abs(expectedScore - firstResult.match_score);
    const ponderacionOk = scoreDiff < 0.01;

    console.log(`\n3. Ponderación (40/30/15/15):`);
    console.log(`   ${ponderacionOk ? '✅' : '❌'} Score calculado correctamente`);
    console.log(`   Score esperado: ${(expectedScore * 100).toFixed(2)}%`);
    console.log(`   Score actual:   ${(firstResult.match_score * 100).toFixed(2)}%`);

    // 4. Verificar match semántico (Programador vs Software Developer)
    const programadorMatch = results.find(r =>
        r.postulante.habilidades_tecnicas.some(h =>
            h.toLowerCase().includes('programación') ||
            h.toLowerCase().includes('programador')
        )
    );

    console.log(`\n4. Match Semántico (Programador ↔ Software Developer):`);
    if (programadorMatch) {
        console.log(`   ✅ Candidato con "Programación" encontrado: ${programadorMatch.postulante.nombre}`);
        console.log(`   Score: ${(programadorMatch.match_score * 100).toFixed(1)}%`);
    } else {
        console.log(`   ⚠️ No se encontró candidato con habilidad "Programación"`);
    }

    // Resumen final
    const allPassed = allTech && isDescending && ponderacionOk;
    console.log('\n═══════════════════════════════════════════════════════');
    console.log(allPassed ? '🎉 TODAS LAS VERIFICACIONES PASARON' : '⚠️ ALGUNAS VERIFICACIONES FALLARON');
    console.log('═══════════════════════════════════════════════════════\n');

    return results;
}

// ============================================
// MAIN
// ============================================

async function main() {
    console.log('═══════════════════════════════════════════════════════');
    console.log('🔬 CAIL - Verificación del Algoritmo de Matching');
    console.log('═══════════════════════════════════════════════════════');
    console.log(`📅 Fecha: ${new Date().toISOString()}`);
    console.log(`🌍 Entorno: ${process.env.NODE_ENV || 'development'}`);
    console.log('═══════════════════════════════════════════════════════');

    try {
        // Inicializar Firebase
        initializeFirebase();
        const db = getFirestore();

        // Crear provider de embeddings
        let embeddingProvider: VertexAIEmbeddingProvider;
        if (USE_REAL_EMBEDDINGS) {
            console.log('\n🔵 Usando embeddings REALES de Vertex AI');
            const client = new VertexAIClient(PROJECT_ID, 'us-central1');
            embeddingProvider = new VertexAIEmbeddingProvider(client);
        } else {
            console.log('\n🟡 Usando embeddings MOCK para desarrollo');
            const client = new MockEmbeddingClient(768);
            embeddingProvider = new VertexAIEmbeddingProvider(client);
        }

        // Crear repositorios
        const matchingRepo = new FirestoreAplicacionRepository(db as any);
        const postulacionRepo = new FirestorePostulacionRepository(db as any);
        const catalogoRepo = new CatalogoValidator();

        // Crear servicio
        const matchingService = new MatchingService(
            matchingRepo,
            postulacionRepo,
            catalogoRepo,
            embeddingProvider
        );

        // Buscar oferta de tecnología
        const techOfferId = await findTechOffer(db);

        if (!techOfferId) {
            console.error('\n❌ No se encontró ninguna oferta de tecnología');
            console.log('   Por favor ejecuta primero: npx ts-node src/scripts/seed-test-data.ts');
            process.exit(1);
        }

        // Ejecutar verificación
        await verifyAlgorithm(matchingService, techOfferId);

        console.log('✅ Verificación completada!\n');

    } catch (error) {
        console.error('\n❌ Error durante la verificación:', error);
        process.exit(1);
    }
}

// Ejecutar
main();
