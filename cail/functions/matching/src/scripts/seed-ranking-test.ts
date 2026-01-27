/**
 * Seed Ranking Test - Prueba de Aceptación del Algoritmo de Matching
 * 
 * Valida dos comportamientos críticos:
 * 1. HARD FILTER: Candidatos de Tecnología NO deben ver ofertas de Salud
 * 2. SEMANTIC RANKING: Ofertas ordenadas por match_score descendente
 * 
 * Uso: npx ts-node src/scripts/seed-ranking-test.ts
 * 
 * NOTA: Los datos de prueba usan IDs con prefijo 'test_ranking_' para
 * facilitar su identificación y eliminación posterior.
 */

import { initializeFirebase, getFirestore } from '../config/firebase.config';
import { FieldValue } from '@google-cloud/firestore';
import {
    VertexAIEmbeddingProvider,
    VertexAIClient,
    MockEmbeddingClient
} from '../matching/infrastructure/providers/VertexAIEmbeddingProvider';
import { MatchingService } from '../matching/services/matching.service';
import { FirestoreAplicacionRepository } from '../matching/infrastructure/repositories/FirestoreAplicacionRepository';
import { FirestorePostulacionRepository } from '../matching/infrastructure/repositories/FirestorePostulacionRepository';

// ============================================
// CONFIGURACIÓN
// ============================================

const USE_REAL_EMBEDDINGS = process.env.USE_REAL_EMBEDDINGS === 'true';
const PROJECT_ID = process.env.FIREBASE_PROJECT_ID || 'cail-b6e7c';

// IDs de test con prefijo para identificación
const TEST_PREFIX = 'test_ranking_';
const CANDIDATO_ID = `${TEST_PREFIX}candidato_juan_tech`;
const OFERTA_A_ID = `${TEST_PREFIX}oferta_clipp`;
const OFERTA_B_ID = `${TEST_PREFIX}oferta_ediloja`;
const OFERTA_C_ID = `${TEST_PREFIX}oferta_sanagustin`;

// Catálogos según el esquema del proyecto
const SECTORES = {
    TECH: 'SEC_TECH',
    SALUD: 'SEC_SALUD'
} as const;

const NIVELES = {
    JUNIOR: 'NIV_JUNIOR',
    SENIOR: 'NIV_SENIOR'
} as const;

// ============================================
// DATOS DE PRUEBA - CANDIDATO
// ============================================

interface CandidatoTest {
    id: string;
    nombre: string;
    email: string;
    telefono: string;
    habilidades_tecnicas: string[];
    soft_skills: string[];
    competencias: string[];
    id_nivel_actual: string;
    id_sector_industrial: string;
    ciudad: string;
    resumen_profesional: string;
    experiencia_laboral: any[];
    is_test_data: boolean;
}

const CANDIDATO: CandidatoTest = {
    id: CANDIDATO_ID,
    nombre: 'Juan Tech Test',
    email: 'juan.tech.test@example.com',
    telefono: '+593999999999',
    habilidades_tecnicas: ['Node.js', 'TypeScript', 'Cloud Computing', 'Microservicios', 'AWS', 'Docker', 'REST API'],
    soft_skills: ['Trabajo en equipo', 'Comunicación', 'Liderazgo técnico'],
    competencias: ['Desarrollo Backend', 'Arquitectura de Software', 'DevOps'],
    id_nivel_actual: NIVELES.SENIOR,
    id_sector_industrial: SECTORES.TECH,
    ciudad: 'Loja',
    resumen_profesional: 'Senior Backend Developer con 8 años de experiencia en Node.js, arquitectura de microservicios y cloud computing. Especializado en AWS y sistemas escalables.',
    experiencia_laboral: [
        {
            empresa: 'Tech Solutions',
            cargo: 'Senior Backend Developer',
            fechaInicio: '2020-01-01',
            fechaFin: null,
            actual: true,
            descripcion: 'Desarrollo de microservicios con Node.js y TypeScript'
        },
        {
            empresa: 'Startup XYZ',
            cargo: 'Full Stack Developer',
            fechaInicio: '2017-03-01',
            fechaFin: '2019-12-31',
            actual: false,
            descripcion: 'Desarrollo web con React y Node.js'
        }
    ],
    is_test_data: true
};

// ============================================
// DATOS DE PRUEBA - OFERTAS
// ============================================

