// src/modules/matching/infrastructure/mockData.ts
import { Postulante, Oferta } from '../domain/types';

export const MOCK_OFERTAS: Oferta[] = [
    {
        id_oferta: 1,
        titulo: "Desarrollador Backend Senior",
        descripcion: "Buscamos un experto en Node.js y Typescript para arquitectura serverless. Debe conocer bases de datos SQL y NoSQL.",
        modalidad: "Remoto",
        ciudad: "Loja",
        competencias_requeridas: ["Liderazgo", "Comunicación efectiva", "Resolución de problemas"],
        formacion_requerida: "Ingeniería en Sistemas",
        experiencia_requerida: "Mínimo 3 años manejando microservicios y APIs REST."
    },
    {
        id_oferta: 2,
        titulo: "Desarrollador Frontend React",
        descripcion: "Especialista en React Native y web con experiencia en UI/UX y maquetación fiel a diseño.",
        modalidad: "Presencial",
        ciudad: "Quito",
        competencias_requeridas: ["Creatividad", "Atención al detalle", "Trabajo en equipo"],
        formacion_requerida: "Diseño Gráfico o Ingeniería en Sistemas",
        experiencia_requerida: "2 años en desarrollo móvil con React Native."
    }
];

export const MOCK_POSTULANTES: Postulante[] = [
    {
        id_postulante: 101,
        nombre: "Juan Perez (Match Alto - Backend)",
        ciudad: "Loja",
        resumen_profesional: "Desarrollador de software apasionado por el backend.",
        modalidad_preferida: "Remoto",
        habilidades_tecnicas: ["Node.js", "TypeScript", "SQL", "Docker", "Firebase"],
        competencias: ["Liderazgo", "Trabajo en equipo", "Resolución de problemas"],
        formacion: [
            { id_formacion: 1, titulo_carrera: "Ingeniería en Sistemas", nivel_educacion: "Tercer Nivel" }
        ],
        experiencia: [
            {
                id_experiencia: 1,
                cargo: "Desarrollador Backend",
                fecha_inicio: "2020-01-01",
                fecha_fin: "2023-01-01",
                descripcion_responsabilidades: "Desarrollo de microservicios y APIs REST usando Node.js."
            }
        ]
    },
    {
        id_postulante: 102,
        nombre: "Maria Gomez (Match Bajo - Backend)",
        ciudad: "Quito",
        resumen_profesional: "Diseñadora gráfica creativa.",
        modalidad_preferida: "Presencial",
        habilidades_tecnicas: ["Photoshop", "Illustrator", "Figma"],
        competencias: ["Creatividad", "Comunicación efectiva"],
        formacion: [
            { id_formacion: 2, titulo_carrera: "Diseño Gráfico", nivel_educacion: "Tercer Nivel" }
        ],
        experiencia: [
            {
                id_experiencia: 2,
                cargo: "Diseñadora Junior",
                fecha_inicio: "2021-01-01",
                fecha_fin: "2022-01-01",
                descripcion_responsabilidades: "Creación de banners y publicidad."
            }
        ]
    },
    {
        id_postulante: 103,
        nombre: "Carlos Lopez (Match Medio - Backend)",
        ciudad: "Guayaquil",
        resumen_profesional: "Fullstack developer en transición a backend.",
        modalidad_preferida: "Híbrido",
        habilidades_tecnicas: ["Node.js", "Javascript", "MySQL", "PHP"],
        competencias: ["Proactividad", "Aprendizaje continuo"],
        formacion: [
            { id_formacion: 3, titulo_carrera: "Tecnología en Desarrollo", nivel_educacion: "Tecnólogo" }
        ],
        experiencia: [
            {
                id_experiencia: 3,
                cargo: "Desarrollador Fullstack",
                fecha_inicio: "2019-01-01",
                fecha_fin: "2021-01-01",
                descripcion_responsabilidades: "Mantenimiento de sistemas legacy y creación de nuevas features."
            }
        ]
    },
    {
        id_postulante: 104,
        nombre: "Ana Lucia (Match Alto - Frontend)",
        ciudad: "Quito",
        resumen_profesional: "Experta en interfaces móviles con React Native.",
        modalidad_preferida: "Presencial",
        habilidades_tecnicas: ["React Native", "React", "CSS", "Figma", "Redux"],
        competencias: ["Creatividad", "Atención al detalle", "Trabajo en equipo"],
        formacion: [
            { id_formacion: 4, titulo_carrera: "Ingeniería en Sistemas", nivel_educacion: "Tercer Nivel" }
        ],
        experiencia: [
            {
                id_experiencia: 4,
                cargo: "Desarrolladora Móvil",
                fecha_inicio: "2021-06-01",
                fecha_fin: "2023-06-01",
                descripcion_responsabilidades: "Desarrollo de app bancaria usando React Native."
            }
        ]
    }
];