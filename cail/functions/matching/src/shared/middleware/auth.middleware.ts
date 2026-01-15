import { Request, Response, NextFunction } from 'express';
import { getAuth, getFirestore } from '../../config/firebase.config';
import { AppError } from './error.middleware';

/**
 * Payload del token de Firebase decodificado
 */
export interface FirebaseTokenPayload {
    uid: string;
    email: string;
    tipoUsuario?: string;
}

/**
 * Request extendido con información del usuario autenticado
 */
export interface AuthRequest extends Request {
    user?: FirebaseTokenPayload;
}

/**
 * Middleware de autenticación usando Firebase ID Token
 * Valida el token emitido por Firebase Auth
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

        const idToken = authHeader.substring(7);
        const auth = getAuth();

        // Verificar Firebase ID Token
        const decodedToken = await auth.verifyIdToken(idToken);

        req.user = {
            uid: decodedToken.uid,
            email: decodedToken.email || '',
        };

        next();
    } catch (error: any) {
        console.error('Auth middleware error:', error.code, error.message);

        if (error.code === 'auth/id-token-expired') {
            return next(new AppError(401, 'Token expired'));
        }
        if (error.code === 'auth/argument-error') {
            return next(new AppError(401, 'Invalid token format'));
        }
        if (error.code === 'auth/id-token-revoked') {
            return next(new AppError(401, 'Token has been revoked'));
        }
        if (error instanceof AppError) {
            return next(error);
        }
        next(new AppError(401, 'Authentication failed'));
    }
};

/**
 * Middleware de autorización por roles
 * Obtiene el tipoUsuario de Firestore para validar permisos
 */
export const authorize = (...allowedRoles: string[]) => {
    return async (req: AuthRequest, res: Response, next: NextFunction) => {
        if (!req.user) {
            return next(new AppError(401, 'Not authenticated'));
        }

        try {
            // Obtener tipoUsuario de Firestore
            const db = getFirestore();
            const userDoc = await db.collection('usuarios').doc(req.user.uid).get();

            if (!userDoc.exists) {
                return next(new AppError(404, 'User profile not found'));
            }

            const userData = userDoc.data();
            req.user.tipoUsuario = userData?.tipoUsuario;

            if (!allowedRoles.includes(req.user.tipoUsuario || '')) {
                return next(new AppError(403, 'Not authorized to access this resource'));
            }

            next();
        } catch (error) {
            console.error('Authorization error:', error);
            next(new AppError(500, 'Authorization check failed'));
        }
    };
};
