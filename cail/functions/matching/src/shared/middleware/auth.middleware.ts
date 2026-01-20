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
        console.log('🔐 [AUTH] Authenticate middleware called');

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            console.log('🔐 [AUTH] No token in header');
            throw new AppError(401, 'No token provided');
        }

        const idToken = authHeader.substring(7);
        console.log('🔐 [AUTH] Token found, verifying...');

        const auth = getAuth();

        // Verificar Firebase ID Token
        const decodedToken = await auth.verifyIdToken(idToken);
        console.log('🔐 [AUTH] Token verified, UID:', decodedToken.uid, 'Email:', decodedToken.email);

        req.user = {
            uid: decodedToken.uid,
            email: decodedToken.email || '',
        };

        next();
    } catch (error: any) {
        console.error('🔐 [AUTH] Auth middleware error:', error.code, error.message);

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
        console.log('🔐 [AUTHORIZE] Authorize middleware called, allowed roles:', allowedRoles);

        if (!req.user) {
            console.log('🔐 [AUTHORIZE] No user in request');
            return next(new AppError(401, 'Not authenticated'));
        }

        console.log('🔐 [AUTHORIZE] Looking up user:', req.user.uid);

        try {
            // Obtener tipoUsuario de Firestore
            const db = getFirestore();
            const userDoc = await db.collection('usuarios').doc(req.user.uid).get();

            console.log('🔐 [AUTHORIZE] User doc exists:', userDoc.exists);

            if (!userDoc.exists) {
                console.log('🔐 [AUTHORIZE] User not found in Firestore for UID:', req.user.uid);
                return next(new AppError(404, 'User profile not found'));
            }

            const userData = userDoc.data();
            console.log('🔐 [AUTHORIZE] User data tipoUsuario:', userData?.tipoUsuario);

            req.user.tipoUsuario = userData?.tipoUsuario;

            if (!allowedRoles.includes(req.user.tipoUsuario || '')) {
                console.log('🔐 [AUTHORIZE] Role check failed. User role:', req.user.tipoUsuario, 'Allowed:', allowedRoles);
                return next(new AppError(403, 'Not authorized to access this resource'));
            }

            console.log('🔐 [AUTHORIZE] Authorization successful');
            next();
        } catch (error) {
            console.error('🔐 [AUTHORIZE] Authorization error:', error);
            next(new AppError(500, 'Authorization check failed'));
        }
    };
};
