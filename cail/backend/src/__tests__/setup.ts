/**
 * Configuración global de Jest para CAIL Backend
 * 
 * Este archivo se ejecuta antes de cada suite de tests.
 * Configura variables de entorno y mocks globales.
 * 
 * @author Erick Gaona - Test & Security Lead
 * @version 1.0.0
 */

// Variables de entorno para testing
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret-key-for-testing-only-do-not-use-in-production';
process.env.JWT_EXPIRES_IN = '1h';
process.env.FIREBASE_PROJECT_ID = 'test-project';
process.env.FIREBASE_CLIENT_EMAIL = 'test@test-project.iam.gserviceaccount.com';
process.env.FIREBASE_PRIVATE_KEY = '-----BEGIN PRIVATE KEY-----\nMIItest\n-----END PRIVATE KEY-----\n';

// Timeout global para tests asíncronos
jest.setTimeout(10000);

// Silenciar console.log durante tests (opcional)
// Descomenta si quieres tests más limpios
// global.console = {
//   ...console,
//   log: jest.fn(),
//   debug: jest.fn(),
//   info: jest.fn(),
// };

// Hook que se ejecuta después de todos los tests
afterAll(async () => {
  // Limpiar recursos si es necesario
  await new Promise(resolve => setTimeout(resolve, 100));
});

