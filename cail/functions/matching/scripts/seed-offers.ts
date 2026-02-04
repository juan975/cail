/**
 * Script para poblar ofertas con datos completos y embeddings reales
 * 
 * Ejecutar: npx ts-node scripts/seed-offers.ts
 * 
 * Incluye:
 * - Ofertas diversas por sector industrial
 * - Todos los campos requeridos
 * - Embeddings generados con ETL + Vertex AI
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

// Sectores industriales
const SECTORES = {
    TECNOLOGIA: 'tecnologia',
    SALUD: 'salud',
    EDUCACION: 'educacion',
    FINANZAS: 'finanzas',
    MANUFACTURA: 'manufactura',
    COMERCIO: 'comercio',
    CONSTRUCCION: 'construccion',
    LOGISTICA: 'logistica'
};

// Niveles jerárquicos
const NIVELES = {
    JUNIOR: 'junior',
    SEMI_SENIOR: 'semi_senior',
    SENIOR: 'senior',
    GERENTE: 'gerente',
    DIRECTOR: 'director'
};

// Ofertas de ejemplo por sector
const OFERTAS = [
    // TECNOLOGÍA
    {
        titulo: 'Desarrollador Full Stack',
        descripcion: 'Buscamos desarrollador full stack con experiencia en React, Node.js y bases de datos. Trabajarás en proyectos de alto impacto desarrollando aplicaciones web escalables. Ambiente ágil con metodología Scrum.',
        empresa: 'TechSolutions Ecuador',
        ciudad: 'Quito',
        id_sector_industrial: SECTORES.TECNOLOGIA,
        id_nivel_requerido: NIVELES.SEMI_SENIOR,
        experiencia_requerida: '2-4 años en desarrollo web',
        formacion_requerida: 'Ingeniería en Sistemas o afines',
        modalidad: 'REMOTO',
        tipoContrato: 'TIEMPO_COMPLETO',
        salario_min: 1500,
        salario_max: 2500,
        habilidades_obligatorias: [
            { nombre: 'JavaScript', obligatoria: true, nivel_minimo: 'intermedio' },
            { nombre: 'React', obligatoria: true, nivel_minimo: 'intermedio' },
            { nombre: 'Node.js', obligatoria: true, nivel_minimo: 'basico' },
            { nombre: 'SQL', obligatoria: true, nivel_minimo: 'intermedio' }
        ],
        habilidades_deseables: [
            { nombre: 'TypeScript', obligatoria: false, nivel_minimo: 'basico' },
            { nombre: 'Docker', obligatoria: false, nivel_minimo: 'basico' },
            { nombre: 'AWS', obligatoria: false, nivel_minimo: 'basico' }
        ],
        competencias_requeridas: ['Trabajo en equipo', 'Resolución de problemas', 'Comunicación efectiva']
    },
    {
        titulo: 'Ingeniero de Datos',
        descripcion: 'Estamos en búsqueda de un ingeniero de datos para diseñar y mantener pipelines de datos. Trabajarás con grandes volúmenes de información, implementando soluciones de ETL y data warehousing.',
        empresa: 'DataInsights',
        ciudad: 'Guayaquil',
        id_sector_industrial: SECTORES.TECNOLOGIA,
        id_nivel_requerido: NIVELES.SENIOR,
        experiencia_requerida: '3-5 años en ingeniería de datos',
        formacion_requerida: 'Ingeniería en Sistemas, Estadística o afines',
        modalidad: 'HIBRIDO',
        tipoContrato: 'TIEMPO_COMPLETO',
        salario_min: 2000,
        salario_max: 3500,
        habilidades_obligatorias: [
            { nombre: 'Python', obligatoria: true, nivel_minimo: 'avanzado' },
            { nombre: 'SQL', obligatoria: true, nivel_minimo: 'avanzado' },
            { nombre: 'Apache Spark', obligatoria: true, nivel_minimo: 'intermedio' },
            { nombre: 'ETL', obligatoria: true, nivel_minimo: 'intermedio' }
        ],
        habilidades_deseables: [
            { nombre: 'BigQuery', obligatoria: false, nivel_minimo: 'basico' },
            { nombre: 'Airflow', obligatoria: false, nivel_minimo: 'basico' },
            { nombre: 'Machine Learning', obligatoria: false, nivel_minimo: 'basico' }
        ],
        competencias_requeridas: ['Pensamiento analítico', 'Atención al detalle', 'Comunicación técnica']
    },
    {
        titulo: 'Científico de Datos Junior',
        descripcion: 'Oportunidad para científico de datos en crecimiento. Aplicarás técnicas de machine learning y análisis estadístico para resolver problemas de negocio. Mentoría incluida.',
        empresa: 'AI Lab Ecuador',
        ciudad: 'Quito',
        id_sector_industrial: SECTORES.TECNOLOGIA,
        id_nivel_requerido: NIVELES.JUNIOR,
        experiencia_requerida: '0-2 años',
        formacion_requerida: 'Ingeniería, Matemáticas, Estadística o afines',
        modalidad: 'PRESENCIAL',
        tipoContrato: 'TIEMPO_COMPLETO',
        salario_min: 1200,
        salario_max: 1800,
        habilidades_obligatorias: [
            { nombre: 'Python', obligatoria: true, nivel_minimo: 'intermedio' },
            { nombre: 'Machine Learning', obligatoria: true, nivel_minimo: 'basico' },
            { nombre: 'Estadística', obligatoria: true, nivel_minimo: 'intermedio' }
        ],
        habilidades_deseables: [
            { nombre: 'TensorFlow', obligatoria: false, nivel_minimo: 'basico' },
            { nombre: 'Deep Learning', obligatoria: false, nivel_minimo: 'basico' },
            { nombre: 'NLP', obligatoria: false, nivel_minimo: 'basico' }
        ],
        competencias_requeridas: ['Curiosidad', 'Aprendizaje continuo', 'Pensamiento crítico']
    },

    // SALUD
    {
        titulo: 'Médico General',
        descripcion: 'Hospital privado requiere médico general para atención primaria. Turno rotativo. Excelente ambiente laboral y oportunidades de especialización.',
        empresa: 'Hospital San Martín',
        ciudad: 'Cuenca',
        id_sector_industrial: SECTORES.SALUD,
        id_nivel_requerido: NIVELES.SEMI_SENIOR,
        experiencia_requerida: '2-3 años en atención primaria',
        formacion_requerida: 'Título de Médico + Residencia',
        modalidad: 'PRESENCIAL',
        tipoContrato: 'TIEMPO_COMPLETO',
        salario_min: 2500,
        salario_max: 4000,
        habilidades_obligatorias: [
            { nombre: 'Diagnóstico clínico', obligatoria: true, nivel_minimo: 'avanzado' },
            { nombre: 'Atención al paciente', obligatoria: true, nivel_minimo: 'avanzado' },
            { nombre: 'Medicina preventiva', obligatoria: true, nivel_minimo: 'intermedio' }
        ],
        habilidades_deseables: [
            { nombre: 'Ultrasonido', obligatoria: false, nivel_minimo: 'basico' },
            { nombre: 'Emergencias', obligatoria: false, nivel_minimo: 'intermedio' }
        ],
        competencias_requeridas: ['Empatía', 'Trabajo bajo presión', 'Comunicación con pacientes']
    },
    {
        titulo: 'Enfermero/a UCI',
        descripcion: 'Se requiere enfermero/a para Unidad de Cuidados Intensivos. Experiencia en manejo de pacientes críticos. Disponibilidad para turnos nocturnos.',
        empresa: 'Clínica del Valle',
        ciudad: 'Loja',
        id_sector_industrial: SECTORES.SALUD,
        id_nivel_requerido: NIVELES.SENIOR,
        experiencia_requerida: '3-5 años en cuidados intensivos',
        formacion_requerida: 'Licenciatura en Enfermería + Especialidad UCI',
        modalidad: 'PRESENCIAL',
        tipoContrato: 'TIEMPO_COMPLETO',
        salario_min: 1500,
        salario_max: 2200,
        habilidades_obligatorias: [
            { nombre: 'Cuidados intensivos', obligatoria: true, nivel_minimo: 'avanzado' },
            { nombre: 'Monitoreo de signos vitales', obligatoria: true, nivel_minimo: 'avanzado' },
            { nombre: 'Administración de medicamentos', obligatoria: true, nivel_minimo: 'avanzado' }
        ],
        habilidades_deseables: [
            { nombre: 'Ventilación mecánica', obligatoria: false, nivel_minimo: 'intermedio' }
        ],
        competencias_requeridas: ['Manejo del estrés', 'Trabajo en equipo', 'Atención al detalle']
    },

    // EDUCACIÓN
    {
        titulo: 'Profesor de Matemáticas - Secundaria',
        descripcion: 'Colegio bilingüe busca profesor de matemáticas para nivel secundario. Metodología innovadora y tecnología en el aula.',
        empresa: 'Unidad Educativa Internacional',
        ciudad: 'Quito',
        id_sector_industrial: SECTORES.EDUCACION,
        id_nivel_requerido: NIVELES.SEMI_SENIOR,
        experiencia_requerida: '2-4 años como docente',
        formacion_requerida: 'Licenciatura en Matemáticas o Educación',
        modalidad: 'PRESENCIAL',
        tipoContrato: 'TIEMPO_COMPLETO',
        salario_min: 1000,
        salario_max: 1600,
        habilidades_obligatorias: [
            { nombre: 'Pedagogía', obligatoria: true, nivel_minimo: 'avanzado' },
            { nombre: 'Matemáticas avanzadas', obligatoria: true, nivel_minimo: 'avanzado' },
            { nombre: 'Evaluación educativa', obligatoria: true, nivel_minimo: 'intermedio' }
        ],
        habilidades_deseables: [
            { nombre: 'Tecnología educativa', obligatoria: false, nivel_minimo: 'intermedio' },
            { nombre: 'Inglés', obligatoria: false, nivel_minimo: 'intermedio' }
        ],
        competencias_requeridas: ['Paciencia', 'Creatividad', 'Comunicación']
    },

    // FINANZAS
    {
        titulo: 'Analista Financiero',
        descripcion: 'Empresa multinacional requiere analista financiero para elaboración de reportes, análisis de inversiones y proyecciones financieras.',
        empresa: 'Grupo Financiero del Pacífico',
        ciudad: 'Guayaquil',
        id_sector_industrial: SECTORES.FINANZAS,
        id_nivel_requerido: NIVELES.SEMI_SENIOR,
        experiencia_requerida: '2-4 años en análisis financiero',
        formacion_requerida: 'Ingeniería Comercial, Finanzas o CPA',
        modalidad: 'HIBRIDO',
        tipoContrato: 'TIEMPO_COMPLETO',
        salario_min: 1800,
        salario_max: 2800,
        habilidades_obligatorias: [
            { nombre: 'Excel avanzado', obligatoria: true, nivel_minimo: 'avanzado' },
            { nombre: 'Análisis financiero', obligatoria: true, nivel_minimo: 'avanzado' },
            { nombre: 'Estados financieros', obligatoria: true, nivel_minimo: 'avanzado' }
        ],
        habilidades_deseables: [
            { nombre: 'Power BI', obligatoria: false, nivel_minimo: 'intermedio' },
            { nombre: 'SAP', obligatoria: false, nivel_minimo: 'basico' }
        ],
        competencias_requeridas: ['Atención al detalle', 'Pensamiento analítico', 'Ética profesional']
    },
    {
        titulo: 'Contador Senior',
        descripcion: 'Buscamos contador con experiencia en normas NIIF para supervisar área contable. Manejo de declaraciones tributarias y cierres mensuales.',
        empresa: 'Corporación Andina',
        ciudad: 'Quito',
        id_sector_industrial: SECTORES.FINANZAS,
        id_nivel_requerido: NIVELES.SENIOR,
        experiencia_requerida: '4-6 años en contabilidad corporativa',
        formacion_requerida: 'CPA, Ingeniería en Contabilidad',
        modalidad: 'PRESENCIAL',
        tipoContrato: 'TIEMPO_COMPLETO',
        salario_min: 2000,
        salario_max: 3000,
        habilidades_obligatorias: [
            { nombre: 'Contabilidad NIIF', obligatoria: true, nivel_minimo: 'avanzado' },
            { nombre: 'Tributación', obligatoria: true, nivel_minimo: 'avanzado' },
            { nombre: 'Auditoría', obligatoria: true, nivel_minimo: 'intermedio' }
        ],
        habilidades_deseables: [
            { nombre: 'SAP', obligatoria: false, nivel_minimo: 'intermedio' },
            { nombre: 'Liderazgo de equipos', obligatoria: false, nivel_minimo: 'intermedio' }
        ],
        competencias_requeridas: ['Integridad', 'Organización', 'Supervisión de equipos']
    },

    // MANUFACTURA
    {
        titulo: 'Ingeniero de Producción',
        descripcion: 'Industria manufacturera requiere ingeniero de producción para optimizar procesos y aumentar eficiencia. Conocimientos en Lean Manufacturing.',
        empresa: 'Manufacturas del Ecuador',
        ciudad: 'Ambato',
        id_sector_industrial: SECTORES.MANUFACTURA,
        id_nivel_requerido: NIVELES.SEMI_SENIOR,
        experiencia_requerida: '2-4 años en manufactura',
        formacion_requerida: 'Ingeniería Industrial o afines',
        modalidad: 'PRESENCIAL',
        tipoContrato: 'TIEMPO_COMPLETO',
        salario_min: 1400,
        salario_max: 2200,
        habilidades_obligatorias: [
            { nombre: 'Lean Manufacturing', obligatoria: true, nivel_minimo: 'intermedio' },
            { nombre: 'Control de calidad', obligatoria: true, nivel_minimo: 'intermedio' },
            { nombre: 'Planificación de producción', obligatoria: true, nivel_minimo: 'avanzado' }
        ],
        habilidades_deseables: [
            { nombre: 'Six Sigma', obligatoria: false, nivel_minimo: 'basico' },
            { nombre: 'AutoCAD', obligatoria: false, nivel_minimo: 'basico' }
        ],
        competencias_requeridas: ['Liderazgo', 'Resolución de problemas', 'Trabajo bajo presión']
    },
    {
        titulo: 'Operario de Maquinaria Industrial',
        descripcion: 'Fábrica textil busca operario para manejo de maquinaria de corte y confección. Horario fijo de lunes a viernes.',
        empresa: 'Textiles Modernos',
        ciudad: 'Otavalo',
        id_sector_industrial: SECTORES.MANUFACTURA,
        id_nivel_requerido: NIVELES.JUNIOR,
        experiencia_requerida: '1 año en operación de maquinaria',
        formacion_requerida: 'Bachiller técnico',
        modalidad: 'PRESENCIAL',
        tipoContrato: 'TIEMPO_COMPLETO',
        salario_min: 500,
        salario_max: 700,
        habilidades_obligatorias: [
            { nombre: 'Operación de maquinaria', obligatoria: true, nivel_minimo: 'basico' },
            { nombre: 'Seguridad industrial', obligatoria: true, nivel_minimo: 'basico' }
        ],
        habilidades_deseables: [
            { nombre: 'Mantenimiento básico', obligatoria: false, nivel_minimo: 'basico' }
        ],
        competencias_requeridas: ['Puntualidad', 'Responsabilidad', 'Trabajo en equipo']
    },

    // COMERCIO
    {
        titulo: 'Gerente de Ventas',
        descripcion: 'Empresa comercializadora busca gerente de ventas para liderar equipo comercial. Experiencia demostrable en cumplimiento de metas.',
        empresa: 'Comercial del Sur',
        ciudad: 'Loja',
        id_sector_industrial: SECTORES.COMERCIO,
        id_nivel_requerido: NIVELES.GERENTE,
        experiencia_requerida: '5+ años en ventas, 2+ liderando equipos',
        formacion_requerida: 'Ingeniería Comercial o Marketing',
        modalidad: 'PRESENCIAL',
        tipoContrato: 'TIEMPO_COMPLETO',
        salario_min: 2000,
        salario_max: 3500,
        habilidades_obligatorias: [
            { nombre: 'Gestión de ventas', obligatoria: true, nivel_minimo: 'avanzado' },
            { nombre: 'Liderazgo de equipos', obligatoria: true, nivel_minimo: 'avanzado' },
            { nombre: 'Negociación', obligatoria: true, nivel_minimo: 'avanzado' }
        ],
        habilidades_deseables: [
            { nombre: 'CRM', obligatoria: false, nivel_minimo: 'intermedio' },
            { nombre: 'Marketing digital', obligatoria: false, nivel_minimo: 'basico' }
        ],
        competencias_requeridas: ['Liderazgo', 'Orientación a resultados', 'Comunicación persuasiva']
    },

    // LOGÍSTICA
    {
        titulo: 'Coordinador de Logística',
        descripcion: 'Empresa de distribución requiere coordinador logístico para gestión de almacén y distribución. Manejo de inventarios y rutas de entrega.',
        empresa: 'LogiExpress',
        ciudad: 'Guayaquil',
        id_sector_industrial: SECTORES.LOGISTICA,
        id_nivel_requerido: NIVELES.SEMI_SENIOR,
        experiencia_requerida: '3-4 años en logística',
        formacion_requerida: 'Ingeniería Industrial o Comercial',
        modalidad: 'PRESENCIAL',
        tipoContrato: 'TIEMPO_COMPLETO',
        salario_min: 1200,
        salario_max: 1800,
        habilidades_obligatorias: [
            { nombre: 'Gestión de inventarios', obligatoria: true, nivel_minimo: 'avanzado' },
            { nombre: 'Logística de distribución', obligatoria: true, nivel_minimo: 'intermedio' },
            { nombre: 'Excel', obligatoria: true, nivel_minimo: 'avanzado' }
        ],
        habilidades_deseables: [
            { nombre: 'SAP', obligatoria: false, nivel_minimo: 'basico' },
            { nombre: 'Power BI', obligatoria: false, nivel_minimo: 'basico' }
        ],
        competencias_requeridas: ['Organización', 'Planificación', 'Resolución de problemas']
    },

    // CONSTRUCCIÓN
    {
        titulo: 'Ingeniero Civil - Supervisor de Obra',
        descripcion: 'Constructora busca ingeniero civil para supervisión de proyectos de edificación. Disponibilidad para viajar.',
        empresa: 'Constructora Andina',
        ciudad: 'Quito',
        id_sector_industrial: SECTORES.CONSTRUCCION,
        id_nivel_requerido: NIVELES.SENIOR,
        experiencia_requerida: '4-6 años en construcción',
        formacion_requerida: 'Ingeniería Civil',
        modalidad: 'PRESENCIAL',
        tipoContrato: 'TIEMPO_COMPLETO',
        salario_min: 2000,
        salario_max: 3200,
        habilidades_obligatorias: [
            { nombre: 'Supervisión de obras', obligatoria: true, nivel_minimo: 'avanzado' },
            { nombre: 'AutoCAD', obligatoria: true, nivel_minimo: 'avanzado' },
            { nombre: 'Presupuestos de obra', obligatoria: true, nivel_minimo: 'avanzado' }
        ],
        habilidades_deseables: [
            { nombre: 'BIM', obligatoria: false, nivel_minimo: 'intermedio' },
            { nombre: 'Project Management', obligatoria: false, nivel_minimo: 'intermedio' }
        ],
        competencias_requeridas: ['Liderazgo', 'Atención al detalle', 'Trabajo bajo presión']
    }
];

// Interfaz para respuesta ETL
interface ETLResponse {
    success: boolean;
    data?: {
        processedText: string;
        processingTimeMs?: number;
    };
}

/**
 * Extrae nombres de habilidades
 */
