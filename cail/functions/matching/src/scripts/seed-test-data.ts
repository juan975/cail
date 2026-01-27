/**
 * Seed Script - Datos de Prueba para Validación del Motor de Matching
 * 
 * Genera:
 * - 15 perfiles de candidatos (5 Agroindustria, 5 Salud, 5 Tecnología)
 * - 3 ofertas de trabajo (una por sector)
 * - 1 usuario reclutador para Clipp
 * 
 * Uso: npx ts-node src/scripts/seed-test-data.ts
 */

import { initializeFirebase, getFirestore } from '../config/firebase.config';
import { FieldValue } from '@google-cloud/firestore';
import {
    VertexAIEmbeddingProvider,
    VertexAIClient,
    MockEmbeddingClient
} from '../matching/infrastructure/providers/VertexAIEmbeddingProvider';

// ============================================
// CONFIGURACIÓN
// ============================================

const USE_REAL_EMBEDDINGS = process.env.NODE_ENV === 'production' || process.env.USE_REAL_EMBEDDINGS === 'true';
const PROJECT_ID = process.env.FIREBASE_PROJECT_ID || 'cail-project';

// Sectores según especificación del usuario
const SECTORS = {
    AGRO: 'SEC_AGRO',
    SALUD: 'SEC_SALUD',
    TECH: 'SEC_TECH'
} as const;

// Niveles jerárquicos
const LEVELS = {
    JUNIOR: 'NIV_JUNIOR',
    SEMI_SENIOR: 'NIV_SEMI_SENIOR',
    SENIOR: 'NIV_SENIOR',
    LEAD: 'NIV_LEAD'
} as const;

// ============================================
// DATOS DE CANDIDATOS
// ============================================

interface CandidatoSeed {
    nombre: string;
    email: string;
    habilidades_tecnicas: string[];
    id_nivel_actual: string;
    id_sector_industrial: string;
    empresa_referencia?: string;
}

const CANDIDATOS_AGRO: CandidatoSeed[] = [
    {
        nombre: 'Carlos Mendoza García',
        email: 'carlos.mendoza@email.com',
        habilidades_tecnicas: ['Control de Calidad', 'Producción Cárnica', 'HACCP', 'BPM'],
        id_nivel_actual: LEVELS.SEMI_SENIOR,
        id_sector_industrial: SECTORS.AGRO,
        empresa_referencia: 'Cafrilosa'
    },
    {
        nombre: 'María José Vélez Riofrío',
        email: 'maria.velez@email.com',
        habilidades_tecnicas: ['Ingeniería de Alimentos', 'Procesamiento Lácteo', 'Control de Calidad', 'I+D'],
        id_nivel_actual: LEVELS.SENIOR,
        id_sector_industrial: SECTORS.AGRO,
        empresa_referencia: 'Ile'
    },
    {
        nombre: 'Juan Pablo Morocho',
        email: 'juan.morocho@email.com',
        habilidades_tecnicas: ['Maquinaria Industrial', 'Mantenimiento Preventivo', 'Soldadura', 'Electricidad'],
        id_nivel_actual: LEVELS.JUNIOR,
        id_sector_industrial: SECTORS.AGRO,
        empresa_referencia: 'Cafrilosa'
    },
    {
        nombre: 'Ana Lucía Cueva Ortega',
        email: 'ana.cueva@email.com',
        habilidades_tecnicas: ['Supervisión de Planta', 'Gestión de Personal', 'Producción', 'Logística'],
        id_nivel_actual: LEVELS.LEAD,
        id_sector_industrial: SECTORS.AGRO,
        empresa_referencia: 'Ile'
    },
    {
        nombre: 'Roberto Carlos Jaramillo',
        email: 'roberto.jaramillo@email.com',
        habilidades_tecnicas: ['Análisis Microbiológico', 'Control de Calidad', 'ISO 22000', 'Laboratorio'],
        id_nivel_actual: LEVELS.SEMI_SENIOR,
        id_sector_industrial: SECTORS.AGRO,
        empresa_referencia: 'Cafrilosa'
    }
];

