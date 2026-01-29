
import * as admin from 'firebase-admin';
import * as path from 'path';

// Configuración de Firebase Admin
const serviceAccountPath = path.resolve(__dirname, '../../service-account.json');

// Intenta usar las credenciales por defecto de Google si no hay service account
if (!admin.apps.length) {
    try {
        admin.initializeApp({
            credential: admin.credential.applicationDefault(),
            projectId: 'cail-backend-prod'
        });
    } catch (e) {
        console.error('Error inicializando Firebase Admin:', e);
        process.exit(1);
    }
}

const db = admin.firestore();

const technicalSkills = [
    'JavaScript', 'TypeScript', 'Python', 'Java', 'C#', 'C++', 'PHP', 'Ruby', 'Go', 'Swift', 'Kotlin', 'Rust',
    'React', 'Angular', 'Vue.js', 'Next.js', 'Node.js', 'NestJS', 'Express', 'Django', 'Flask', 'Spring Boot',
    'HTML5', 'CSS3', 'Sass', 'Tailwind CSS', 'Bootstrap',
    'SQL', 'MySQL', 'PostgreSQL', 'MongoDB', 'Firebase', 'Redis', 'Elasticsearch', 'GraphQL',
    'AWS', 'Azure', 'Google Cloud', 'Docker', 'Kubernetes', 'Terraform', 'Jenkins', 'Git', 'GitHub', 'GitLab',
    'Machine Learning', 'Deep Learning', 'TensorFlow', 'PyTorch', 'Data Analysis', 'Pandas', 'NumPy', 'Scikit-learn',
    'Tableau', 'Power BI', 'Excel', 'Figma', 'Adobe XD', 'Photoshop', 'Illustrator'
];

const softSkills = [
    'Liderazgo', 'Comunicación efectiva', 'Trabajo en equipo', 'Resolución de problemas',
    'Pensamiento crítico', 'Creatividad', 'Adaptabilidad', 'Gestión del tiempo',
    'Inteligencia emocional', 'Negociación', 'Toma de decisiones', 'Gestión de conflictos',
    'Atención al detalle', 'Proactividad', 'Empatía', 'Oratoria', 'Manejo del estrés'
];

interface CatalogItem {
    id: string;
    name: string;
    type: 'HARD' | 'SOFT';
}

async function populateCatalogs() {
    console.log('🚀 Iniciando población de catálogos...');

    const skillsItems: CatalogItem[] = [
        ...technicalSkills.map((name) => ({ id: name.toLowerCase().replace(/\s+/g, '-'), name, type: 'HARD' as const })),
        ...softSkills.map((name) => ({ id: name.toLowerCase().replace(/\s+/g, '-'), name, type: 'SOFT' as const }))
    ];

    try {
        await db.collection('catalogs').doc('skills').set({ items: skillsItems });
        console.log(`✅ Catálogo "skills" actualizado con ${skillsItems.length} elementos.`);
    } catch (error) {
        console.error('❌ Error actualizando catálogo "skills":', error);
    }

    console.log('🏁 Proceso finalizado.');
}

populateCatalogs();
