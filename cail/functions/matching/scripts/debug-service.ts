
import * as admin from 'firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import { MatchingService } from '../src/matching/services/matching.service';
import { FirestoreAplicacionRepository } from '../src/matching/infrastructure/repositories/FirestoreAplicacionRepository';
import { FirestorePostulacionRepository, CatalogoValidator } from '../src/matching/infrastructure/repositories/FirestorePostulacionRepository';

// Mock Embedding Provider
const mockEmbeddingProvider = {
    generateEmbedding: async (text: string) => {
        console.log(`[MockProvider] Generating embedding for: "${text.substring(0, 50)}..."`);
        return new Array(768).fill(0.1); // Return dummy vector
    }
};

// Initialize Firebase
if (!admin.apps.length) {
    admin.initializeApp({
        projectId: 'cail-backend-prod',
        credential: admin.credential.applicationDefault()
    });
}
const db = admin.firestore();

async function debugService(userId: string) {
    console.log(`\n🔍 Debugging Matching Service for User: ${userId}`);

    // Setup Dependencies
    const matchingRepo = new FirestoreAplicacionRepository(db);
    const postulacionRepo = new FirestorePostulacionRepository(db);
    const catalogoRepo = new CatalogoValidator();

    const service = new MatchingService(
        matchingRepo,
        postulacionRepo,
        catalogoRepo,
        mockEmbeddingProvider
    );

    try {
        console.log('🚀 Calling getOffersForCandidate...');
        const results = await service.getOffersForCandidate(userId, 20);

        console.log(`\n📊 Service returned ${results.length} offers.`);
        results.forEach(r => {
            console.log(`   - [${r.oferta.id}] ${r.oferta.titulo} (Sector: ${r.oferta.id_sector_industrial}) Score: ${r.match_score}`);
        });

        const hasOperario = results.some(r => r.oferta.titulo.includes('Operario'));
        if (hasOperario) {
            console.error('\n❌ TEST FAILED: "Operario" offer found! Filtering is broken in Service layer.');
        } else {
            console.log('\n✅ TEST PASSED: No "Operario" offer found.');
        }

    } catch (error) {
        console.error('❌ Service Error:', error);
    }
}

// Run for the specific user
debugService('Id6tHzICR9WIB5P34tZMRYcxkCx2');
