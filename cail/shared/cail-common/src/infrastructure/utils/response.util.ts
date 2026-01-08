import { Response } from 'express';

/**
 * Estructura estándar de respuesta API
 */
interface StandardResponse<T> {
    status: 'success' | 'error';
    message: string;
    data?: T;
}

/**
 * Utilidad para respuestas API estandarizadas
 */
export class ApiResponse {
    /**
     * Respuesta exitosa (200 OK)
     */
    static success<T>(res: Response, data: T, message = 'Success', statusCode = 200): Response {
        const response: StandardResponse<T> = {
            status: 'success',
            message,
            data,
        };
        return res.status(statusCode).json(response);
    }

    /**
     * Recurso creado (201 Created)
     */
    static created<T>(res: Response, data: T, message = 'Resource created'): Response {
        const response: StandardResponse<T> = {
            status: 'success',
            message,
            data,
        };
        return res.status(201).json(response);
    }

    /**
     * Sin contenido (204 No Content)
     */
    static noContent(res: Response): Response {
        return res.status(204).send();
    }

    /**
     * Error (con código personalizado)
     */
    static error(res: Response, message: string, statusCode = 500): Response {
        const response: StandardResponse<null> = {
            status: 'error',
            message,
        };
        return res.status(statusCode).json(response);
    }
}
