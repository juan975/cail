import { Request, Response, NextFunction } from 'express';
import { AppError } from './error.middleware';
import { getAuth, getDb } from '../../config/firebase.config';

/**
 * Payload del usuario autenticado
 */
export interface JwtPayload {
    uid: string;
    email: string;
    tipoUsuario: string;
}

/**
 * Request extendido con información del usuario autenticado
 */
export interface AuthRequest extends Request {
    user?: JwtPayload;
}

/**
 * Middleware de autenticación que soporta Firebase ID Tokens
 * 
 * Verifica el token de Firebase y obtiene el tipoUsuario de Firestore
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

        // Verify Firebase ID Token
        const auth = getAuth();
        const decodedToken = await auth.verifyIdToken(token);

        // Get user info from Firestore to get tipoUsuario
        const db = getDb();
        const userDoc = await db.collection('cuentas').doc(decodedToken.uid).get();

        if (userDoc.exists) {
            const userData = userDoc.data();
            req.user = {
                uid: decodedToken.uid,
                email: decodedToken.email || userData?.email || '',
                tipoUsuario: userData?.tipoUsuario || 'POSTULANTE',
            };
        } else {
            // User exists in Firebase Auth but not in Firestore yet
            req.user = {
                uid: decodedToken.uid,
                email: decodedToken.email || '',
                tipoUsuario: 'POSTULANTE', // Default
            };
        }

        next();
    } catch (error: any) {
        console.error('Auth middleware error:', error.message);

        if (error.code === 'auth/id-token-expired') {
            return next(new AppError(401, 'Token expired'));
        }
        if (error.code === 'auth/argument-error' || error.code === 'auth/invalid-id-token') {
            return next(new AppError(401, 'Invalid token'));
        }
        if (error instanceof AppError) {
            return next(error);
        }
        next(new AppError(401, 'Authentication failed'));
    }
};

/**
 * Middleware de autorización por roles
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
