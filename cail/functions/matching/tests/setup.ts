// Test setup file - Microservicio Matching
// Configuración global para tests

// Aumentar timeout para tests de integración
jest.setTimeout(30000);

// Variables de entorno para tests
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret-key';
process.env.JWT_EXPIRES_IN = '1h';

