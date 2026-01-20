// Test setup file - Microservicio Matching
// Mocks y configuración de Jest con soporte para findNearest

// Variables de entorno para tests
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret-key-minimum-32-characters-long';
process.env.JWT_EXPIRES_IN = '1h';
process.env.FIREBASE_PROJECT_ID = 'test-project';
process.env.FIREBASE_CLIENT_EMAIL = 'test@test-project.iam.gserviceaccount.com';
process.env.FIREBASE_PRIVATE_KEY = '-----BEGIN RSA PRIVATE KEY-----\nMIIBOgIBAAJBALRiMLAHpKh8JQKcVVvUMnEGEDRxz3aQfQIVCK0eOmGqpVGXHH3h\nPCkRZxTkMcQd8iQzVLEV7D7pn0qAQzUQvTECAwEAAQJAYPRHLLNSBx7y6yNBwLgD\n-----END RSA PRIVATE KEY-----\n';

// Aumentar timeout para tests de integración
jest.setTimeout(30000);

// Silenciar console.log durante tests (excepto errores críticos)
beforeAll(() => {
    jest.spyOn(console, 'log').mockImplementation(() => { });
    jest.spyOn(console, 'warn').mockImplementation(() => { });
});

afterAll(() => {
    jest.restoreAllMocks();
});

// ============================================
// DATOS DE PRUEBA
// ============================================

export const mockCandidatos = [
    {
        id: 'candidato-1',
        nombre: 'Juan Pérez',
        habilidades_tecnicas: ['JavaScript', 'React', 'Node.js', 'TypeScript'],
        id_nivel_actual: 'NIV_SENIOR',
        id_sector_industrial: 'SEC_001',
        embedding_habilidades: [0.1, 0.2, 0.3, 0.4, 0.5]
    },
    {
        id: 'candidato-2',
        nombre: 'María García',
        habilidades_tecnicas: ['Python', 'Django', 'PostgreSQL'],
        id_nivel_actual: 'NIV_SEMI_SENIOR',
        id_sector_industrial: 'SEC_001',
        embedding_habilidades: [0.2, 0.3, 0.4, 0.5, 0.6]
    },
    {
        id: 'candidato-3',
        nombre: 'Carlos López',
        habilidades_tecnicas: ['Java', 'Spring Boot'],
        id_nivel_actual: 'NIV_JUNIOR',
        id_sector_industrial: 'SEC_002',
        embedding_habilidades: [0.3, 0.4, 0.5, 0.6, 0.7]
    }
];

export const mockOfertas = [
    {
        id: 'oferta-1',
        titulo: 'Desarrollador Full Stack Senior',
        descripcion: 'Buscamos desarrollador con experiencia en React y Node.js',
        id_sector_industrial: 'SEC_001',
        id_nivel_requerido: 'NIV_SENIOR',
        modalidad: 'REMOTO',
        habilidades_obligatorias: [
            { nombre: 'JavaScript', es_obligatorio: true, peso: 0.8 },
            { nombre: 'React', es_obligatorio: true, peso: 0.8 }
        ],
        habilidades_deseables: [
            { nombre: 'TypeScript', es_obligatorio: false, peso: 0.4 }
        ]
    }
];

export const mockPostulaciones = [
    {
        id: 'postulacion-1',
        id_postulante: 'user-123',
        id_oferta: 'oferta-1',
        fecha_postulacion: new Date(),
        estado: 'PENDIENTE'
    }
];

// ============================================
// MOCK DE FIRESTORE CON findNearest
// ============================================

const createMockQueryBuilder = () => {
    const mockDocs = mockCandidatos
        .filter(c => c.id_sector_industrial === 'SEC_001')
        .map(candidato => ({
            id: candidato.id,
            exists: true,
            data: () => candidato
        }));

    return {
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        // Mock de findNearest para búsqueda vectorial
        findNearest: jest.fn().mockImplementation((options) => {
            // Simular resultados ordenados por distancia coseno
            const sortedDocs = [...mockDocs].sort((a, b) => {
                // Simular diferentes distancias
                return Math.random() - 0.5;
            }).slice(0, options.limit || 10);

            return {
                get: jest.fn().mockResolvedValue({
                    empty: sortedDocs.length === 0,
                    docs: sortedDocs,
                    size: sortedDocs.length
                })
            };
        }),
        get: jest.fn().mockResolvedValue({
            empty: mockDocs.length === 0,
            docs: mockDocs,
            size: mockDocs.length
        })
    };
};

