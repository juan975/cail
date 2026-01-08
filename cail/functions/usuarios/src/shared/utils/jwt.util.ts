import jwt from 'jsonwebtoken';
import { config } from '../../config/env.config';

/**
 * Payload del token JWT
 */
export interface JwtPayload {
    uid: string;
    email: string;
    tipoUsuario: string;
}

/**
 * Utilidad para manejo de tokens JWT
 */
export class JwtUtil {
    static generateToken(payload: JwtPayload): string {
        return jwt.sign(
            payload as object,
            config.jwt.secret,
            { expiresIn: config.jwt.expiresIn } as jwt.SignOptions
        );
    }

    static verifyToken(token: string): JwtPayload {
        return jwt.verify(token, config.jwt.secret) as JwtPayload;
    }
}
