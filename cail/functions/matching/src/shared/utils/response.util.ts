import { Response } from 'express';

export class ApiResponse {
    static success<T>(res: Response, data: T, message = 'Success', statusCode = 200): Response {
        return res.status(statusCode).json({ status: 'success', message, data });
    }

    static created<T>(res: Response, data: T, message = 'Resource created'): Response {
        return res.status(201).json({ status: 'success', message, data });
    }
}
