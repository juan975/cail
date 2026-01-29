
import * as admin from 'firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

// Initialize Firebase
if (!admin.apps.length) {
    admin.initializeApp({
        projectId: 'cail-backend-prod',
        credential: admin.credential.applicationDefault()
    });
}
const db = admin.firestore();

async function debugMatching(userId: string) {
    console.log(`\n🔍 Debugging Matching for User: ${userId}`);

    // 1. Get Candidate
    const candidatoDoc = await db.collection('candidatos').doc(userId).get();
    if (!candidatoDoc.exists) {
        console.error('❌ Candidate not found in candidates collection');
        return;
    }
    const candidato = candidatoDoc.data();
    console.log(`👤 Candidate Name: ${candidato?.nombre}`);
    console.log(`🏭 Candidate Sector: '${candidato?.id_sector_industrial}'`);
    console.log(`🧬 Has Vector: ${!!candidato?.embedding_habilidades}`);

    const sectorId = candidato?.id_sector_industrial;

    if (!sectorId) {
        console.warn('⚠️  Candidate has NO sector set!');
    }

    // 2. Simulate Vector Search with Sector Filter
    console.log('\n🤖 Simulating Vector Search + Filter...');

    let query: any = db.collection('ofertas').where('estado', '==', 'ACTIVA');

    if (sectorId) {
        console.log(`[Logic] Applying filter: .where('id_sector_industrial', '==', '${sectorId}')`);
        query = query.where('id_sector_industrial', '==', sectorId);
    } else {
        console.log(`[Logic] Skipping filter (sector is empty)`);
    }

    try {
        // Note: findNearest might not work in local ts-node without specific gcloud setup 
        // but we can try basic query first
        const snapshot = await query.get();

        console.log(`\n📊 Found ${snapshot.size} offers matching the filter parameters (ignoring vector for a moment):`);
        snapshot.docs.forEach((d: any) => {
            console.log(`   - [${d.id}] ${d.data().titulo} (Sector: ${d.data().id_sector_industrial})`);
        });

        // 3. Verify if "Operario" is in the results
        const hasOperario = snapshot.docs.some((d: any) => d.data().titulo.includes('Operario'));
        if (hasOperario) {
            console.error('\n❌ TEST FAILED: "Operario" offer found despite filter!');
        } else {
            console.log('\n✅ TEST PASSED: No "Operario" offer found with this filter.');
        }

    } catch (error) {
        console.error('❌ Error executing query:', error);
    }
}

// Run for the specific user
debugMatching('Id6tHzICR9WIB5P34tZMRYcxkCx2');
