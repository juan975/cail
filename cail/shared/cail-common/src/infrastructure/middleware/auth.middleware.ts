import { Request, Response, NextFunction } from 'express';
import { AppError } from './error.middleware';
import { JwtUtil, JwtPayload } from '../utils/jwt.util';

/**
 * Request extendido con información del usuario autenticado
 */
export interface AuthRequest extends Request {
    user?: JwtPayload;
}

/**
 * Middleware de autenticación JWT
 * Valida el token y añade la información del usuario al request
 */
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
        const decoded = JwtUtil.verifyToken(token);

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

/**
 * Middleware de autorización por roles
 * @param allowedRoles - Roles permitidos para acceder al recurso
 */
export const authorize = (...allowedRoles: string[]) => {
    return (req: AuthRequest, res: Response, next: NextFunction) => {
        if (!req.user) {
            return next(new AppError(401, 'Not authenticated'));
        }

        if (!allowedRoles.includes(req.user.tipoUsuario)) {
            return next(new AppError(403, 'Not authorized to access this resource'));
        }

        next();
    };
};
