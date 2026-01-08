import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AppError } from './error.middleware';
import { config } from '../../config/env.config';

export interface JwtPayload {
    uid: string;
    email: string;
    tipoUsuario: string;
}

export interface AuthRequest extends Request {
    user?: JwtPayload;
}

export const authenticate = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new AppError(401, 'No token provided');
        }

        const token = authHeader.substring(7);
        const decoded = jwt.verify(token, config.jwt.secret) as JwtPayload;
        req.user = decoded;
        next();
    } catch (error: any) {
        if (error.name === 'JsonWebTokenError') {
            return next(new AppError(401, 'Invalid token'));
        }
        if (error.name === 'TokenExpiredError') {
            return next(new AppError(401, 'Token expired'));
        }
        next(error);
    }
};