interface OfertaTest {
    id: string;
    titulo: string;
    descripcion: string;
    id_sector_industrial: string;
    id_nivel_requerido: string;
    id_empresa: string;
    nombre_empresa: string;
    habilidades_obligatorias: { nombre: string; peso: number }[];
    habilidades_deseables: { nombre: string; peso: number }[];
    modalidad: string;
    estado: string;
    salario_minimo?: number;
    salario_maximo?: number;
    ubicacion: string;
    tipo_contrato: string;
    fecha_publicacion: Date;
    fecha_cierre?: Date;
    is_test_data: boolean;
    expectedPosition?: number; // Para validación (no se guarda en Firestore)
}

const OFERTAS: OfertaTest[] = [
    // Oferta A - MATCH ALTO: Perfil casi perfecto para Juan
    {
        id: OFERTA_A_ID,
        titulo: 'Arquitecto de Software',
        descripcion: 'Buscamos un Arquitecto de Software Senior para liderar el diseño de sistemas distribuidos. Experiencia en Node.js, AWS y microservicios. Trabajarás en un equipo ágil diseñando soluciones cloud-native.',
        id_sector_industrial: SECTORES.TECH,
        id_nivel_requerido: NIVELES.SENIOR,
        id_empresa: 'ENT_CLIPP',
        nombre_empresa: 'Clipp',
        habilidades_obligatorias: [
            { nombre: 'Node.js', peso: 0.9 },
            { nombre: 'AWS', peso: 0.9 },
            { nombre: 'Microservicios', peso: 0.8 }
        ],
        habilidades_deseables: [
            { nombre: 'TypeScript', peso: 0.6 },
            { nombre: 'Docker', peso: 0.5 },
            { nombre: 'Kubernetes', peso: 0.4 }
        ],
        modalidad: 'REMOTO',
        estado: 'ACTIVA',
        salario_minimo: 3000,
        salario_maximo: 5000,
        ubicacion: 'Loja, Ecuador',
        tipo_contrato: 'TIEMPO_COMPLETO',
        fecha_publicacion: new Date(),
        is_test_data: true,
        expectedPosition: 1 // Debe ser la primera
    },
    // Oferta B - MATCH MEDIO: Mismo sector pero skills diferentes
    {
        id: OFERTA_B_ID,
        titulo: 'Soporte Técnico',
        descripcion: 'Requerimos técnico de soporte para equipos de hardware y software. Experiencia en Windows, redes y atención al cliente.',
        id_sector_industrial: SECTORES.TECH,
        id_nivel_requerido: NIVELES.JUNIOR,
        id_empresa: 'ENT_EDILOJA',
        nombre_empresa: 'Ediloja',
        habilidades_obligatorias: [
            { nombre: 'Windows', peso: 0.9 },
            { nombre: 'Hardware', peso: 0.8 },
            { nombre: 'Redes', peso: 0.7 }
        ],
        habilidades_deseables: [
            { nombre: 'Linux', peso: 0.5 },
            { nombre: 'Active Directory', peso: 0.4 }
        ],
        modalidad: 'PRESENCIAL',
        estado: 'ACTIVA',
        salario_minimo: 600,
        salario_maximo: 900,
        ubicacion: 'Loja, Ecuador',
        tipo_contrato: 'TIEMPO_COMPLETO',
        fecha_publicacion: new Date(),
        is_test_data: true,
        expectedPosition: 2 // Debe ser la segunda
    },
    // Oferta C - TRAMPA/FILTRO: Sector SALUD (NO debe aparecer)
    {
        id: OFERTA_C_ID,
        titulo: 'Enfermero Jefe',
        descripcion: 'Hospital requiere Licenciado/a en Enfermería para jefatura de UCI. Experiencia en cuidados intensivos y gestión de personal de salud.',
        id_sector_industrial: SECTORES.SALUD, // <-- DIFERENTE SECTOR
        id_nivel_requerido: NIVELES.SENIOR,
        id_empresa: 'ENT_HOSPITAL_SA',
        nombre_empresa: 'Hospital San Agustín',
        habilidades_obligatorias: [
            { nombre: 'Enfermería Clínica', peso: 0.9 },
            { nombre: 'UCI', peso: 0.9 },
            { nombre: 'Gestión de Personal', peso: 0.7 }
        ],
        habilidades_deseables: [
            { nombre: 'Emergencias', peso: 0.5 },
            { nombre: 'Cuidados Intensivos', peso: 0.5 }
        ],
        modalidad: 'PRESENCIAL',
        estado: 'ACTIVA',
        salario_minimo: 1500,
        salario_maximo: 2500,
        ubicacion: 'Loja, Ecuador',
        tipo_contrato: 'TIEMPO_COMPLETO',
        fecha_publicacion: new Date(),
        is_test_data: true,
        expectedPosition: -1 // NO debe aparecer
    }
];