function extractSkillNames(skills: Array<{ nombre: string } | string>): string[] {
    return skills.map(s => typeof s === 'string' ? s : s.nombre);
}

/**
 * Llama al ETL para preprocesar oferta
 */
async function preprocessWithETL(oferta: any): Promise<string> {
    try {
        const response = await fetch(`${ETL_SERVICE_URL}/preprocess/offer`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                titulo: oferta.titulo,
                descripcion: oferta.descripcion,
                habilidades_obligatorias: extractSkillNames(oferta.habilidades_obligatorias || []),
                habilidades_deseables: extractSkillNames(oferta.habilidades_deseables || []),
                competencias_requeridas: oferta.competencias_requeridas || []
            })
        });

        if (!response.ok) {
            throw new Error(`ETL error: ${response.status}`);
        }

        const result = await response.json() as ETLResponse;
        if (result.success && result.data?.processedText) {
            console.log(`   📝 ETL procesó en ${result.data.processingTimeMs}ms`);
            return result.data.processedText;
        }
        return buildFallbackText(oferta);
    } catch (error) {
        console.log(`   ⚠️ ETL falló, usando fallback`);
        return buildFallbackText(oferta);
    }
}

/**
 * Texto de fallback si ETL falla
 */
function buildFallbackText(oferta: any): string {
    const parts = [];
    if (oferta.titulo) parts.push(`Puesto: ${oferta.titulo}`);
    if (oferta.descripcion) parts.push(`Descripción: ${oferta.descripcion}`);
    const skills = [
        ...extractSkillNames(oferta.habilidades_obligatorias || []),
        ...extractSkillNames(oferta.habilidades_deseables || [])
    ];
    if (skills.length) parts.push(`Habilidades: ${skills.join(', ')}`);
    return parts.join('. ');
}

