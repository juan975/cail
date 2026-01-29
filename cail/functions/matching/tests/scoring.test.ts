/**
 * Tests Funcionales - Algoritmo de Scoring
 * Responsable: Erick Gaona (Test & Security)
 * 
 * Verifica que el cálculo de scores funcione correctamente
 * según la especificación CU08
 */

import { MatchingService } from '../src/matching/services/matching.service';
import {
    IMatchingRepository,
    IPostulacionRepository,
    ICatalogoRepository,
    IEmbeddingProvider,
    Oferta,
    Postulante
} from '../src/matching/domain/types';

// ============================================
// CONFIGURACIÓN DE PESOS (debe coincidir con el servicio)
// ============================================
const EXPECTED_WEIGHTS = {
    SIMILITUD_VECTORIAL: 0.40,
    HABILIDADES_OBLIGATORIAS: 0.30,
    HABILIDADES_DESEABLES: 0.15,
    NIVEL_JERARQUICO: 0.15
};

// ============================================
// MOCKS
// ============================================
const createMockRepos = () => ({
    matchingRepo: {
        getOferta: jest.fn(),
        buscarCandidatosSimilares: jest.fn(),
        updateVectorCandidato: jest.fn()
    } as jest.Mocked<IMatchingRepository>,

    postulacionRepo: {
        crear: jest.fn(),
        getById: jest.fn(),
        getByPostulante: jest.fn(),
        getByOferta: jest.fn(),
        existePostulacion: jest.fn(),
        contarPostulacionesHoy: jest.fn()
    } as jest.Mocked<IPostulacionRepository>,

    catalogoRepo: {
        existeSector: jest.fn().mockResolvedValue(true),
        existeNivel: jest.fn().mockResolvedValue(true)
    } as jest.Mocked<ICatalogoRepository>,

    embeddingProvider: {
        generateEmbedding: jest.fn().mockResolvedValue([0.1, 0.2, 0.3])
    } as jest.Mocked<IEmbeddingProvider>
});

// ============================================
// DATOS DE PRUEBA
// ============================================
const ofertaCompleta: Oferta = {
    id: 'oferta-test',
    titulo: 'Desarrollador Full Stack',
    descripcion: 'Buscamos desarrollador con experiencia',
    id_sector_industrial: 'SEC_TECH',
    id_nivel_requerido: 'NIV_SENIOR',
    habilidades_obligatorias: [
        { nombre: 'JavaScript', es_obligatorio: true, peso: 1.0 },
        { nombre: 'React', es_obligatorio: true, peso: 0.8 },
        { nombre: 'Node.js', es_obligatorio: true, peso: 0.8 }
    ],
    habilidades_deseables: [
        { nombre: 'TypeScript', es_obligatorio: false, peso: 0.5 },
        { nombre: 'Docker', es_obligatorio: false, peso: 0.3 }
    ]
};