const CANDIDATOS_SALUD: CandidatoSeed[] = [
    {
        nombre: 'Gabriela Fernanda Espinoza',
        email: 'gabriela.espinoza@email.com',
        habilidades_tecnicas: ['Enfermería Clínica', 'UCI', 'Emergencias', 'Administración de Medicamentos'],
        id_nivel_actual: LEVELS.SEMI_SENIOR,
        id_sector_industrial: SECTORS.SALUD,
        empresa_referencia: 'Hospital San Agustín'
    },
    {
        nombre: 'Dr. Miguel Ángel Ramírez',
        email: 'miguel.ramirez@email.com',
        habilidades_tecnicas: ['Medicina General', 'Consulta Externa', 'Diagnóstico Clínico', 'Urgencias'],
        id_nivel_actual: LEVELS.SENIOR,
        id_sector_industrial: SECTORS.SALUD,
        empresa_referencia: 'Hospital San Agustín'
    },
    {
        nombre: 'Patricia Salinas Mora',
        email: 'patricia.salinas@email.com',
        habilidades_tecnicas: ['Laboratorio Clínico', 'Bioquímica', 'Hematología', 'Microbiología'],
        id_nivel_actual: LEVELS.SENIOR,
        id_sector_industrial: SECTORS.SALUD,
        empresa_referencia: 'Laboratorio Clínico Loja'
    },
    {
        nombre: 'Carmen Elena Guamán',
        email: 'carmen.guaman@email.com',
        habilidades_tecnicas: ['Auxiliar de Enfermería', 'Cuidado de Pacientes', 'Primeros Auxilios', 'Inyectología'],
        id_nivel_actual: LEVELS.JUNIOR,
        id_sector_industrial: SECTORS.SALUD,
        empresa_referencia: 'Clínica Santa María'
    },
    {
        nombre: 'Luis Fernando Castillo',
        email: 'luis.castillo@email.com',
        habilidades_tecnicas: ['Administración Hospitalaria', 'Gestión de Salud', 'Planificación', 'Presupuestos'],
        id_nivel_actual: LEVELS.LEAD,
        id_sector_industrial: SECTORS.SALUD,
        empresa_referencia: 'Hospital San Agustín'
    }
];

const CANDIDATOS_TECH: CandidatoSeed[] = [
    {
        nombre: 'Andrés Felipe Ordóñez',
        email: 'andres.ordonez@email.com',
        habilidades_tecnicas: ['Node.js', 'TypeScript', 'PostgreSQL', 'REST API', 'Docker'],
        id_nivel_actual: LEVELS.SENIOR,
        id_sector_industrial: SECTORS.TECH,
        empresa_referencia: 'Clipp'
    },
    {
        nombre: 'Sofía Alejandra Moncayo',
        email: 'sofia.moncayo@email.com',
        habilidades_tecnicas: ['React', 'TypeScript', 'CSS', 'Figma', 'Next.js'],
        id_nivel_actual: LEVELS.SEMI_SENIOR,
        id_sector_industrial: SECTORS.TECH,
        empresa_referencia: 'Clipp'
    },
    {
        nombre: 'Diego Armando Sánchez',
        email: 'diego.sanchez@email.com',
        habilidades_tecnicas: ['AWS', 'Kubernetes', 'CI/CD', 'Terraform', 'Linux'],
        id_nivel_actual: LEVELS.SENIOR,
        id_sector_industrial: SECTORS.TECH,
        empresa_referencia: 'Tech Solutions'
    },
    {
        nombre: 'Valeria Cristina Loaiza',
        email: 'valeria.loaiza@email.com',
        habilidades_tecnicas: ['Python', 'SQL', 'Power BI', 'Machine Learning', 'Estadística'],
        id_nivel_actual: LEVELS.SEMI_SENIOR,
        id_sector_industrial: SECTORS.TECH,
        empresa_referencia: 'Data Analytics Loja'
    },
    {
        nombre: 'José Manuel Programador',
        email: 'jose.programador@email.com',
        habilidades_tecnicas: ['JavaScript', 'Python', 'Testing', 'Selenium', 'Jest', 'Programación'],
        id_nivel_actual: LEVELS.SEMI_SENIOR,
        id_sector_industrial: SECTORS.TECH,
        empresa_referencia: 'Clipp'
    }
];