const mockFirestore = {
    collection: jest.fn((collectionName: string) => {
        if (collectionName === 'candidatos') {
            return createMockQueryBuilder();
        }

        if (collectionName === 'ofertas') {
            return {
                doc: jest.fn((id: string) => {
                    const oferta = mockOfertas.find(o => o.id === id);
                    return {
                        get: jest.fn().mockResolvedValue({
                            exists: !!oferta,
                            id: id,
                            data: () => oferta || null
                        }),
                        set: jest.fn().mockResolvedValue(undefined),
                        update: jest.fn().mockResolvedValue(undefined)
                    };
                }),
                where: jest.fn().mockReturnThis(),
                get: jest.fn().mockResolvedValue({
                    empty: false,
                    docs: mockOfertas.map(o => ({
                        id: o.id,
                        exists: true,
                        data: () => o
                    }))
                })
            };
        }

        if (collectionName === 'postulaciones') {
            return {
                doc: jest.fn(() => ({
                    get: jest.fn().mockResolvedValue({
                        exists: false,
                        data: () => null
                    }),
                    set: jest.fn().mockResolvedValue(undefined),
                    update: jest.fn().mockResolvedValue(undefined)
                })),
                add: jest.fn().mockResolvedValue({ id: 'new-postulacion-id' }),
                where: jest.fn().mockReturnThis(),
                limit: jest.fn().mockReturnThis(),
                orderBy: jest.fn().mockReturnThis(),
                get: jest.fn().mockResolvedValue({
                    empty: true,
                    docs: [],
                    size: 0
                })
            };
        }

        if (collectionName === 'usuarios') {
            return {
                doc: jest.fn(() => ({
                    get: jest.fn().mockResolvedValue({
                        exists: true,
                        data: () => ({ tipoUsuario: 'CANDIDATO' })
                    })
                }))
            };
        }

        // Default mock
        return {
            doc: jest.fn(() => ({
                get: jest.fn().mockResolvedValue({ exists: false, data: () => null }),
                set: jest.fn().mockResolvedValue(undefined),
                update: jest.fn().mockResolvedValue(undefined),
                delete: jest.fn().mockResolvedValue(undefined)
            })),
            where: jest.fn().mockReturnThis(),
            get: jest.fn().mockResolvedValue({ empty: true, docs: [] }),
            add: jest.fn().mockResolvedValue({ id: 'mock-id' })
        };
    })
};

// ============================================
// MOCK DE FIREBASE ADMIN
// ============================================

jest.mock('firebase-admin', () => ({
    apps: [],
    initializeApp: jest.fn(),
    credential: {
        cert: jest.fn(() => ({}))
    },
    firestore: jest.fn(() => mockFirestore),
    auth: jest.fn(() => ({
        verifyIdToken: jest.fn().mockImplementation((token) => {
            if (token === 'valid-candidato-token') {
                return Promise.resolve({
                    uid: 'user-123',
                    email: 'candidato@test.com'
                });
            }
            if (token === 'valid-reclutador-token') {
                return Promise.resolve({
                    uid: 'recruiter-456',
                    email: 'reclutador@test.com'
                });
            }
            return Promise.reject({ code: 'auth/argument-error' });
        }),
        createUser: jest.fn()
    }))
}));

// ============================================
// MOCK DE VERTEX AI
// ============================================

jest.mock('@google-cloud/vertexai', () => ({
    VertexAI: jest.fn().mockImplementation(() => ({
        getGenerativeModel: jest.fn().mockReturnValue({
            embedContent: jest.fn().mockResolvedValue({
                embedding: {
                    values: [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0]
                }
            })
        })
    }))
}));

// ============================================
// HELPERS PARA TESTS
// ============================================

export const createMockAuthRequest = (role: 'CANDIDATO' | 'RECLUTADOR' | 'ADMIN') => {
    return {
        user: {
            uid: role === 'CANDIDATO' ? 'user-123' : 'recruiter-456',
            email: `${role.toLowerCase()}@test.com`,
            tipoUsuario: role
        }
    };
};

export const resetMocks = () => {
    jest.clearAllMocks();
};
