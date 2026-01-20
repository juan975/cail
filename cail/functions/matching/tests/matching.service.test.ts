/**
 * Tests Unitarios - MatchingService
 * Cubre algoritmo de scoring, validaciones y restricciones de negocio
 */
import { MatchingService } from '../src/matching/services/matching.service';
import {
    IMatchingRepository,
    IPostulacionRepository,
    ICatalogoRepository,
    IEmbeddingProvider,
    Oferta,
    Postulante,
    Postulacion
} from '../src/matching/domain/types';

// ============================================
// MOCKS DE DEPENDENCIAS
// ============================================

const createMockMatchingRepo = (): jest.Mocked<IMatchingRepository> => ({
    getOferta: jest.fn(),
    buscarCandidatosSimilares: jest.fn(),
    updateVectorCandidato: jest.fn()
});

const createMockPostulacionRepo = (): jest.Mocked<IPostulacionRepository> => ({
    crear: jest.fn(),
    getById: jest.fn(),
    getByPostulante: jest.fn(),
    getByOferta: jest.fn(),
    existePostulacion: jest.fn(),
    contarPostulacionesHoy: jest.fn()
});

const createMockCatalogoRepo = (): jest.Mocked<ICatalogoRepository> => ({
    existeSector: jest.fn().mockResolvedValue(true),
    existeNivel: jest.fn().mockResolvedValue(true)
});

const createMockEmbeddingProvider = (): jest.Mocked<IEmbeddingProvider> => ({
    generateEmbedding: jest.fn().mockResolvedValue([0.1, 0.2, 0.3, 0.4, 0.5])
});

// ============================================
// DATOS DE PRUEBA
// ============================================

const mockOferta: Oferta = {
    id: 'oferta-1',
    titulo: 'Desarrollador Senior',
    descripcion: 'Buscamos desarrollador con experiencia',
    id_sector_industrial: 'SEC_001',
    id_nivel_requerido: 'NIV_SENIOR',
    habilidades_obligatorias: [
        { nombre: 'JavaScript', es_obligatorio: true, peso: 0.8 },
        { nombre: 'React', es_obligatorio: true, peso: 0.8 }
    ],
    habilidades_deseables: [
        { nombre: 'TypeScript', es_obligatorio: false, peso: 0.4 }
    ]
};

const mockCandidatoConHabilidades: Postulante = {
    id: 'candidato-1',
    nombre: 'Juan Pérez',
    habilidades_tecnicas: ['JavaScript', 'React', 'TypeScript', 'Node.js'],
    id_nivel_actual: 'NIV_SENIOR',
    id_sector_industrial: 'SEC_001',
    embedding_habilidades: [0.1, 0.2, 0.3, 0.4, 0.5]
};

const mockCandidatoSinHabilidades: Postulante = {
    id: 'candidato-2',
    nombre: 'María García',
    habilidades_tecnicas: [],
    id_nivel_actual: 'NIV_JUNIOR',
    id_sector_industrial: 'SEC_001',
    embedding_habilidades: [0.2, 0.3, 0.4, 0.5, 0.6]
};

const mockCandidatoNivelDiferente: Postulante = {
    id: 'candidato-3',
    nombre: 'Carlos López',
    habilidades_tecnicas: ['JavaScript', 'React'],
    id_nivel_actual: 'NIV_JUNIOR',
    id_sector_industrial: 'SEC_001',
    embedding_habilidades: [0.3, 0.4, 0.5, 0.6, 0.7]
};

// ============================================
// TESTS
// ============================================

