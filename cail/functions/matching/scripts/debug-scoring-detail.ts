
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

// MOCK SCORING WEIGHTS (Match production)
const SCORING_WEIGHTS = {
    SIMILITUD_VECTORIAL: 0.60,
    HABILIDADES_OBLIGATORIAS: 0.20,
    HABILIDADES_DESEABLES: 0.10,
    NIVEL_JERARQUICO: 0.10
};

function calcularScoreHabilidades(
    habilidadesCandidato: string[],
    habilidadesOferta: { nombre: string; peso: number }[]
): number {
    if (habilidadesOferta.length === 0) return 1.0;

    const habilidadesCandidatoLower = habilidadesCandidato.map(h => h.toLowerCase());
    let pesoTotal = 0;
    let pesoCoincidencias = 0;

    for (const habilidad of habilidadesOferta) {
        pesoTotal += habilidad.peso;
        // EXACT SUBSTRING MATCH ONLY
        const coincide = habilidadesCandidatoLower.some(hc =>
            hc.includes(habilidad.nombre.toLowerCase()) ||
            habilidad.nombre.toLowerCase().includes(hc)
        );
        if (coincide) pesoCoincidencias += habilidad.peso;
        else console.log(`   [MISS] '${habilidad.nombre}' not found in candidate skills`);
    }

    return pesoTotal > 0 ? pesoCoincidencias / pesoTotal : 0;
}

async function debugScoring(userId: string) {
    console.log(`\n🔍 Debugging Scoring for User: ${userId}`);
    const candidatoDoc = await db.collection('candidatos').doc(userId).get();
    const candidato = candidatoDoc.data();

    if (!candidato) { console.error('Candidate not found'); return; }

    const candidateSkills = candidato.habilidades_tecnicas || [];
    console.log('Candidate Skills:', candidateSkills);

    const offers = await db.collection('ofertas').where('titulo', 'in', ['Científico de Datos Junior', 'Desarrollador Full Stack']).get();

    offers.docs.forEach(doc => {
        const oferta = doc.data();
        console.log(`\n---------------------------------------------------`);
        console.log(`📋 OFFER: ${oferta.titulo}`);

        // 1. SKILLS
        const reqSkills = (oferta.habilidades_obligatorias || []).map((h: any) => ({ nombre: h.nombre || h, peso: h.peso || 0.8 }));
        console.log('   Required Skills:', reqSkills.map((h: any) => h.nombre).join(', '));

        const scoreObligatorias = calcularScoreHabilidades(candidateSkills, reqSkills);
        console.log(`   -> Score Obligatorias: ${scoreObligatorias.toFixed(2)}`);

        // 2. VECTOR (Mocked logic roughly, we can't do exact vector math easily here without the model)
        // heuristic: DS has Python/Pytorch (high match), FS has React (high match for Identity but low if vector model is dumb)
        // We will assume Vector is 0.8 for both for now to see if Skills are the differentiator
        const scoreSimilitud = 0.8;

        // 3. CALCULATION
        const finalScore =
            (scoreSimilitud * SCORING_WEIGHTS.SIMILITUD_VECTORIAL) +
            (scoreObligatorias * SCORING_WEIGHTS.HABILIDADES_OBLIGATORIAS) +
            (0 * SCORING_WEIGHTS.HABILIDADES_DESEABLES) + // Ignoring desirables for simplicity
            (0.5 * SCORING_WEIGHTS.NIVEL_JERARQUICO); // Assuming level mismatch or neutral

        console.log(`   🏆 ESTIMATED FINAL SCORE (Needs Vector Context): ${finalScore.toFixed(2)}`);
    });
}

debugScoring('Id6tHzICR9WIB5P34tZMRYcxkCx2');
