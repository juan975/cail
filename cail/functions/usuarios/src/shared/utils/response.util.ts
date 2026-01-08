import { Response } from 'express';

/**
 * Utilidad para respuestas API estandarizadas
 */
export class ApiResponse {
    static success<T>(res: Response, data: T, message = 'Success', statusCode = 200): Response {
        return res.status(statusCode).json({
            status: 'success',
            message,
            data,
        });
    }

    static created<T>(res: Response, data: T, message = 'Resource created'): Response {
        return res.status(201).json({
            status: 'success',
            message,
            data,
        });
    }

    static noContent(res: Response): Response {
        return res.status(204).send();
    }

    static error(res: Response, message: string, statusCode = 500): Response {
        return res.status(statusCode).json({
            status: 'error',
            message,
        });
    }
}