describe('MatchingService', () => {
    let service: MatchingService;
    let matchingRepo: jest.Mocked<IMatchingRepository>;
    let postulacionRepo: jest.Mocked<IPostulacionRepository>;
    let catalogoRepo: jest.Mocked<ICatalogoRepository>;
    let embeddingProvider: jest.Mocked<IEmbeddingProvider>;

    beforeEach(() => {
        matchingRepo = createMockMatchingRepo();
        postulacionRepo = createMockPostulacionRepo();
        catalogoRepo = createMockCatalogoRepo();
        embeddingProvider = createMockEmbeddingProvider();

        service = new MatchingService(
            matchingRepo,
            postulacionRepo,
            catalogoRepo,
            embeddingProvider
        );
    });

    // =========================================
    // TESTS DE executeMatching
    // =========================================
    describe('executeMatching', () => {
        it('debería retornar candidatos rankeados para una oferta válida', async () => {
            matchingRepo.getOferta.mockResolvedValue(mockOferta);
            matchingRepo.buscarCandidatosSimilares.mockResolvedValue([
                mockCandidatoConHabilidades,
                mockCandidatoNivelDiferente
            ]);

            const resultados = await service.executeMatching('oferta-1');

            expect(resultados).toHaveLength(2);
            expect(resultados[0].match_score).toBeGreaterThan(0);
            expect(resultados[0].score_detalle).toBeDefined();
        });

        it('debería lanzar error si la oferta no existe', async () => {
            matchingRepo.getOferta.mockResolvedValue(null);

            await expect(service.executeMatching('oferta-inexistente'))
                .rejects.toThrow('no existe');
        });

        it('debería lanzar error si el sector es inválido', async () => {
            matchingRepo.getOferta.mockResolvedValue(mockOferta);
            catalogoRepo.existeSector.mockResolvedValue(false);

            await expect(service.executeMatching('oferta-1'))
                .rejects.toThrow('SECTOR_INDUSTRIAL');
        });

        it('debería manejar candidato sin habilidades correctamente', async () => {
            matchingRepo.getOferta.mockResolvedValue(mockOferta);
            matchingRepo.buscarCandidatosSimilares.mockResolvedValue([
                mockCandidatoSinHabilidades
            ]);

            const resultados = await service.executeMatching('oferta-1');

            expect(resultados).toHaveLength(1);
            // El score de habilidades debería ser 0, pero no causar error
            expect(resultados[0].score_detalle.habilidades_obligatorias).toBe(0);
        });

        it('debería ordenar por score descendente', async () => {
            matchingRepo.getOferta.mockResolvedValue(mockOferta);
            matchingRepo.buscarCandidatosSimilares.mockResolvedValue([
                mockCandidatoNivelDiferente, // Menor score (nivel diferente)
                mockCandidatoConHabilidades   // Mayor score (todo coincide)
            ]);

            const resultados = await service.executeMatching('oferta-1');

            expect(resultados[0].match_score).toBeGreaterThanOrEqual(resultados[1].match_score);
        });

        it('debería dar mayor score a candidato con nivel exacto', async () => {
            matchingRepo.getOferta.mockResolvedValue(mockOferta);
            matchingRepo.buscarCandidatosSimilares.mockResolvedValue([
                mockCandidatoConHabilidades,
                mockCandidatoNivelDiferente
            ]);

            const resultados = await service.executeMatching('oferta-1');

            const candidatoNivelExacto = resultados.find(
                r => r.postulante.id === 'candidato-1'
            );
            const candidatoNivelDiferente = resultados.find(
                r => r.postulante.id === 'candidato-3'
            );

            expect(candidatoNivelExacto!.score_detalle.nivel_jerarquico)
                .toBeGreaterThan(candidatoNivelDiferente!.score_detalle.nivel_jerarquico);
        });
    });

    // =========================================
    // TESTS DE aplicarAOferta
    // =========================================
    describe('aplicarAOferta', () => {
        beforeEach(() => {
            matchingRepo.getOferta.mockResolvedValue(mockOferta);
            postulacionRepo.existePostulacion.mockResolvedValue(false);
            postulacionRepo.contarPostulacionesHoy.mockResolvedValue(0);
            postulacionRepo.crear.mockResolvedValue('nueva-postulacion-id');
        });

        it('debería crear postulación exitosamente', async () => {
            const resultado = await service.aplicarAOferta('user-123', 'oferta-1');

            expect(resultado.postulacionId).toBe('nueva-postulacion-id');
            expect(postulacionRepo.crear).toHaveBeenCalled();
        });

        it('debería rechazar postulación duplicada', async () => {
            postulacionRepo.existePostulacion.mockResolvedValue(true);

            await expect(service.aplicarAOferta('user-123', 'oferta-1'))
                .rejects.toThrow('Ya existe una postulación');
        });

        it('debería rechazar si se alcanzó límite de 10 postulaciones/día', async () => {
            postulacionRepo.contarPostulacionesHoy.mockResolvedValue(10);

            await expect(service.aplicarAOferta('user-123', 'oferta-1'))
                .rejects.toThrow('límite de 10 postulaciones');
        });

        it('debería rechazar si la oferta no existe', async () => {
            matchingRepo.getOferta.mockResolvedValue(null);

            await expect(service.aplicarAOferta('user-123', 'oferta-inexistente'))
                .rejects.toThrow('no existe');
        });
    });

    // =========================================
    // TESTS DE obtenerMisPostulaciones
    // =========================================
    describe('obtenerMisPostulaciones', () => {
        it('debería retornar postulaciones del candidato', async () => {
            const mockPostulaciones: Postulacion[] = [
                {
                    id: 'post-1',
                    id_postulante: 'user-123',
                    id_oferta: 'oferta-1',
                    fecha_postulacion: new Date(),
                    estado: 'PENDIENTE'
                }
            ];
            postulacionRepo.getByPostulante.mockResolvedValue(mockPostulaciones);

            const resultado = await service.obtenerMisPostulaciones('user-123');

            expect(resultado).toHaveLength(1);
            expect(postulacionRepo.getByPostulante).toHaveBeenCalledWith('user-123');
        });
    });

    // =========================================
    // TESTS DE FALLO DE IA
    // =========================================
    describe('Manejo de errores de IA', () => {
        it('debería propagar error si embedding falla', async () => {
            matchingRepo.getOferta.mockResolvedValue(mockOferta);
            embeddingProvider.generateEmbedding.mockRejectedValue(
                new Error('Fallo de conexión con IA')
            );

            await expect(service.executeMatching('oferta-1'))
                .rejects.toThrow();
        });
    });
});
