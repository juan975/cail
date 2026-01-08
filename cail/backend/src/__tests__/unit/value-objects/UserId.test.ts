/**
 * Tests unitarios para UserId Value Object
 * 
 * Estos tests verifican:
 * - Validación de ID no vacío
 * - Comparación entre IDs
 * - Casos de error
 * 
 * @author Erick Gaona - Test & Security Lead
 * @version 1.0.0
 */

import { UserId } from '../../../shared/domain/value-objects/UserId';

describe('UserId Value Object', () => {
  
  // ═══════════════════════════════════════════════════════════════
  // TESTS DE CREACIÓN EXITOSA
  // ═══════════════════════════════════════════════════════════════
  
  describe('Creación exitosa', () => {
    
    it('debería crear un UserId válido', () => {
      const userId = new UserId('abc123');
      
      expect(userId.getValue()).toBe('abc123');
    });
    
    it('debería aceptar UUIDs', () => {
      const uuid = '550e8400-e29b-41d4-a716-446655440000';
      const userId = new UserId(uuid);
      
      expect(userId.getValue()).toBe(uuid);
    });
    
    it('debería aceptar IDs alfanuméricos', () => {
      const userId = new UserId('user_123_abc');
      
      expect(userId.getValue()).toBe('user_123_abc');
    });
    
    it('debería aceptar IDs con caracteres especiales', () => {
      const userId = new UserId('user-id-123');
      
      expect(userId.getValue()).toBe('user-id-123');
    });
    
    it('debería aceptar IDs numéricos como string', () => {
      const userId = new UserId('12345');
      
      expect(userId.getValue()).toBe('12345');
    });
    
  });
  
  // ═══════════════════════════════════════════════════════════════
  // TESTS DE VALIDACIÓN - CASOS DE ERROR
  // ═══════════════════════════════════════════════════════════════
  
  describe('Validación', () => {
    
    it('debería rechazar ID vacío', () => {
      expect(() => new UserId('')).toThrow('UserId cannot be empty');
    });
    
    it('debería rechazar ID con solo espacios', () => {
      expect(() => new UserId('   ')).toThrow('UserId cannot be empty');
    });
    
    it('debería rechazar ID con tabs', () => {
      expect(() => new UserId('\t\t')).toThrow('UserId cannot be empty');
    });
    
    it('debería rechazar ID con saltos de línea', () => {
      expect(() => new UserId('\n\n')).toThrow('UserId cannot be empty');
    });
    
  });
  
  // ═══════════════════════════════════════════════════════════════
  // TESTS DE COMPARACIÓN
  // ═══════════════════════════════════════════════════════════════
  
  describe('Comparación de UserIds', () => {
    
    it('debería retornar true para IDs iguales', () => {
      const id1 = new UserId('abc123');
      const id2 = new UserId('abc123');
      
      expect(id1.equals(id2)).toBe(true);
    });
    
    it('debería retornar false para IDs diferentes', () => {
      const id1 = new UserId('abc123');
      const id2 = new UserId('xyz789');
      
      expect(id1.equals(id2)).toBe(false);
    });
    
    it('debería ser sensible a mayúsculas/minúsculas', () => {
      const id1 = new UserId('ABC123');
      const id2 = new UserId('abc123');
      
      expect(id1.equals(id2)).toBe(false);
    });
    
  });
  
  // ═══════════════════════════════════════════════════════════════
  // TESTS DE SEGURIDAD
  // ═══════════════════════════════════════════════════════════════
  
  describe('Seguridad', () => {
    
    it('debería aceptar pero no ejecutar contenido malicioso', () => {
      // El UserId acepta cualquier string no vacío
      // La protección está en cómo se usa, no en el value object
      const maliciousId = new UserId("'; DROP TABLE users;--");
      
      // Verifica que el valor se guarde literalmente (no ejecutado)
      expect(maliciousId.getValue()).toBe("'; DROP TABLE users;--");
    });
    
  });
  
});