// ============================================
// OFERTAS DE TRABAJO
// ============================================

interface OfertaSeed {
    titulo: string;
    descripcion: string;
    id_sector_industrial: string;
    id_nivel_requerido: string;
    id_empresa: string;
    habilidades_obligatorias: { nombre: string; peso: number }[];
    habilidades_deseables: { nombre: string; peso: number }[];
    modalidad: string;
}

const OFERTAS: OfertaSeed[] = [
    {
        titulo: 'Ingeniero de Producción Agroindustrial',
        descripcion: 'Buscamos un profesional con experiencia en plantas de procesamiento de alimentos. Responsable de supervisar líneas de producción, garantizar estándares de calidad y optimizar procesos.',
        id_sector_industrial: SECTORS.AGRO,
        id_nivel_requerido: LEVELS.SENIOR,
        id_empresa: 'ENT_CAFRILOSA',
        habilidades_obligatorias: [
            { nombre: 'Control de Calidad', peso: 0.9 },
            { nombre: 'BPM', peso: 0.8 },
            { nombre: 'Producción', peso: 0.8 }
        ],
        habilidades_deseables: [
            { nombre: 'HACCP', peso: 0.5 },
            { nombre: 'ISO 22000', peso: 0.4 }
        ],
        modalidad: 'PRESENCIAL'
    },
    {
        titulo: 'Licenciado/a en Enfermería - UCI',
        descripcion: 'Hospital San Agustín requiere profesional de enfermería para unidad de cuidados intensivos. Debe tener experiencia en manejo de pacientes críticos y trabajo bajo presión.',
        id_sector_industrial: SECTORS.SALUD,
        id_nivel_requerido: LEVELS.SEMI_SENIOR,
        id_empresa: 'ENT_HOSPITAL_SA',
        habilidades_obligatorias: [
            { nombre: 'Enfermería Clínica', peso: 0.9 },
            { nombre: 'UCI', peso: 0.9 },
            { nombre: 'Emergencias', peso: 0.7 }
        ],
        habilidades_deseables: [
            { nombre: 'Administración de Medicamentos', peso: 0.5 },
            { nombre: 'Cuidado de Pacientes', peso: 0.4 }
        ],
        modalidad: 'PRESENCIAL'
    },
    {
        titulo: 'Software Developer - Backend',
        descripcion: 'Clipp busca desarrollador backend para su equipo de tecnología. Trabajará en microservicios, APIs REST y sistemas de alta disponibilidad. Ambiente ágil y remoto.',
        id_sector_industrial: SECTORS.TECH,
        id_nivel_requerido: LEVELS.SENIOR,
        id_empresa: 'ENT_CLIPP',
        habilidades_obligatorias: [
            { nombre: 'Node.js', peso: 0.9 },
            { nombre: 'TypeScript', peso: 0.8 },
            { nombre: 'REST API', peso: 0.8 }
        ],
        habilidades_deseables: [
            { nombre: 'Docker', peso: 0.5 },
            { nombre: 'PostgreSQL', peso: 0.4 },
            { nombre: 'Programación', peso: 0.3 }
        ],
        modalidad: 'REMOTO'
    }
];

// ============================================
// USUARIO RECLUTADOR
// ============================================