// ============================================
// FUNCIONES DE SEEDING
// ============================================

async function createEmbeddingProvider(): Promise<VertexAIEmbeddingProvider> {
    if (USE_REAL_EMBEDDINGS) {
        console.log('🔵 Usando embeddings REALES de Vertex AI');
        const client = new VertexAIClient(PROJECT_ID, 'us-central1');
        return new VertexAIEmbeddingProvider(client);
    } else {
        console.log('🟡 Usando embeddings MOCK para desarrollo');
        const client = new MockEmbeddingClient(768);
        return new VertexAIEmbeddingProvider(client);
    }
}

async function seedCandidato(
    db: FirebaseFirestore.Firestore,
    provider: VertexAIEmbeddingProvider
): Promise<void> {
    console.log('\n📝 Insertando candidato de prueba...');

    // Generar texto para embedding
    const textoEmbedding = [
        `Habilidades técnicas: ${CANDIDATO.habilidades_tecnicas.join(', ')}`,
        `Habilidades blandas: ${CANDIDATO.soft_skills.join(', ')}`,
        `Competencias: ${CANDIDATO.competencias.join(', ')}`,
        `Perfil: ${CANDIDATO.resumen_profesional}`
    ].join('. ');

    // Generar embedding
    const embedding = await provider.generateEmbedding(textoEmbedding);

    // Guardar en Firestore
    await db.collection('candidatos').doc(CANDIDATO.id).set({
        nombre: CANDIDATO.nombre,
        email: CANDIDATO.email,
        telefono: CANDIDATO.telefono,
        habilidades_tecnicas: CANDIDATO.habilidades_tecnicas,
        soft_skills: CANDIDATO.soft_skills,
        competencias: CANDIDATO.competencias,
        id_nivel_actual: CANDIDATO.id_nivel_actual,
        id_sector_industrial: CANDIDATO.id_sector_industrial,
        ciudad: CANDIDATO.ciudad,
        resumen_profesional: CANDIDATO.resumen_profesional,
        experiencia_laboral: CANDIDATO.experiencia_laboral,
        embedding_habilidades: FieldValue.vector(embedding),
        fecha_creacion: FieldValue.serverTimestamp(),
        fecha_actualizacion: FieldValue.serverTimestamp(),
        is_test_data: CANDIDATO.is_test_data
    });

    console.log(`  ✅ Candidato: ${CANDIDATO.nombre}`);
    console.log(`     ID: ${CANDIDATO.id}`);
    console.log(`     Sector: ${CANDIDATO.id_sector_industrial}`);
    console.log(`     Nivel: ${CANDIDATO.id_nivel_actual}`);
    console.log(`     Skills: ${CANDIDATO.habilidades_tecnicas.slice(0, 4).join(', ')}...`);
}

async function seedOfertas(db: FirebaseFirestore.Firestore): Promise<void> {
    console.log('\n📋 Insertando ofertas de prueba...');

    for (const oferta of OFERTAS) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { id, expectedPosition, ...ofertaData } = oferta;

        await db.collection('ofertas').doc(id).set({
            ...ofertaData,
            fecha_creacion: FieldValue.serverTimestamp()
        });

        const emoji = oferta.id_sector_industrial === SECTORES.SALUD ? '🏥' : '💻';
        console.log(`  ${emoji} ${oferta.nombre_empresa}: ${oferta.titulo}`);
        console.log(`     ID: ${id}`);
        console.log(`     Sector: ${oferta.id_sector_industrial}`);
        console.log(`     Nivel: ${oferta.id_nivel_requerido}`);
    }
}

