/**
 * Configuración de Jest para CAIL Backend
 * 
 * @author Erick Gaona - Test & Security Lead
 * @version 1.0.0
 */

module.exports = {
  // Preset para TypeScript
  preset: 'ts-jest',
  
  // Entorno de ejecución
  testEnvironment: 'node',
  
  // Directorio raíz para tests
  roots: ['<rootDir>/src'],
  
  // Patrón para encontrar archivos de test
  testMatch: [
    '**/__tests__/**/*.test.ts',
    '**/*.spec.ts'
  ],
  
  // Extensiones de módulos
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  
  // Configuración de cobertura
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/index.ts',
    '!src/**/routes/*.ts'
  ],
  
  // Umbral mínimo de cobertura
  // NOTA: Inicialmente bajo, incrementar a medida que se agregan más tests
  // Meta final: 80% en todas las métricas
  coverageThreshold: {
    global: {
      branches: 40,
      functions: 40,
      lines: 40,
      statements: 40
    }
  },
  
  // Directorio para reportes de cobertura
  coverageDirectory: 'coverage',
  
  // Formatos de reporte
  coverageReporters: ['text', 'lcov', 'html'],
  
  // Limpiar mocks automáticamente entre tests
  clearMocks: true,
  
  // Mostrar descripción de cada test
  verbose: true,
  
  // Timeout para tests (10 segundos)
  testTimeout: 10000,
  
  // Archivos a ejecutar antes de cada test suite
  setupFilesAfterEnv: ['<rootDir>/src/__tests__/setup.ts'],
  
  // Mapeo de módulos para imports absolutos
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@shared/(.*)$': '<rootDir>/src/shared/$1',
    '^@modules/(.*)$': '<rootDir>/src/modules/$1'
  },
  
  // Ignorar node_modules
  testPathIgnorePatterns: ['/node_modules/', '/dist/'],
  
  // Transformaciones
  transform: {
    '^.+\\.ts$': 'ts-jest'
  }
};