const RECLUTADOR_USER = {
    email: 'reclutador.clipp@test.com',
    nombre: 'María Reclutadora',
    rol: 'RECLUTADOR',
    id_empresa: 'ENT_CLIPP',
    empresa_nombre: 'Clipp',
    password: 'Test123!'
};

// ============================================
// FUNCIONES DE SEEDING
// ============================================

let tokenCount = 0;

async function createEmbeddingProvider() {
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

async function generateEmbedding(provider: VertexAIEmbeddingProvider, text: string): Promise<number[]> {
    const embedding = await provider.generateEmbedding(text);
    // Estimación de tokens: ~4 caracteres por token
    tokenCount += Math.ceil(text.length / 4);
    return embedding;
}

async function seedCandidatos(db: FirebaseFirestore.Firestore, provider: VertexAIEmbeddingProvider) {
    console.log('\n📝 Insertando candidatos...');

    const allCandidatos = [...CANDIDATOS_AGRO, ...CANDIDATOS_SALUD, ...CANDIDATOS_TECH];
    const candidatosCollection = db.collection('candidatos');

    for (const candidato of allCandidatos) {
        // Generar texto para embedding
        const textoHabilidades = candidato.habilidades_tecnicas.join(', ');
        const textoCompleto = `${candidato.nombre} - Habilidades: ${textoHabilidades}`;

        // Generar embedding
        const embedding = await generateEmbedding(provider, textoCompleto);

        // Crear documento
        const docRef = await candidatosCollection.add({
            nombre: candidato.nombre,
            email: candidato.email,
            habilidades_tecnicas: candidato.habilidades_tecnicas,
            id_nivel_actual: candidato.id_nivel_actual,
            id_sector_industrial: candidato.id_sector_industrial,
            empresa_referencia: candidato.empresa_referencia,
            embedding_habilidades: FieldValue.vector(embedding),
            created_at: FieldValue.serverTimestamp(),
            is_test_data: true
        });

        console.log(`  ✅ ${candidato.nombre} (${candidato.id_sector_industrial}) -> ${docRef.id}`);
    }

    console.log(`\n✅ ${allCandidatos.length} candidatos insertados`);
}

async function seedOfertas(db: FirebaseFirestore.Firestore) {
    console.log('\n📋 Insertando ofertas de trabajo...');

    const ofertasCollection = db.collection('ofertas');
    const ofertaIds: { [key: string]: string } = {};

    for (const oferta of OFERTAS) {
        const docRef = await ofertasCollection.add({
            ...oferta,
            estado: 'ACTIVA',
            fecha_publicacion: FieldValue.serverTimestamp(),
            created_at: FieldValue.serverTimestamp(),
            is_test_data: true
        });

        ofertaIds[oferta.id_sector_industrial] = docRef.id;
        console.log(`  ✅ ${oferta.titulo} (${oferta.id_sector_industrial}) -> ${docRef.id}`);
    }

    console.log(`\n✅ ${OFERTAS.length} ofertas insertadas`);
    return ofertaIds;
}

async function seedReclutador(db: FirebaseFirestore.Firestore) {
    console.log('\n👤 Creando usuario reclutador...');

    const usuariosCollection = db.collection('usuarios');

    // Verificar si ya existe
    const existing = await usuariosCollection
        .where('email', '==', RECLUTADOR_USER.email)
        .limit(1)
        .get();

    if (!existing.empty) {
        console.log(`  ⚠️ Usuario ${RECLUTADOR_USER.email} ya existe`);
        return existing.docs[0].id;
    }

    const docRef = await usuariosCollection.add({
        email: RECLUTADOR_USER.email,
        nombre: RECLUTADOR_USER.nombre,
        rol: RECLUTADOR_USER.rol,
        id_empresa: RECLUTADOR_USER.id_empresa,
        empresa_nombre: RECLUTADOR_USER.empresa_nombre,
        created_at: FieldValue.serverTimestamp(),
        is_test_data: true,
        // Nota: En producción, la autenticación se manejaría con Firebase Auth
        // Este usuario es para testing del motor de matching
        test_password_hash: 'TEST_ONLY_NOT_SECURE'
    });

    console.log(`  ✅ Reclutador creado: ${RECLUTADOR_USER.email} -> ${docRef.id}`);
    console.log(`  📧 Email: ${RECLUTADOR_USER.email}`);
    console.log(`  🔑 Password: ${RECLUTADOR_USER.password}`);

    return docRef.id;
}

async function seedCatalogos(db: FirebaseFirestore.Firestore) {
    console.log('\n📚 Verificando/creando catálogos...');

    const catalogosCollection = db.collection('catalogos');

    // Sectores
    const sectores = [
        { id: SECTORS.AGRO, nombre: 'Agroindustria', descripcion: 'Sector agroindustrial y procesamiento de alimentos' },
        { id: SECTORS.SALUD, nombre: 'Salud', descripcion: 'Sector de salud y servicios médicos' },
        { id: SECTORS.TECH, nombre: 'Tecnología', descripcion: 'Sector de tecnología de la información' }
    ];

    for (const sector of sectores) {
        await catalogosCollection.doc(sector.id).set({
            tipo: 'SECTOR_INDUSTRIAL',
            nombre: sector.nombre,
            descripcion: sector.descripcion,
            activo: true
        }, { merge: true });
        console.log(`  ✅ Sector: ${sector.id} - ${sector.nombre}`);
    }

    // Niveles
    const niveles = [
        { id: LEVELS.JUNIOR, nombre: 'Junior', orden: 1 },
        { id: LEVELS.SEMI_SENIOR, nombre: 'Semi-Senior', orden: 2 },
        { id: LEVELS.SENIOR, nombre: 'Senior', orden: 3 },
        { id: LEVELS.LEAD, nombre: 'Lead/Supervisor', orden: 4 }
    ];

    for (const nivel of niveles) {
        await catalogosCollection.doc(nivel.id).set({
            tipo: 'NIVEL_JERARQUICO',
            nombre: nivel.nombre,
            orden: nivel.orden,
            activo: true
        }, { merge: true });
        console.log(`  ✅ Nivel: ${nivel.id} - ${nivel.nombre}`);
    }

    console.log('\n✅ Catálogos verificados');
}

// ============================================
// MAIN
// ============================================

async function main() {
    console.log('═══════════════════════════════════════════════════════');
    console.log('🚀 CAIL - Seed de Datos de Prueba para Matching');
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

        // Ejecutar seeding
        await seedCatalogos(db);
        await seedCandidatos(db, embeddingProvider);
        const ofertaIds = await seedOfertas(db);
        await seedReclutador(db);

        // Resumen
        console.log('\n═══════════════════════════════════════════════════════');
        console.log('📊 RESUMEN DE SEEDING');
        console.log('═══════════════════════════════════════════════════════');
        console.log(`  • Candidatos: 15 (5 Agro + 5 Salud + 5 Tech)`);
        console.log(`  • Ofertas: 3 (una por sector)`);
        console.log(`  • Reclutador: ${RECLUTADOR_USER.email}`);
        console.log(`  • Tokens estimados: ~${tokenCount}`);
        console.log('═══════════════════════════════════════════════════════');
        console.log('\n🎯 IDs de Ofertas para Testing:');
        console.log(`  • Oferta Agroindustria: ${ofertaIds[SECTORS.AGRO]}`);
        console.log(`  • Oferta Salud: ${ofertaIds[SECTORS.SALUD]}`);
        console.log(`  • Oferta Tecnología (Software Developer): ${ofertaIds[SECTORS.TECH]}`);
        console.log('\n✅ Seeding completado exitosamente!\n');

    } catch (error) {
        console.error('\n❌ Error durante el seeding:', error);
        process.exit(1);
    }
}

// Ejecutar
main();