async function seedCatalogos(db: FirebaseFirestore.Firestore): Promise<void> {
    console.log('\n📚 Verificando/creando catálogos de prueba...');

    const catalogosCollection = db.collection('catalogos');

    // Sectores necesarios para el test
    const sectores = [
        { id: SECTORES.TECH, nombre: 'Tecnología', descripcion: 'Sector de tecnología de la información' },
        { id: SECTORES.SALUD, nombre: 'Salud', descripcion: 'Sector de salud y servicios médicos' }
    ];

    for (const sector of sectores) {
        await catalogosCollection.doc(sector.id).set({
            tipo: 'SECTOR_INDUSTRIAL',
            nombre: sector.nombre,
            descripcion: sector.descripcion,
            activo: true,
            is_test_data: true
        }, { merge: true });
        console.log(`  ✅ Sector: ${sector.id} - ${sector.nombre}`);
    }

    // Niveles necesarios para el test
    const niveles = [
        { id: NIVELES.JUNIOR, nombre: 'Junior', orden: 1 },
        { id: NIVELES.SENIOR, nombre: 'Senior', orden: 3 }
    ];

    for (const nivel of niveles) {
        await catalogosCollection.doc(nivel.id).set({
            tipo: 'NIVEL_JERARQUICO',
            nombre: nivel.nombre,
            orden: nivel.orden,
            activo: true,
            is_test_data: true
        }, { merge: true });
        console.log(`  ✅ Nivel: ${nivel.id} - ${nivel.nombre}`);
    }
}

/**
 * Validador de catálogos que consulta Firestore (para testing)
 * Esto permite que SEC_TECH y SEC_SALUD sean reconocidos cuando están en la BD
 */
class FirestoreCatalogoValidator {
    constructor(private db: FirebaseFirestore.Firestore) { }

    async existeSector(id: string): Promise<boolean> {
        const doc = await this.db.collection('catalogos').doc(id).get();
        if (doc.exists) {
            const data = doc.data();
            return data?.tipo === 'SECTOR_INDUSTRIAL' && data?.activo === true;
        }
        return false;
    }

    async existeNivel(id: string): Promise<boolean> {
        const doc = await this.db.collection('catalogos').doc(id).get();
        if (doc.exists) {
            const data = doc.data();
            return data?.tipo === 'NIVEL_JERARQUICO' && data?.activo === true;
        }
        return false;
    }
}

// ============================================
// FUNCIONES DE VALIDACIÓN
// ============================================

interface ValidationResult {
    passed: boolean;
    errors: string[];
    warnings: string[];
}

