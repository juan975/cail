/**
 * Tests unitarios para Email Value Object
 * 
 * Estos tests verifican:
 * - Validación de formato de email
 * - Normalización (lowercase, trim)
 * - Comparación entre emails
 * - Casos de error
 * 
 * @author Erick Gaona - Test & Security Lead
 * @version 1.0.0
 */

import { Email } from '../../../shared/domain/value-objects/Email';

describe('Email Value Object', () => {
  
  // ═══════════════════════════════════════════════════════════════
  // TESTS DE CREACIÓN EXITOSA
  // ═══════════════════════════════════════════════════════════════
  
  describe('Creación exitosa', () => {
    
    it('debería crear un email válido', () => {
      const email = new Email('usuario@ejemplo.com');
      
      expect(email.getValue()).toBe('usuario@ejemplo.com');
    });
    
    it('debería convertir el email a minúsculas', () => {
      const email = new Email('USUARIO@EJEMPLO.COM');
      
      expect(email.getValue()).toBe('usuario@ejemplo.com');
    });
    
    it('debería rechazar emails con espacios (validación estricta)', () => {
      // NOTA: El código actual valida ANTES de hacer trim
      // Los espacios son rechazados por el regex
      expect(() => new Email('  usuario@ejemplo.com  ')).toThrow('Invalid email format');
    });
    
    it('debería aceptar emails con subdominios', () => {
      const email = new Email('usuario@mail.ejemplo.com');
      
      expect(email.getValue()).toBe('usuario@mail.ejemplo.com');
    });
    
    it('debería aceptar emails con números', () => {
      const email = new Email('usuario123@ejemplo.com');
      
      expect(email.getValue()).toBe('usuario123@ejemplo.com');
    });
    
    it('debería aceptar emails con puntos en el nombre', () => {
      const email = new Email('nombre.apellido@ejemplo.com');
      
      expect(email.getValue()).toBe('nombre.apellido@ejemplo.com');
    });
    
  });
  
  // ═══════════════════════════════════════════════════════════════
  // TESTS DE VALIDACIÓN - CASOS DE ERROR
  // ═══════════════════════════════════════════════════════════════
  
  describe('Validación de formato', () => {
    
    it('debería rechazar email sin @', () => {
      expect(() => new Email('usuarioejemplo.com')).toThrow('Invalid email format');
    });
    
    it('debería rechazar email sin dominio', () => {
      expect(() => new Email('usuario@')).toThrow('Invalid email format');
    });
    
    it('debería rechazar email sin nombre de usuario', () => {
      expect(() => new Email('@ejemplo.com')).toThrow('Invalid email format');
    });
    
    it('debería rechazar email con espacios en medio', () => {
      expect(() => new Email('usuario @ejemplo.com')).toThrow('Invalid email format');
    });
    
    it('debería rechazar email sin extensión de dominio', () => {
      expect(() => new Email('usuario@ejemplo')).toThrow('Invalid email format');
    });
    
    it('debería rechazar string vacío', () => {
      expect(() => new Email('')).toThrow('Invalid email format');
    });
    
    it('debería rechazar solo espacios', () => {
      expect(() => new Email('   ')).toThrow('Invalid email format');
    });
    
  });
  
  // ═══════════════════════════════════════════════════════════════
  // TESTS DE COMPARACIÓN
  // ═══════════════════════════════════════════════════════════════
  
  describe('Comparación de emails', () => {
    
    it('debería retornar true para emails iguales', () => {
      const email1 = new Email('usuario@ejemplo.com');
      const email2 = new Email('usuario@ejemplo.com');
      
      expect(email1.equals(email2)).toBe(true);
    });
    
    it('debería retornar true para emails iguales con diferente case', () => {
      const email1 = new Email('USUARIO@EJEMPLO.COM');
      const email2 = new Email('usuario@ejemplo.com');
      
      expect(email1.equals(email2)).toBe(true);
    });
    
    it('debería retornar false para emails diferentes', () => {
      const email1 = new Email('usuario1@ejemplo.com');
      const email2 = new Email('usuario2@ejemplo.com');
      
      expect(email1.equals(email2)).toBe(false);
    });
    
  });
  
  // ═══════════════════════════════════════════════════════════════
  // TESTS DE SEGURIDAD
  // ═══════════════════════════════════════════════════════════════
  
  describe('Seguridad', () => {
    
    it('debería rechazar intentos de inyección SQL en email', () => {
      // El regex actual rechaza espacios y caracteres especiales de SQL
      expect(() => new Email("'; DROP TABLE users;--@ejemplo.com")).toThrow('Invalid email format');
    });
    
    /**
     * HALLAZGO DE SEGURIDAD #1:
     * El regex actual permite algunos caracteres HTML como < > en emails.
     * Técnicamente RFC 5321 permite algunos caracteres especiales en emails.
     * RECOMENDACIÓN: Sanitizar output, no solo validar input.
     */
    it('debería aceptar caracteres que pasan el regex básico (documentar comportamiento)', () => {
      // El regex /^[^\s@]+@[^\s@]+\.[^\s@]+$/ permite < > porque no hay espacios
      const xssEmail = new Email('<script>alert("xss")</script>@ejemplo.com');
      
      // Verifica que el email se crea (comportamiento actual)
      expect(xssEmail.getValue()).toBe('<script>alert("xss")</script>@ejemplo.com');
      
      // NOTA: La protección contra XSS debe estar en la capa de presentación
      // (sanitización de output), no solo en validación de input
    });
    
    /**
     * HALLAZGO DE SEGURIDAD #2:
     * Similar al anterior - el regex permite < >
     */
    it('debería aceptar caracteres especiales que no son espacios ni @', () => {
      const emailConCaracteres = new Email('usuario<>@ejemplo.com');
      
      expect(emailConCaracteres.getValue()).toBe('usuario<>@ejemplo.com');
      
      // RECOMENDACIÓN FUTURA: Usar un regex más estricto o librería de validación
    });
    
  });
  
});

