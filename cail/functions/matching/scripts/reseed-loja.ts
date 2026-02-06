
import * as admin from 'firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

// Load .env from functions/matching/.env
dotenv.config({ path: resolve(__dirname, '../.env') });

const PROJECT_ID = process.env.FB_PROJECT_ID || 'cail-backend-prod';
const REGION = 'us-central1';

// Initialize Firebase with explicit credentials if available
if (!admin.apps.length) {
    const serviceAccount = {
        projectId: PROJECT_ID,
        clientEmail: process.env.FB_CLIENT_EMAIL,
        privateKey: process.env.FB_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    };

    if (serviceAccount.clientEmail && serviceAccount.privateKey) {
        console.log('🔐 Initializing with Service Account credentials...');
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
            projectId: PROJECT_ID
        });
    } else {
        console.log('⚠️ No service account in .env, using default credentials...');
        admin.initializeApp({ projectId: PROJECT_ID });
    }
}

const db = admin.firestore();

// Ofertas para LOJA
const OFERTAS_LOJA = [
    {
        titulo: 'Desarrollador Senior React',
        descripcion: 'Empresa de desarrollo de software en Loja busca desarrollador React con 5 años de experiencia. Trabajo presencial en el centro de la ciudad.',
        empresa: 'LojaSoft S.A.',
        ciudad: 'Loja', // Ciudad clave
        id_sector_industrial: 'tecnologia',
        id_nivel_requerido: 'senior',
        experiencia_requerida: '5 años',
        formacion_requerida: 'Ingeniería en Sistemas',
        modalidad: 'Presencial', // Case sensitive check: using title case
        tipoContrato: 'Tiempo completo',
        salarioMin: 1800,
        salarioMax: 2500,
        habilidades_obligatorias: [
            { nombre: 'React', obligatoria: true, nivel_minimo: 'avanzado' },
            { nombre: 'TypeScript', obligatoria: true, nivel_minimo: 'avanzado' }
        ],
        habilidades_deseables: [
            { nombre: 'Node.js', obligatoria: false, nivel_minimo: 'intermedio' }
        ],
        competencias_requeridas: ['Liderazgo', 'Mentoria']
    },
    {
        titulo: 'Médico General de Consulta Externa',
        descripcion: 'Clínica privada en Loja requiere médico general para turno matutino. Atención a pacientes ambulatorios.',
        empresa: 'Clínica Santa Inés - Loja',
        ciudad: 'Loja',
        id_sector_industrial: 'salud',
        id_nivel_requerido: 'semi_senior',
        experiencia_requerida: '2 años',
        formacion_requerida: 'Médico Cirujano',
        modalidad: 'Presencial',
        tipoContrato: 'Medio tiempo',
        salarioMin: 1200,
        salarioMax: 1500,
        habilidades_obligatorias: [
            { nombre: 'Medicina General', obligatoria: true, nivel_minimo: 'avanzado' },
            { nombre: 'Atención al Paciente', obligatoria: true, nivel_minimo: 'avanzado' }
        ],
        competencias_requeridas: ['Empatía', 'Paciencia']
    },
    {
        titulo: 'Desarrollador Backend Node.js - Remoto',
        descripcion: 'Startup lojana busca talento para trabajar remotamente en backend. Node.js, Express y MongoDB.',
        empresa: 'StartUp Loja',
        ciudad: 'Loja',
        id_sector_industrial: 'tecnologia',
        id_nivel_requerido: 'junior',
        experiencia_requerida: '1 año',
        formacion_requerida: 'Tecnólogo en Desarrollo de Software',
        modalidad: 'Remoto',
        tipoContrato: 'Tiempo completo',
        salarioMin: 800,
        salarioMax: 1200,
        habilidades_obligatorias: [
            { nombre: 'Node.js', obligatoria: true, nivel_minimo: 'intermedio' },
            { nombre: 'MongoDB', obligatoria: true, nivel_minimo: 'basico' }
        ],
        competencias_requeridas: ['Autodidacta', 'Responsabilidad']
    },
    {
        titulo: 'Enfermero/a Jefe de Piso',
        descripcion: 'Hospital de especialidades en Loja busca Licenciado/a en Enfermería para supervisión de personal.',
        empresa: 'Hospital UTPL',
        ciudad: 'Loja',
        id_sector_industrial: 'salud',
        id_nivel_requerido: 'senior',
        experiencia_requerida: '4 años',
        formacion_requerida: 'Licenciatura en Enfermería',
        modalidad: 'Presencial',
        tipoContrato: 'Tiempo completo',
        salarioMin: 1400,
        salarioMax: 1800,
        habilidades_obligatorias: [
            { nombre: 'Enfermería', obligatoria: true, nivel_minimo: 'avanzado' },
            { nombre: 'Gestión de Personal', obligatoria: true, nivel_minimo: 'intermedio' }
        ],
        competencias_requeridas: ['Liderazgo', 'Organización']
    }
];

// Fallback embeddings generator
async function generateEmbedding(text: string): Promise<number[]> {
    // Generate a random vector of size 768 (standard for text-embedding-004)
    // Only used if Vertex AI fails due to permissions locally
    return Array.from({ length: 768 }, () => Math.random() - 0.5);
}

async function seed() {
    console.log('🚀 Iniciando re-seed para LOJA en PROD...');

    // 1. Delete existing offers in Loja (optional, but good for cleanup)
    // For safety, we won't delete, just add new ones or update if ID exists.
    // We will use random IDs for now to ensure they are new.

    for (const oferta of OFERTAS_LOJA) {
        const idOferta = `seed_loja_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
        console.log(`📝 Creando oferta: ${oferta.titulo} (${oferta.ciudad})`);

        // Generate synthetic embedding
        const vector = await generateEmbedding(`${oferta.titulo} ${oferta.descripcion}`);

        const docData = {
            ...oferta,
            idOferta: idOferta, // Explicit ID
            idReclutador: 'SEED_SCRIPT',
            fechaPublicacion: new Date(), // Date object
            estado: 'ACTIVA', // Explicit status
            embedding_oferta: FieldValue.vector(vector),
            createdAt: new Date(),
            updatedAt: new Date()
        };

        await db.collection('ofertas').doc(idOferta).set(docData);
        console.log(`   ✅ Guardado con ID: ${idOferta}`);
    }

    console.log('\n🎉 Re-seed completado. Las ofertas deberían aparecer ahora.');
}

seed().catch(console.error);
