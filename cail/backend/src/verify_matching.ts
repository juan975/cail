
import { MatchingService } from './modules/matching/services/matching.service';
import { MOCK_POSTULANTES, MOCK_OFERTAS } from './modules/matching/infrastructure/mockData';

const matchingService = new MatchingService();

console.log("=== VERIFICACIÓN DE ALGORITMO DE MATCHING ===");
console.log(`Ofertas disponibles: ${MOCK_OFERTAS.length}`);
console.log(`Candidatos disponibles: ${MOCK_POSTULANTES.length}`);

MOCK_OFERTAS.forEach(oferta => {
    console.log(`\n\n---------------------------------------------------`);
    console.log(`ANALIZANDO OFERTA: ${oferta.titulo.toUpperCase()}`);
    console.log(`Descripción: ${oferta.descripcion}`);
    console.log(`Rango Esperado: ${oferta.experiencia_requerida}`);
    console.log(`---------------------------------------------------`);

    const resultados = MOCK_POSTULANTES.map(postulante => {
        const match = matchingService.calculateMatch(postulante, oferta);
        return match;
    });

    // Ordenar por score
    resultados.sort((a, b) => b.score - a.score);

    resultados.forEach((res, index) => {
        console.log(`\n#${index + 1} - ${res.postulante.nombre}`);
        console.log(`   🏆 SCORE TOTAL: ${res.score}%`);
        console.log(`   📊 Detalles:`);
        console.log(`      - Habilidades: ${res.detalles.habilidades}/40`);
        console.log(`      - Experiencia: ${res.detalles.experiencia}/30`);
        console.log(`      - Logística:   ${res.detalles.logistica}/20`);
        console.log(`      - Formación:   ${res.detalles.formacion}/10`);
    });
});