// ============================================
// TESTS DE SCORING
// ============================================
describe('Algoritmo de Scoring - Tests Funcionales', () => {
    let service: MatchingService;
    let mocks: ReturnType<typeof createMockRepos>;

    beforeEach(() => {
        mocks = createMockRepos();
        service = new MatchingService(
            mocks.matchingRepo,
            mocks.postulacionRepo,
            mocks.catalogoRepo,
            mocks.embeddingProvider
        );
        mocks.matchingRepo.getOferta.mockResolvedValue(ofertaCompleta);
    });

    // =========================================
    // TESTS DE HABILIDADES OBLIGATORIAS
    // =========================================
    describe('Score de Habilidades Obligatorias', () => {

        it('Candidato con TODAS las habilidades obligatorias → score = 1.0', async () => {
            const candidatoPerfecto: Postulante = {
                id: 'c1',
                nombre: 'Candidato Perfecto',
                habilidades_tecnicas: ['JavaScript', 'React', 'Node.js'],
                id_nivel_actual: 'NIV_SENIOR',
                id_sector_industrial: 'SEC_TECH',
                embedding_habilidades: [0.1, 0.2, 0.3]
            };

            mocks.matchingRepo.buscarCandidatosSimilares.mockResolvedValue([candidatoPerfecto]);

            const resultados = await service.executeMatching('oferta-test');

            expect(resultados[0].score_detalle.habilidades_obligatorias).toBe(1);
        });

        it('Candidato con NINGUNA habilidad obligatoria → score = 0', async () => {
            const candidatoSinMatch: Postulante = {
                id: 'c2',
                nombre: 'Candidato Sin Match',
                habilidades_tecnicas: ['Python', 'Django', 'Flask'],
                id_nivel_actual: 'NIV_SENIOR',
                id_sector_industrial: 'SEC_TECH',
                embedding_habilidades: [0.1, 0.2, 0.3]
            };

            mocks.matchingRepo.buscarCandidatosSimilares.mockResolvedValue([candidatoSinMatch]);

            const resultados = await service.executeMatching('oferta-test');

            expect(resultados[0].score_detalle.habilidades_obligatorias).toBe(0);
        });

        it('Candidato con ALGUNAS habilidades obligatorias → score parcial', async () => {
            // Tiene JavaScript (peso 1.0) y React (peso 0.8), falta Node.js (peso 0.8)
            // Score esperado: (1.0 + 0.8) / (1.0 + 0.8 + 0.8) = 1.8 / 2.6 ≈ 0.69
            const candidatoParcial: Postulante = {
                id: 'c3',
                nombre: 'Candidato Parcial',
                habilidades_tecnicas: ['JavaScript', 'React'],
                id_nivel_actual: 'NIV_SENIOR',
                id_sector_industrial: 'SEC_TECH',
                embedding_habilidades: [0.1, 0.2, 0.3]
            };

            mocks.matchingRepo.buscarCandidatosSimilares.mockResolvedValue([candidatoParcial]);

            const resultados = await service.executeMatching('oferta-test');

            const scoreObligatorias = resultados[0].score_detalle.habilidades_obligatorias;
            expect(scoreObligatorias).toBeGreaterThan(0.5);
            expect(scoreObligatorias).toBeLessThan(1);
        });

        it('Habilidades deben coincidir CASE-INSENSITIVE', async () => {
            const candidatoMayusculas: Postulante = {
                id: 'c4',
                nombre: 'Candidato Mayúsculas',
                habilidades_tecnicas: ['JAVASCRIPT', 'REACT', 'NODE.JS'],
                id_nivel_actual: 'NIV_SENIOR',
                id_sector_industrial: 'SEC_TECH',
                embedding_habilidades: [0.1, 0.2, 0.3]
            };

            mocks.matchingRepo.buscarCandidatosSimilares.mockResolvedValue([candidatoMayusculas]);

            const resultados = await service.executeMatching('oferta-test');

            // Debe reconocer las habilidades aunque estén en mayúsculas
            expect(resultados[0].score_detalle.habilidades_obligatorias).toBe(1);
        });

        it('Habilidades deben coincidir con MATCH PARCIAL', async () => {
            // "ReactJS" debe coincidir con "React"
            const candidatoVariante: Postulante = {
                id: 'c5',
                nombre: 'Candidato Variante',
                habilidades_tecnicas: ['JavaScript', 'ReactJS', 'NodeJS'],
                id_nivel_actual: 'NIV_SENIOR',
                id_sector_industrial: 'SEC_TECH',
                embedding_habilidades: [0.1, 0.2, 0.3]
            };

            mocks.matchingRepo.buscarCandidatosSimilares.mockResolvedValue([candidatoVariante]);

            const resultados = await service.executeMatching('oferta-test');

            // ReactJS contiene "React", NodeJS contiene "Node"
            expect(resultados[0].score_detalle.habilidades_obligatorias).toBeGreaterThan(0.5);
        });
    });

    // =========================================
    // TESTS DE HABILIDADES DESEABLES
    // =========================================
    describe('Score de Habilidades Deseables', () => {

        it('Candidato con TODAS las habilidades deseables → score = 1.0', async () => {
            const candidato: Postulante = {
                id: 'c6',
                nombre: 'Candidato Deseables',
                habilidades_tecnicas: ['JavaScript', 'React', 'Node.js', 'TypeScript', 'Docker'],
                id_nivel_actual: 'NIV_SENIOR',
                id_sector_industrial: 'SEC_TECH',
                embedding_habilidades: [0.1, 0.2, 0.3]
            };

            mocks.matchingRepo.buscarCandidatosSimilares.mockResolvedValue([candidato]);

            const resultados = await service.executeMatching('oferta-test');

            expect(resultados[0].score_detalle.habilidades_deseables).toBe(1);
        });

        it('Candidato con NINGUNA habilidad deseable → score = 0', async () => {
            const candidato: Postulante = {
                id: 'c7',
                nombre: 'Candidato Sin Deseables',
                habilidades_tecnicas: ['JavaScript', 'React', 'Node.js'],
                id_nivel_actual: 'NIV_SENIOR',
                id_sector_industrial: 'SEC_TECH',
                embedding_habilidades: [0.1, 0.2, 0.3]
            };

            mocks.matchingRepo.buscarCandidatosSimilares.mockResolvedValue([candidato]);

            const resultados = await service.executeMatching('oferta-test');

            expect(resultados[0].score_detalle.habilidades_deseables).toBe(0);
        });
    });

    // =========================================
    // TESTS DE NIVEL JERÁRQUICO
    // =========================================
    describe('Score de Nivel Jerárquico', () => {

        it('Nivel EXACTO → score = 1.0', async () => {
            const candidato: Postulante = {
                id: 'c8',
                nombre: 'Candidato Nivel Exacto',
                habilidades_tecnicas: ['JavaScript'],
                id_nivel_actual: 'NIV_SENIOR', // Mismo que la oferta
                id_sector_industrial: 'SEC_TECH',
                embedding_habilidades: [0.1, 0.2, 0.3]
            };

            mocks.matchingRepo.buscarCandidatosSimilares.mockResolvedValue([candidato]);

            const resultados = await service.executeMatching('oferta-test');

            expect(resultados[0].score_detalle.nivel_jerarquico).toBe(1);
        });

        it('Nivel DIFERENTE → score = 0.5', async () => {
            const candidato: Postulante = {
                id: 'c9',
                nombre: 'Candidato Nivel Diferente',
                habilidades_tecnicas: ['JavaScript'],
                id_nivel_actual: 'NIV_JUNIOR', // Diferente a la oferta
                id_sector_industrial: 'SEC_TECH',
                embedding_habilidades: [0.1, 0.2, 0.3]
            };

            mocks.matchingRepo.buscarCandidatosSimilares.mockResolvedValue([candidato]);

            const resultados = await service.executeMatching('oferta-test');

            expect(resultados[0].score_detalle.nivel_jerarquico).toBe(0.5);
        });
    });

    // =========================================
    // TESTS DE SCORE FINAL PONDERADO
    // =========================================
    describe('Cálculo de Score Final Ponderado', () => {

        it('Score final debe respetar los pesos: 40% + 30% + 15% + 15%', async () => {
            const candidatoPerfecto: Postulante = {
                id: 'c10',
                nombre: 'Candidato Perfecto',
                habilidades_tecnicas: ['JavaScript', 'React', 'Node.js', 'TypeScript', 'Docker'],
                id_nivel_actual: 'NIV_SENIOR',
                id_sector_industrial: 'SEC_TECH',
                embedding_habilidades: [0.1, 0.2, 0.3]
            };

            mocks.matchingRepo.buscarCandidatosSimilares.mockResolvedValue([candidatoPerfecto]);

            const resultados = await service.executeMatching('oferta-test');

            // Score esperado:
            // similitud_vectorial = 0.8 (base KNN) * 0.40 = 0.32
            // habilidades_obligatorias = 1.0 * 0.30 = 0.30
            // habilidades_deseables = 1.0 * 0.15 = 0.15
            // nivel_jerarquico = 1.0 * 0.15 = 0.15
            // TOTAL = 0.92
            expect(resultados[0].match_score).toBeCloseTo(0.92, 1);
        });

        it('Candidato sin nada debe tener score mínimo', async () => {
            const candidatoVacio: Postulante = {
                id: 'c11',
                nombre: 'Candidato Vacío',
                habilidades_tecnicas: [],
                id_nivel_actual: 'NIV_JUNIOR',
                id_sector_industrial: 'SEC_TECH',
                embedding_habilidades: [0.1, 0.2, 0.3]
            };

            mocks.matchingRepo.buscarCandidatosSimilares.mockResolvedValue([candidatoVacio]);

            const resultados = await service.executeMatching('oferta-test');

            // Score esperado:
            // similitud_vectorial = 0.8 * 0.40 = 0.32
            // habilidades_obligatorias = 0 * 0.30 = 0
            // habilidades_deseables = 0 * 0.15 = 0
            // nivel_jerarquico = 0.5 * 0.15 = 0.075
            // TOTAL ≈ 0.395
            expect(resultados[0].match_score).toBeLessThan(0.5);
        });
    });

    // =========================================
    // TESTS DE ORDENAMIENTO
    // =========================================
    describe('Ordenamiento por Score', () => {

        it('Candidatos deben ordenarse de MAYOR a MENOR score', async () => {
            const candidatos: Postulante[] = [
                {
                    id: 'bajo',
                    nombre: 'Score Bajo',
                    habilidades_tecnicas: [],
                    id_nivel_actual: 'NIV_JUNIOR',
                    id_sector_industrial: 'SEC_TECH',
                    embedding_habilidades: [0.1, 0.2, 0.3]
                },
                {
                    id: 'alto',
                    nombre: 'Score Alto',
                    habilidades_tecnicas: ['JavaScript', 'React', 'Node.js', 'TypeScript', 'Docker'],
                    id_nivel_actual: 'NIV_SENIOR',
                    id_sector_industrial: 'SEC_TECH',
                    embedding_habilidades: [0.1, 0.2, 0.3]
                },
                {
                    id: 'medio',
                    nombre: 'Score Medio',
                    habilidades_tecnicas: ['JavaScript', 'React'],
                    id_nivel_actual: 'NIV_SENIOR',
                    id_sector_industrial: 'SEC_TECH',
                    embedding_habilidades: [0.1, 0.2, 0.3]
                }
            ];

            mocks.matchingRepo.buscarCandidatosSimilares.mockResolvedValue(candidatos);

            const resultados = await service.executeMatching('oferta-test');

            // Verificar orden descendente
            expect(resultados[0].postulante.id).toBe('alto');
            expect(resultados[1].postulante.id).toBe('medio');
            expect(resultados[2].postulante.id).toBe('bajo');

            // Verificar que cada score es >= al siguiente
            for (let i = 0; i < resultados.length - 1; i++) {
                expect(resultados[i].match_score).toBeGreaterThanOrEqual(resultados[i + 1].match_score);
            }
        });

        it('Debe limitar a máximo 10 resultados', async () => {
            // Crear 15 candidatos
            const candidatos: Postulante[] = Array.from({ length: 15 }, (_, i) => ({
                id: `candidato-${i}`,
                nombre: `Candidato ${i}`,
                habilidades_tecnicas: ['JavaScript'],
                id_nivel_actual: 'NIV_SENIOR',
                id_sector_industrial: 'SEC_TECH',
                embedding_habilidades: [0.1, 0.2, 0.3]
            }));

            mocks.matchingRepo.buscarCandidatosSimilares.mockResolvedValue(candidatos);

            const resultados = await service.executeMatching('oferta-test');

            expect(resultados.length).toBeLessThanOrEqual(10);
        });
    });

    // =========================================
    // TESTS DE CASOS EDGE
    // =========================================
    describe('Casos Edge', () => {

        it('Oferta sin habilidades deseables → score deseables = 1.0', async () => {
            const ofertaSinDeseables: Oferta = {
                ...ofertaCompleta,
                habilidades_deseables: []
            };
            mocks.matchingRepo.getOferta.mockResolvedValue(ofertaSinDeseables);

            const candidato: Postulante = {
                id: 'c12',
                nombre: 'Candidato',
                habilidades_tecnicas: ['JavaScript', 'React', 'Node.js'],
                id_nivel_actual: 'NIV_SENIOR',
                id_sector_industrial: 'SEC_TECH',
                embedding_habilidades: [0.1, 0.2, 0.3]
            };

            mocks.matchingRepo.buscarCandidatosSimilares.mockResolvedValue([candidato]);

            const resultados = await service.executeMatching('oferta-test');

            // Si no hay requisitos deseables, score = 1.0 (perfecto por defecto)
            expect(resultados[0].score_detalle.habilidades_deseables).toBe(1);
        });

        it('Oferta sin habilidades obligatorias → score obligatorias = 1.0', async () => {
            const ofertaSinObligatorias: Oferta = {
                ...ofertaCompleta,
                habilidades_obligatorias: []
            };
            mocks.matchingRepo.getOferta.mockResolvedValue(ofertaSinObligatorias);

            const candidato: Postulante = {
                id: 'c13',
                nombre: 'Candidato',
                habilidades_tecnicas: [],
                id_nivel_actual: 'NIV_SENIOR',
                id_sector_industrial: 'SEC_TECH',
                embedding_habilidades: [0.1, 0.2, 0.3]
            };

            mocks.matchingRepo.buscarCandidatosSimilares.mockResolvedValue([candidato]);

            const resultados = await service.executeMatching('oferta-test');

            // Si no hay requisitos obligatorios, score = 1.0 (perfecto por defecto)
            expect(resultados[0].score_detalle.habilidades_obligatorias).toBe(1);
        });

        it('Sin candidatos encontrados → retorna array vacío', async () => {
            mocks.matchingRepo.buscarCandidatosSimilares.mockResolvedValue([]);

            const resultados = await service.executeMatching('oferta-test');

            expect(resultados).toEqual([]);
        });
    });
});

