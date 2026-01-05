import { Request, Response, NextFunction } from 'express';
import { AppError } from './error.middleware';
import { JwtUtil } from '../utils/jwt.util';

export interface AuthRequest extends Request {
    user?: {
        uid: string;
        email: string;
        tipoUsuario: string;
    };
}

export const authenticate = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
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
