/**
 * Tests unitarios para Error Middleware
 * 
 * Estos tests verifican:
 * - Clase AppError funciona correctamente
 * - errorHandler maneja AppError con código correcto
 * - errorHandler oculta detalles internos en errores genéricos
 * - asyncHandler maneja promesas correctamente
 * 
 * IMPORTANTE PARA SEGURIDAD:
 * - Verifica que NO se filtren detalles internos del servidor
 * - Verifica que los mensajes de error sean genéricos para errores no controlados
 * 
 * @author Erick Gaona - Test & Security Lead
 * @version 1.0.0
 */

import { Request, Response, NextFunction } from 'express';
import { AppError, errorHandler, asyncHandler } from '../../../shared/infrastructure/middleware/error.middleware';

// Mock de Response de Express
const mockResponse = () => {
  const res: Partial<Response> = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res as Response;
};

// Mock de Request de Express
const mockRequest = () => {
  return {} as Request;
};

// Mock de NextFunction
const mockNext: NextFunction = jest.fn();

describe('Error Middleware', () => {
  
  // ═══════════════════════════════════════════════════════════════
  // TESTS PARA AppError
  // ═══════════════════════════════════════════════════════════════
  
  describe('AppError', () => {
    
    it('debería crear un AppError con código de estado y mensaje', () => {
      const error = new AppError(400, 'Bad Request');
      
      expect(error.statusCode).toBe(400);
      expect(error.message).toBe('Bad Request');
      expect(error.isOperational).toBe(true);
    });
    
    it('debería crear un AppError con isOperational personalizado', () => {
      const error = new AppError(500, 'Server Error', false);
      
      expect(error.isOperational).toBe(false);
    });
    
    it('debería ser instancia de Error', () => {
      const error = new AppError(404, 'Not Found');
      
      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(AppError);
    });
    
    it('debería crear errores comunes correctamente', () => {
      const badRequest = new AppError(400, 'Bad Request');
      const unauthorized = new AppError(401, 'Unauthorized');
      const forbidden = new AppError(403, 'Forbidden');
      const notFound = new AppError(404, 'Not Found');
      
      expect(badRequest.statusCode).toBe(400);
      expect(unauthorized.statusCode).toBe(401);
      expect(forbidden.statusCode).toBe(403);
      expect(notFound.statusCode).toBe(404);
    });
    
  });
  
  // ═══════════════════════════════════════════════════════════════
  // TESTS PARA errorHandler
  // ═══════════════════════════════════════════════════════════════
  
  describe('errorHandler', () => {
    
    let req: Request;
    let res: Response;
    let next: NextFunction;
    
    beforeEach(() => {
      req = mockRequest();
      res = mockResponse();
      next = mockNext;
      jest.clearAllMocks();
    });
    
    it('debería manejar AppError con código correcto', () => {
      const error = new AppError(400, 'Datos inválidos');
      
      errorHandler(error, req, res, next);
      
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'Datos inválidos'
      });
    });
    
    it('debería manejar AppError 401 Unauthorized', () => {
      const error = new AppError(401, 'Token inválido');
      
      errorHandler(error, req, res, next);
      
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'Token inválido'
      });
    });
    
    it('debería manejar AppError 403 Forbidden', () => {
      const error = new AppError(403, 'Acceso denegado');
      
      errorHandler(error, req, res, next);
      
      expect(res.status).toHaveBeenCalledWith(403);
    });
    
    // ═══════════════════════════════════════════════════════════════
    // TESTS DE SEGURIDAD - MUY IMPORTANTES
    // ═══════════════════════════════════════════════════════════════
    
    describe('Seguridad - Ocultación de detalles internos', () => {
      
      it('debería ocultar detalles de errores genéricos', () => {
        const error = new Error('Error de conexión a la base de datos: password incorrecto');
        
        errorHandler(error, req, res, next);
        
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
          status: 'error',
          message: 'Internal server error'
        });
      });
      
      it('NO debería exponer stack traces en errores genéricos', () => {
        const error = new Error('Database connection failed');
        error.stack = 'Error: Database connection failed\n    at Object.<anonymous>';
        
        errorHandler(error, req, res, next);
        
        const jsonCall = (res.json as jest.Mock).mock.calls[0][0];
        
        expect(jsonCall).not.toHaveProperty('stack');
        expect(JSON.stringify(jsonCall)).not.toContain('stack');
      });
      
      it('NO debería exponer información sensible del servidor', () => {
        const error = new Error('FIREBASE_PRIVATE_KEY is invalid');
        
        errorHandler(error, req, res, next);
        
        const jsonCall = (res.json as jest.Mock).mock.calls[0][0];
        
        expect(jsonCall.message).toBe('Internal server error');
        expect(jsonCall.message).not.toContain('FIREBASE');
        expect(jsonCall.message).not.toContain('PRIVATE_KEY');
      });
      
      it('NO debería exponer rutas internas del servidor', () => {
        const error = new Error('Cannot find module at /app/src/secret/config.ts');
        
        errorHandler(error, req, res, next);
        
        const jsonCall = (res.json as jest.Mock).mock.calls[0][0];
        
        expect(jsonCall.message).not.toContain('/app/src');
      });
      
    });
    
  });
  
  // ═══════════════════════════════════════════════════════════════
  // TESTS PARA asyncHandler
  // ═══════════════════════════════════════════════════════════════
  
  describe('asyncHandler', () => {
    
    let req: Request;
    let res: Response;
    let next: NextFunction;
    
    beforeEach(() => {
      req = mockRequest();
      res = mockResponse();
      next = jest.fn();
    });
    
    it('debería manejar funciones async exitosas', async () => {
      const asyncFn = jest.fn().mockResolvedValue('success');
      
      const wrapped = asyncHandler(asyncFn);
      await wrapped(req, res, next);
      
      expect(asyncFn).toHaveBeenCalledWith(req, res, next);
      expect(next).not.toHaveBeenCalled();
    });
    
    it('debería pasar errores al next()', async () => {
      const error = new Error('Async error');
      const asyncFn = jest.fn().mockRejectedValue(error);
      
      const wrapped = asyncHandler(asyncFn);
      await wrapped(req, res, next);
      
      expect(next).toHaveBeenCalledWith(error);
    });
    
    it('debería manejar AppError en funciones async', async () => {
      const appError = new AppError(400, 'Validation failed');
      const asyncFn = jest.fn().mockRejectedValue(appError);
      
      const wrapped = asyncHandler(asyncFn);
      await wrapped(req, res, next);
      
      expect(next).toHaveBeenCalledWith(appError);
    });
    
  });
  
});

