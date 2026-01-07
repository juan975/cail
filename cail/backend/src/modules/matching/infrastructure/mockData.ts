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
    }
];

export const MOCK_POSTULANTES: Postulante[] = [
    {
        id_postulante: 101,
        nombre: "Juan Perez (Match Alto)",
        ciudad: "Loja",
        resumen_profesional: "Desarrollador de software apasionado por el backend.",
        modalidad_preferida: "Remoto",
        habilidades_tecnicas: ["Node.js", "TypeScript", "SQL", "Docker", "Firebase"],
        competencias: ["Liderazgo", "Trabajo en equipo"],
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
        nombre: "Maria Gomez (Match Bajo)",
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
    }
];