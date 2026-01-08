// Test setup file
// Configuración global para tests

// Variables de entorno para tests (ANTES de importar cualquier módulo)
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret-key-minimum-32-characters-long';
process.env.JWT_EXPIRES_IN = '1h';
process.env.FIREBASE_PROJECT_ID = 'test-project';
process.env.FIREBASE_CLIENT_EMAIL = 'test@test-project.iam.gserviceaccount.com';
process.env.FIREBASE_PRIVATE_KEY = '-----BEGIN RSA PRIVATE KEY-----\nMIIBOgIBAAJBALRiMLAHpKh8JQKcVVvUMnEGEDRxz3aQfQIVCK0eOmGqpVGXHH3h\nPCkRZxTkMcQd8iQzVLEV7D7pn0qAQzUQvTECAwEAAQJAYPRHLLNSBx7y6yNBwLgD\nCqKTJKLJMJKJKJKJKJKJKJKJKJKJKJKJKJKJKJKJKJKJKJKJKJKJKJKJKJKJKJKJKJ\nKJECIQDrYnN/AKJKJKJKJKJKJKJKJKJKJKJKJKJKJKJKJKJKJKJKJKJKJKJKJKJKJK\nJKJKJKJKJKJKJKJKJKJKJKJKJKJKJKJKJKJKJKJKJKJKJKJKJKJKJKJKJKJKJKJKJK\nJKJKJKJKJKJKJKJKJKJK\n-----END RSA PRIVATE KEY-----\n';

// Aumentar timeout para tests de integración
jest.setTimeout(30000);

// Silenciar console.log durante tests
beforeAll(() => {
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
});

afterAll(() => {
    jest.restoreAllMocks();
});

// Mock de Firebase Admin
jest.mock('firebase-admin', () => {
    const mockFirestore = {
        collection: jest.fn(() => ({
            doc: jest.fn(() => ({
                get: jest.fn(() => Promise.resolve({ exists: false, data: () => null })),
                set: jest.fn(() => Promise.resolve()),
                update: jest.fn(() => Promise.resolve()),
                delete: jest.fn(() => Promise.resolve()),
            })),
            where: jest.fn(() => ({
                get: jest.fn(() => Promise.resolve({ empty: true, docs: [] })),
                limit: jest.fn(() => ({
                    get: jest.fn(() => Promise.resolve({ empty: true, docs: [] })),
                })),
            })),
            add: jest.fn(() => Promise.resolve({ id: 'mock-id' })),
        })),
    };

    return {
        apps: [], // Array de apps inicializadas
        initializeApp: jest.fn(),
        credential: {
            cert: jest.fn(() => ({})),
        },
        firestore: jest.fn(() => mockFirestore),
        auth: jest.fn(() => ({
            verifyIdToken: jest.fn(),
            createUser: jest.fn(),
        })),
    };
});
