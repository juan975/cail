/**
 * Tests unitarios para Account Entity
 * 
 * Estos tests verifican:
 * - Creación de cuentas
 * - Getters de propiedades
 * - Serialización a JSON
 * - Tipos de usuario
 * 
 * @author Erick Gaona - Test & Security Lead
 * @version 1.0.0
 */

import { Account, TipoUsuario } from '../../../modules/auth/domain/entities/Account.entity';
import { Email } from '../../../shared/domain/value-objects/Email';
import { UserId } from '../../../shared/domain/value-objects/UserId';

describe('Account Entity', () => {
  
  // ═══════════════════════════════════════════════════════════════
  // DATOS DE PRUEBA
  // ═══════════════════════════════════════════════════════════════
  
  const crearAccountProps = (overrides = {}) => ({
    idCuenta: new UserId('user-123'),
    email: new Email('test@ejemplo.com'),
    passwordHash: '$2a$10$hashedpassword123',
    nombreCompleto: 'Juan Pérez',
    telefono: '+593999999999',
    tipoUsuario: TipoUsuario.POSTULANTE,
    fechaRegistro: new Date('2025-01-01'),
    ...overrides
  });
  
  // ═══════════════════════════════════════════════════════════════
  // TESTS DE CREACIÓN
  // ═══════════════════════════════════════════════════════════════
  
  describe('Creación de Account', () => {
    
    it('debería crear una cuenta válida', () => {
      const props = crearAccountProps();
      const account = new Account(props);
      
      expect(account).toBeDefined();
      expect(account.idCuenta.getValue()).toBe('user-123');
    });
    
    it('debería crear una cuenta sin teléfono (opcional)', () => {
      const props = crearAccountProps({ telefono: undefined });
      const account = new Account(props);
      
      expect(account.telefono).toBeUndefined();
    });
    
  });
  
  // ═══════════════════════════════════════════════════════════════
  // TESTS DE GETTERS
  // ═══════════════════════════════════════════════════════════════
  
  describe('Getters', () => {
    
    let account: Account;
    
    beforeEach(() => {
      account = new Account(crearAccountProps());
    });
    
    it('debería retornar el idCuenta correctamente', () => {
      expect(account.idCuenta).toBeInstanceOf(UserId);
      expect(account.idCuenta.getValue()).toBe('user-123');
    });
    
    it('debería retornar el email correctamente', () => {
      expect(account.email).toBeInstanceOf(Email);
      expect(account.email.getValue()).toBe('test@ejemplo.com');
    });
    
    it('debería retornar el passwordHash correctamente', () => {
      expect(account.passwordHash).toBe('$2a$10$hashedpassword123');
    });
    
    it('debería retornar el nombreCompleto correctamente', () => {
      expect(account.nombreCompleto).toBe('Juan Pérez');
    });
    
    it('debería retornar el teléfono correctamente', () => {
      expect(account.telefono).toBe('+593999999999');
    });
    
    it('debería retornar el tipoUsuario correctamente', () => {
      expect(account.tipoUsuario).toBe(TipoUsuario.POSTULANTE);
    });
    
    it('debería retornar la fechaRegistro correctamente', () => {
      expect(account.fechaRegistro).toEqual(new Date('2025-01-01'));
    });
    
  });
  
  // ═══════════════════════════════════════════════════════════════
  // TESTS DE TIPOS DE USUARIO
  // ═══════════════════════════════════════════════════════════════
  
  describe('Tipos de Usuario', () => {
    
    it('debería crear cuenta tipo POSTULANTE', () => {
      const account = new Account(crearAccountProps({
        tipoUsuario: TipoUsuario.POSTULANTE
      }));
      
      expect(account.tipoUsuario).toBe('POSTULANTE');
    });
    
    it('debería crear cuenta tipo RECLUTADOR', () => {
      const account = new Account(crearAccountProps({
        tipoUsuario: TipoUsuario.RECLUTADOR
      }));
      
      expect(account.tipoUsuario).toBe('RECLUTADOR');
    });
    
    it('debería crear cuenta tipo ADMINISTRADOR', () => {
      const account = new Account(crearAccountProps({
        tipoUsuario: TipoUsuario.ADMINISTRADOR
      }));
      
      expect(account.tipoUsuario).toBe('ADMINISTRADOR');
    });
    
  });
  
  // ═══════════════════════════════════════════════════════════════
  // TESTS DE SERIALIZACIÓN
  // ═══════════════════════════════════════════════════════════════
  
  describe('Serialización toJSON', () => {
    
    it('debería serializar correctamente a JSON', () => {
      const fechaRegistro = new Date('2025-01-01');
      const account = new Account(crearAccountProps({ fechaRegistro }));
      
      const json = account.toJSON();
      
      expect(json).toEqual({
        idCuenta: 'user-123',
        email: 'test@ejemplo.com',
        nombreCompleto: 'Juan Pérez',
        telefono: '+593999999999',
        tipoUsuario: 'POSTULANTE',
        fechaRegistro: fechaRegistro
      });
    });
    
    it('debería NO incluir passwordHash en JSON (seguridad)', () => {
      const account = new Account(crearAccountProps());
      
      const json = account.toJSON();
      
      expect(json).not.toHaveProperty('passwordHash');
    });
    
    it('debería manejar telefono undefined en JSON', () => {
      const account = new Account(crearAccountProps({ telefono: undefined }));
      
      const json = account.toJSON();
      
      expect(json.telefono).toBeUndefined();
    });
    
  });
  
  // ═══════════════════════════════════════════════════════════════
  // TESTS DE SEGURIDAD
  // ═══════════════════════════════════════════════════════════════
  
  describe('Seguridad', () => {
    
    it('el passwordHash no debería estar expuesto en toJSON', () => {
      const account = new Account(crearAccountProps({
        passwordHash: 'hash_super_secreto_123'
      }));
      
      const jsonString = JSON.stringify(account.toJSON());
      
      expect(jsonString).not.toContain('hash_super_secreto_123');
    });
    
  });
  
});

// ═══════════════════════════════════════════════════════════════
// TESTS PARA EL ENUM TipoUsuario
// ═══════════════════════════════════════════════════════════════

describe('TipoUsuario Enum', () => {
  
  it('debería tener los valores correctos', () => {
    expect(TipoUsuario.POSTULANTE).toBe('POSTULANTE');
    expect(TipoUsuario.RECLUTADOR).toBe('RECLUTADOR');
    expect(TipoUsuario.ADMINISTRADOR).toBe('ADMINISTRADOR');
  });
  
  it('debería tener exactamente 3 tipos', () => {
    const valores = Object.values(TipoUsuario);
    
    expect(valores).toHaveLength(3);
  });
  
});