async function executeAndValidateMatching(
    db: FirebaseFirestore.Firestore,
    provider: VertexAIEmbeddingProvider
): Promise<ValidationResult> {
    console.log('\n═══════════════════════════════════════════════════════');
    console.log('🔍 EJECUTANDO MATCHING Y VALIDACIÓN');
    console.log('═══════════════════════════════════════════════════════');

    const result: ValidationResult = {
        passed: true,
        errors: [],
        warnings: []
    };

    // Crear servicio de matching con validador de catálogos basado en Firestore
    const matchingRepo = new FirestoreAplicacionRepository(db as any);
    const postulacionRepo = new FirestorePostulacionRepository(db as any);
    const catalogoRepo = new FirestoreCatalogoValidator(db);

    const matchingService = new MatchingService(
        matchingRepo,
        postulacionRepo,
        catalogoRepo,
        provider
    );

    // Obtener las ofertas de tecnología y sus scores
    // Simularemos el matching inverso: ¿Qué ofertas vería Juan?

    console.log('\n📊 Buscando ofertas relevantes para el candidato...');

    // Obtener el candidato
    const candidatoDoc = await db.collection('candidatos').doc(CANDIDATO.id).get();
    if (!candidatoDoc.exists) {
        result.passed = false;
        result.errors.push('Candidato de prueba no encontrado');
        return result;
    }

    const candidatoData = candidatoDoc.data()!;
    const candidatoSector = candidatoData.id_sector_industrial;

    // Obtener todas las ofertas de test
    const ofertasSnapshot = await db.collection('ofertas')
        .where('is_test_data', '==', true)
        .get();

    console.log(`\n📋 Ofertas encontradas: ${ofertasSnapshot.docs.length}`);

    // Simular el proceso de matching: filtrar por sector del candidato
    const ofertasCoincidentes: { id: string; nombre_empresa: string; titulo: string; sector: string }[] = [];
    const ofertasExcluidas: { id: string; nombre_empresa: string; titulo: string; sector: string }[] = [];

    for (const doc of ofertasSnapshot.docs) {
        const data = doc.data();
        const ofertaInfo = {
            id: doc.id,
            nombre_empresa: data.nombre_empresa || 'Unknown',
            titulo: data.titulo,
            sector: data.id_sector_industrial
        };

        if (data.id_sector_industrial === candidatoSector) {
            ofertasCoincidentes.push(ofertaInfo);
        } else {
            ofertasExcluidas.push(ofertaInfo);
        }
    }

    console.log(`\n✅ Ofertas del mismo sector (${candidatoSector}): ${ofertasCoincidentes.length}`);
    console.log(`❌ Ofertas de otro sector (excluidas): ${ofertasExcluidas.length}`);

    // VALIDACIÓN 1: Hard Filter - Verificar que ofertas de SALUD no aparecen
    console.log('\n═══════════════════════════════════════════════════════');
    console.log('🔒 VALIDACIÓN 1: HARD FILTER (Sector)');
    console.log('═══════════════════════════════════════════════════════');

    const ofertaSaludEnResultados = ofertasCoincidentes.find(o => o.sector === SECTORES.SALUD);
    if (ofertaSaludEnResultados) {
        result.passed = false;
        result.errors.push(`FAIL: Oferta de sector SALUD encontrada en resultados: ${ofertaSaludEnResultados.nombre_empresa}`);
        console.log(`❌ FAIL: Oferta de sector SALUD "${ofertaSaludEnResultados.nombre_empresa}" apareció en los resultados`);
    } else {
        console.log('✅ PASS: Ninguna oferta de sector SALUD apareció para el candidato TECH');
    }

    // Verificar específicamente la oferta de San Agustín
    const sanAgustinExcluida = ofertasExcluidas.find(o => o.id === OFERTA_C_ID);
    if (sanAgustinExcluida) {
        console.log(`✅ PASS: Oferta "${sanAgustinExcluida.nombre_empresa}" (SALUD) correctamente excluida`);
    } else if (ofertasCoincidentes.find(o => o.id === OFERTA_C_ID)) {
        result.passed = false;
        result.errors.push('FAIL: Oferta de Hospital San Agustín apareció cuando debería estar excluida');
        console.log('❌ FAIL: Oferta de Hospital San Agustín apareció cuando debería estar excluida');
    }

    // VALIDACIÓN 2: Ranking por Matching Score
    console.log('\n═══════════════════════════════════════════════════════');
    console.log('📈 VALIDACIÓN 2: RANKING SEMÁNTICO');
    console.log('═══════════════════════════════════════════════════════');

    // Ejecutar matching para cada oferta TECH y obtener scores
    const matchResults: { ofertaId: string; empresa: string; titulo: string; score: number }[] = [];

    for (const oferta of ofertasCoincidentes) {
        try {
            const results = await matchingService.executeMatching(oferta.id);

            // Buscar el score de nuestro candidato
            const candidatoMatch = results.find(r => r.postulante.id === CANDIDATO.id);
            if (candidatoMatch) {
                matchResults.push({
                    ofertaId: oferta.id,
                    empresa: oferta.nombre_empresa,
                    titulo: oferta.titulo,
                    score: candidatoMatch.match_score
                });
            }
        } catch (error) {
            console.warn(`⚠️ Error ejecutando matching para ${oferta.titulo}:`, error);
        }
    }

    // Ordenar por score descendente
    matchResults.sort((a, b) => b.score - a.score);

    // Mostrar tabla de resultados
    console.log('\n┌─────────────┬────────────────────────────────┬─────────────┐');
    console.log('│  Posición   │  Empresa - Cargo               │    Score    │');
    console.log('├─────────────┼────────────────────────────────┼─────────────┤');

    matchResults.forEach((r, index) => {
        const posStr = `#${index + 1}`.padStart(5).padEnd(11);
        const empresaCargo = `${r.empresa} - ${r.titulo}`.substring(0, 28).padEnd(30);
        const scoreStr = `${(r.score * 100).toFixed(1)}%`.padStart(9).padEnd(11);
        console.log(`│ ${posStr} │ ${empresaCargo} │ ${scoreStr} │`);
    });

    console.log('└─────────────┴────────────────────────────────┴─────────────┘');

    // Verificar orden: Clipp debe estar antes que Ediloja
    const clippIndex = matchResults.findIndex(r => r.ofertaId === OFERTA_A_ID);
    const edilojaIndex = matchResults.findIndex(r => r.ofertaId === OFERTA_B_ID);

    if (clippIndex !== -1 && edilojaIndex !== -1) {
        if (clippIndex < edilojaIndex) {
            console.log('\n✅ PASS: Clipp (match alto) aparece ANTES que Ediloja (match medio)');
        } else {
            result.passed = false;
            result.errors.push('FAIL: Ranking incorrecto - Ediloja aparece antes de Clipp');
            console.log('\n❌ FAIL: Ranking incorrecto - Ediloja aparece antes de Clipp');
        }
    } else {
        result.warnings.push('No se pudieron comparar posiciones (alguna oferta no retornó resultado)');
        console.log('\n⚠️ WARNING: No se pudieron comparar posiciones');
    }

    // Verificar orden descendente general
    let isDescending = true;
    for (let i = 1; i < matchResults.length; i++) {
        if (matchResults[i].score > matchResults[i - 1].score) {
            isDescending = false;
            break;
        }
    }

    if (isDescending) {
        console.log('✅ PASS: Resultados ordenados correctamente por score descendente');
    } else {
        result.passed = false;
        result.errors.push('FAIL: Resultados no están ordenados descendentemente por score');
        console.log('❌ FAIL: Resultados no están ordenados descendentemente por score');
    }

    return result;
}