/**
 * Genera embedding con Vertex AI
 */
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

/**
 * Función principal para seed de ofertas
 */
async function seedOfertas(): Promise<void> {
    console.log('🚀 Iniciando seed de ofertas...\n');
    console.log(`📊 Total ofertas a crear: ${OFERTAS.length}\n`);

    let created = 0;
    let errors = 0;

    for (const oferta of OFERTAS) {
        try {
            console.log(`📝 [${created + errors + 1}/${OFERTAS.length}] Creando: ${oferta.titulo}`);
            console.log(`   📍 Sector: ${oferta.id_sector_industrial}`);

            // 1. Preprocesar con ETL
            const processedText = await preprocessWithETL(oferta);
            console.log(`   📄 Texto: "${processedText.substring(0, 60)}..."`);

            // 2. Generar embedding
            console.log(`   🤖 Generando embedding...`);
            const vector = await generateEmbedding(processedText);

            // 3. Crear documento en Firestore
            const ofertaDoc = {
                ...oferta,
                estado: 'ACTIVA',
                embedding_oferta: FieldValue.vector(vector),
                fechaPublicacion: new Date(),
                fecha_actualizacion_embedding: new Date(),
                createdAt: new Date(),
                updatedAt: new Date()
            };

            const docRef = await db.collection('ofertas').add(ofertaDoc);
            console.log(`   ✅ Creada con ID: ${docRef.id}\n`);
            created++;

            // Pausa para no saturar APIs
            await new Promise(r => setTimeout(r, 300));

        } catch (error) {
            errors++;
            console.error(`   ❌ Error: ${(error as Error).message}\n`);
        }
    }

    console.log('═'.repeat(50));
    console.log('\n🎉 Seed completado!');
    console.log(`   ✅ Creadas: ${created}`);
    console.log(`   ❌ Errores: ${errors}`);
    console.log(`   📊 Total: ${OFERTAS.length}`);

    console.log('\n📈 Resumen por sector:');
    const sectorCount: Record<string, number> = {};
    OFERTAS.forEach(o => {
        sectorCount[o.id_sector_industrial] = (sectorCount[o.id_sector_industrial] || 0) + 1;
    });
    Object.entries(sectorCount).forEach(([sector, count]) => {
        console.log(`   - ${sector}: ${count} ofertas`);
    });
}

// Ejecutar
seedOfertas()
    .then(() => {
        console.log('\n✨ Script finalizado');
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n💥 Error fatal:', error);
        process.exit(1);
    });
