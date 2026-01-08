// Test setup file
// Configuración global para tests

// Aumentar timeout para tests de integración
jest.setTimeout(30000);

// Silenciar console.log durante tests (opcional)
// global.console.log = jest.fn();

// Variables de entorno para tests
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret-key';
process.env.JWT_EXPIRES_IN = '1h';