// ============================================
// TESTS DE POSTULACIONES
// ============================================
describe('Postulaciones - Tests Funcionales', () => {
    let service: MatchingService;
    let mocks: ReturnType<typeof createMockRepos>;

    beforeEach(() => {
        mocks = createMockRepos();
        service = new MatchingService(
            mocks.matchingRepo,
            mocks.postulacionRepo,
            mocks.catalogoRepo,
            mocks.embeddingProvider
        );
        mocks.matchingRepo.getOferta.mockResolvedValue(ofertaCompleta);
    });

    describe('obtenerPostulacionesOferta', () => {

        it('Debe retornar postulaciones de la oferta', async () => {
            const postulaciones = [
                { id: 'p1', id_postulante: 'u1', id_oferta: 'oferta-test', fecha_postulacion: new Date(), estado: 'PENDIENTE' as const },
                { id: 'p2', id_postulante: 'u2', id_oferta: 'oferta-test', fecha_postulacion: new Date(), estado: 'EN_REVISION' as const }
            ];
            mocks.postulacionRepo.getByOferta.mockResolvedValue(postulaciones);

            const resultado = await service.obtenerPostulacionesOferta('oferta-test');

            expect(resultado).toHaveLength(2);
            expect(mocks.postulacionRepo.getByOferta).toHaveBeenCalledWith('oferta-test');
        });

        it('Debe lanzar error si la oferta no existe', async () => {
            mocks.matchingRepo.getOferta.mockResolvedValue(null);

            await expect(service.obtenerPostulacionesOferta('oferta-inexistente'))
                .rejects.toThrow('no existe');
        });
    });

    describe('Límite de Postulaciones Diarias', () => {

        it('Permite postulación #9 (por debajo del límite)', async () => {
            mocks.postulacionRepo.existePostulacion.mockResolvedValue(false);
            mocks.postulacionRepo.contarPostulacionesHoy.mockResolvedValue(9);
            mocks.postulacionRepo.crear.mockResolvedValue('nueva-id');

            const resultado = await service.aplicarAOferta('user-1', 'oferta-test');

            expect(resultado.postulacionId).toBe('nueva-id');
        });

        it('Rechaza postulación #10 (alcanzó el límite)', async () => {
            mocks.postulacionRepo.existePostulacion.mockResolvedValue(false);
            mocks.postulacionRepo.contarPostulacionesHoy.mockResolvedValue(10);

            await expect(service.aplicarAOferta('user-1', 'oferta-test'))
                .rejects.toThrow('límite de 10 postulaciones');
        });

        it('Rechaza postulación #15 (muy por encima del límite)', async () => {
            mocks.postulacionRepo.existePostulacion.mockResolvedValue(false);
            mocks.postulacionRepo.contarPostulacionesHoy.mockResolvedValue(15);

            await expect(service.aplicarAOferta('user-1', 'oferta-test'))
                .rejects.toThrow('límite');
        });
    });
});

