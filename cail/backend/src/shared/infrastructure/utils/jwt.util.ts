import jwt from 'jsonwebtoken';
import { config } from '../config/env.config';

interface JwtPayload {
    uid: string;
    email: string;
    tipoUsuario: string;
}

export class JwtUtil {
    static generateToken(payload: JwtPayload): string {
        // @ts-expect-error - JWT types are causing issues with strict mode
        return jwt.sign(
            payload,
            config.jwt.secret,
            { expiresIn: config.jwt.expiresIn }
        );
    }

    static verifyToken(token: string): JwtPayload {
        return jwt.verify(token, config.jwt.secret) as JwtPayload;
    }
}