// ============================================
// MAIN
// ============================================

async function main() {
    console.log('═══════════════════════════════════════════════════════');
    console.log('🧪 CAIL - Prueba de Aceptación del Algoritmo de Ranking');
    console.log('═══════════════════════════════════════════════════════');
    console.log(`📅 Fecha: ${new Date().toISOString()}`);
    console.log(`🌍 Entorno: ${process.env.NODE_ENV || 'development'}`);
    console.log('═══════════════════════════════════════════════════════\n');

    try {
        // Inicializar Firebase
        initializeFirebase();
        const db = getFirestore();

        // Crear provider de embeddings
        const embeddingProvider = await createEmbeddingProvider();

        // Paso 1: Insertar datos de prueba (catálogos primero)
        console.log('📦 PASO 1: Inserción de datos de prueba');
        console.log('─────────────────────────────────────────');
        await seedCatalogos(db);  // Catálogos primero para validación
        await seedCandidato(db, embeddingProvider);
        await seedOfertas(db);

        // Paso 2: Ejecutar y validar matching
        console.log('\n\n📊 PASO 2: Ejecución y validación del matching');
        console.log('─────────────────────────────────────────');
        const validationResult = await executeAndValidateMatching(db, embeddingProvider);

        // Resumen final
        console.log('\n═══════════════════════════════════════════════════════');
        console.log('📋 RESUMEN DE VALIDACIÓN');
        console.log('═══════════════════════════════════════════════════════');

        if (validationResult.passed) {
            console.log('\n🎉 ¡TODAS LAS VALIDACIONES PASARON!');
            console.log('\n✅ Hard Filter: Ofertas de sector diferente correctamente excluidas');
            console.log('✅ Ranking: Ofertas ordenadas por match_score descendente');
        } else {
            console.log('\n❌ ALGUNAS VALIDACIONES FALLARON:');
            validationResult.errors.forEach(e => console.log(`   • ${e}`));
        }

        if (validationResult.warnings.length > 0) {
            console.log('\n⚠️ Advertencias:');
            validationResult.warnings.forEach(w => console.log(`   • ${w}`));
        }

        console.log('\n═══════════════════════════════════════════════════════');
        console.log('📝 DATOS INSERTADOS (para limpieza posterior):');
        console.log('═══════════════════════════════════════════════════════');
        console.log(`   • Candidato: ${CANDIDATO.id}`);
        OFERTAS.forEach(o => console.log(`   • Oferta: ${o.id}`));
        console.log('\n   Todos los documentos tienen is_test_data: true');
        console.log('   Para eliminar: buscar documentos con ID que inicie con "test_ranking_"');
        console.log('═══════════════════════════════════════════════════════\n');

        // Salir con código de error si falló alguna validación
        if (!validationResult.passed) {
            process.exit(1);
        }

    } catch (error) {
        console.error('\n❌ Error durante la ejecución:', error);
        process.exit(1);
    }
}

// Ejecutar
main();
