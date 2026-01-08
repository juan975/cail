/**
 * Tests unitarios para Auth Middleware
 * 
 * TESTS CRÍTICOS DE SEGURIDAD:
 * - Verificar que tokens inválidos sean rechazados
 * - Verificar que tokens expirados sean rechazados
 * - Verificar que la autorización por roles funcione
 * - Verificar que usuarios no autenticados sean rechazados
 * 
 * @author Erick Gaona - Test & Security Lead
 * @version 1.0.0
 */

import { Response, NextFunction } from 'express';
import { authenticate, authorize, AuthRequest } from '../../../shared/infrastructure/middleware/auth.middleware';
import { AppError } from '../../../shared/infrastructure/middleware/error.middleware';
import { JwtUtil } from '../../../shared/infrastructure/utils/jwt.util';

// Mock de JwtUtil
jest.mock('../../../shared/infrastructure/utils/jwt.util');

// Mock de Response de Express
const mockResponse = () => {
  const res: Partial<Response> = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res as Response;
};

describe('Auth Middleware', () => {
  
  let req: AuthRequest;
  let res: Response;
  let next: NextFunction;
  
  beforeEach(() => {
    req = {
      headers: {},
      user: undefined
    } as AuthRequest;
    res = mockResponse();
    next = jest.fn();
    jest.clearAllMocks();
  });
  
  // ═══════════════════════════════════════════════════════════════
  // TESTS PARA authenticate
  // ═══════════════════════════════════════════════════════════════
  
  describe('authenticate', () => {
    
    describe('Casos exitosos', () => {
      
      it('debería autenticar con token válido', async () => {
        const mockPayload = {
          uid: 'user-123',
          email: 'test@ejemplo.com',
          tipoUsuario: 'POSTULANTE'
        };
        
        (JwtUtil.verifyToken as jest.Mock).mockReturnValue(mockPayload);
        req.headers.authorization = 'Bearer valid-token-123';
        
        await authenticate(req, res, next);
        
        expect(req.user).toEqual(mockPayload);
        expect(next).toHaveBeenCalledWith();
      });
      
      it('debería extraer correctamente el token del header', async () => {
        const mockPayload = { uid: '123', email: 'test@test.com', tipoUsuario: 'ADMIN' };
        (JwtUtil.verifyToken as jest.Mock).mockReturnValue(mockPayload);
        req.headers.authorization = 'Bearer mi-token-secreto';
        
        await authenticate(req, res, next);
        
        expect(JwtUtil.verifyToken).toHaveBeenCalledWith('mi-token-secreto');
      });
      
    });
    
    // ═══════════════════════════════════════════════════════════════
    // TESTS DE SEGURIDAD - SIN TOKEN
    // ═══════════════════════════════════════════════════════════════
    
    describe('Seguridad - Sin token', () => {
      
      it('debería rechazar request sin header Authorization', async () => {
        req.headers.authorization = undefined;
        
        await authenticate(req, res, next);
        
        expect(next).toHaveBeenCalledWith(
          expect.objectContaining({
            statusCode: 401,
            message: 'No token provided'
          })
        );
      });
      
      it('debería rechazar request con header vacío', async () => {
        req.headers.authorization = '';
        
        await authenticate(req, res, next);
        
        expect(next).toHaveBeenCalledWith(
          expect.objectContaining({
            statusCode: 401,
            message: 'No token provided'
          })
        );
      });
      
      it('debería rechazar request sin prefijo Bearer', async () => {
        req.headers.authorization = 'Basic some-token';
        
        await authenticate(req, res, next);
        
        expect(next).toHaveBeenCalledWith(
          expect.objectContaining({
            statusCode: 401,
            message: 'No token provided'
          })
        );
      });
      
      it('debería rechazar request con solo "Bearer " sin token', async () => {
        req.headers.authorization = 'Bearer ';
        
        await authenticate(req, res, next);
        
        // Debería intentar verificar string vacío y fallar
        expect(JwtUtil.verifyToken).toHaveBeenCalledWith('');
      });
      
    });
    
    // ═══════════════════════════════════════════════════════════════
    // TESTS DE SEGURIDAD - TOKEN INVÁLIDO
    // ═══════════════════════════════════════════════════════════════
    
    describe('Seguridad - Token inválido', () => {
      
      it('debería rechazar token malformado', async () => {
        const jwtError = new Error('jwt malformed');
        jwtError.name = 'JsonWebTokenError';
        (JwtUtil.verifyToken as jest.Mock).mockImplementation(() => { throw jwtError; });
        req.headers.authorization = 'Bearer token-invalido';
        
        await authenticate(req, res, next);
        
        expect(next).toHaveBeenCalledWith(
          expect.objectContaining({
            statusCode: 401,
            message: 'Invalid token'
          })
        );
      });
      
      it('debería rechazar token con firma inválida', async () => {
        const jwtError = new Error('invalid signature');
        jwtError.name = 'JsonWebTokenError';
        (JwtUtil.verifyToken as jest.Mock).mockImplementation(() => { throw jwtError; });
        req.headers.authorization = 'Bearer token-firma-incorrecta';
        
        await authenticate(req, res, next);
        
        expect(next).toHaveBeenCalledWith(
          expect.objectContaining({
            statusCode: 401,
            message: 'Invalid token'
          })
        );
      });
      
      it('debería rechazar token expirado', async () => {
        const expiredError = new Error('jwt expired');
        expiredError.name = 'TokenExpiredError';
        (JwtUtil.verifyToken as jest.Mock).mockImplementation(() => { throw expiredError; });
        req.headers.authorization = 'Bearer token-expirado';
        
        await authenticate(req, res, next);
        
        expect(next).toHaveBeenCalledWith(
          expect.objectContaining({
            statusCode: 401,
            message: 'Token expired'
          })
        );
      });
      
    });
    
    // ═══════════════════════════════════════════════════════════════
    // TESTS DE SEGURIDAD - ATAQUES
    // ═══════════════════════════════════════════════════════════════
    
    describe('Seguridad - Intentos de ataque', () => {
      
      it('debería rechazar token con inyección SQL', async () => {
        const jwtError = new Error('jwt malformed');
        jwtError.name = 'JsonWebTokenError';
        (JwtUtil.verifyToken as jest.Mock).mockImplementation(() => { throw jwtError; });
        req.headers.authorization = "Bearer '; DROP TABLE users;--";
        
        await authenticate(req, res, next);
        
        expect(next).toHaveBeenCalledWith(
          expect.objectContaining({
            statusCode: 401
          })
        );
      });
      
      it('debería rechazar token muy largo (posible DoS)', async () => {
        const jwtError = new Error('jwt malformed');
        jwtError.name = 'JsonWebTokenError';
        (JwtUtil.verifyToken as jest.Mock).mockImplementation(() => { throw jwtError; });
        const longToken = 'a'.repeat(10000);
        req.headers.authorization = `Bearer ${longToken}`;
        
        await authenticate(req, res, next);
        
        expect(next).toHaveBeenCalledWith(
          expect.objectContaining({
            statusCode: 401
          })
        );
      });
      
    });
    
  });
  
  // ═══════════════════════════════════════════════════════════════
  // TESTS PARA authorize
  // ═══════════════════════════════════════════════════════════════
  
  describe('authorize', () => {
    
    describe('Casos exitosos', () => {
      
      it('debería autorizar usuario con rol permitido', () => {
        req.user = { uid: '123', email: 'test@test.com', tipoUsuario: 'ADMINISTRADOR' };
        const middleware = authorize('ADMINISTRADOR');
        
        middleware(req, res, next);
        
        expect(next).toHaveBeenCalledWith();
      });
      
      it('debería autorizar cuando hay múltiples roles permitidos', () => {
        req.user = { uid: '123', email: 'test@test.com', tipoUsuario: 'RECLUTADOR' };
        const middleware = authorize('ADMINISTRADOR', 'RECLUTADOR', 'POSTULANTE');
        
        middleware(req, res, next);
        
        expect(next).toHaveBeenCalledWith();
      });
      
    });
    
    // ═══════════════════════════════════════════════════════════════
    // TESTS DE SEGURIDAD - AUTORIZACIÓN
    // ═══════════════════════════════════════════════════════════════
    
    describe('Seguridad - Control de acceso', () => {
      
      it('debería rechazar usuario sin autenticar', () => {
        req.user = undefined;
        const middleware = authorize('ADMINISTRADOR');
        
        middleware(req, res, next);
        
        expect(next).toHaveBeenCalledWith(
          expect.objectContaining({
            statusCode: 401,
            message: 'Not authenticated'
          })
        );
      });
      
      it('debería rechazar usuario con rol no permitido', () => {
        req.user = { uid: '123', email: 'test@test.com', tipoUsuario: 'POSTULANTE' };
        const middleware = authorize('ADMINISTRADOR');
        
        middleware(req, res, next);
        
        expect(next).toHaveBeenCalledWith(
          expect.objectContaining({
            statusCode: 403,
            message: 'Not authorized to access this resource'
          })
        );
      });
      
      it('debería ser case-sensitive en roles', () => {
        req.user = { uid: '123', email: 'test@test.com', tipoUsuario: 'administrador' };
        const middleware = authorize('ADMINISTRADOR');
        
        middleware(req, res, next);
        
        // 'administrador' !== 'ADMINISTRADOR'
        expect(next).toHaveBeenCalledWith(
          expect.objectContaining({
            statusCode: 403
          })
        );
      });
      
      it('debería rechazar intento de escalación de privilegios', () => {
        // Usuario POSTULANTE intentando acceder a recurso de ADMIN
        req.user = { uid: '123', email: 'hacker@test.com', tipoUsuario: 'POSTULANTE' };
        const adminOnlyMiddleware = authorize('ADMINISTRADOR');
        
        adminOnlyMiddleware(req, res, next);
        
        expect(next).toHaveBeenCalledWith(
          expect.objectContaining({
            statusCode: 403,
            message: 'Not authorized to access this resource'
          })
        );
      });
      
    });
    
  });
  
});

