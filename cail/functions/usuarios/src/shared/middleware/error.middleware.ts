import { Request, Response, NextFunction } from 'express';

/**
 * Error de aplicación personalizado
 */
export class AppError extends Error {
    constructor(
        public statusCode: number,
        public message: string,
        public isOperational = true
    ) {
        super(message);
        Object.setPrototypeOf(this, AppError.prototype);
    }
}

/**
 * Middleware de manejo de errores global
 */
export const errorHandler = (
    err: Error | AppError,
    _req: Request,
    res: Response,
    _next: NextFunction
): Response => {
    if (err instanceof AppError) {
        return res.status(err.statusCode).json({
            status: 'error',
            message: err.message,
        });
    }

    console.error('ERROR:', err);

    // En producción idealmente no devolvemos el error crudo, 
    // pero para depurar ESTE problema específico, lo necesitamos.
    return res.status(500).json({
        status: 'error',
        message: 'Internal server error: ' + (err.message || 'Unknown error'),
        details: err.stack // Opcional: enviar stack trace si es crítico ver dónde falla
    });
};

/**
 * Wrapper para manejar errores en funciones async
 */
export const asyncHandler = (fn: Function) => {
    return (req: Request, res: Response, next: NextFunction) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};
