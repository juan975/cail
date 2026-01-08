import jwt from 'jsonwebtoken';

/**
 * Payload del token JWT
 */
export interface JwtPayload {
    uid: string;
    email: string;
    tipoUsuario: string;
}

/**
 * Configuración JWT (se obtiene de variables de entorno)
 */
interface JwtConfig {
    secret: string;
    expiresIn: string;
}

/**
 * Utilidad para manejo de tokens JWT
 */
export class JwtUtil {
    private static config: JwtConfig = {
        secret: process.env.JWT_SECRET || 'default-secret-change-in-production',
        expiresIn: process.env.JWT_EXPIRES_IN || '7d'
    };

    /**
     * Configura los parámetros JWT (llamar al inicio de cada función)
     */
    static configure(config: Partial<JwtConfig>): void {
        JwtUtil.config = { ...JwtUtil.config, ...config };
    }

    /**
     * Genera un token JWT con el payload proporcionado
     */
    static generateToken(payload: JwtPayload): string {
        return jwt.sign(
            payload as object,
            JwtUtil.config.secret,
            { expiresIn: JwtUtil.config.expiresIn } as jwt.SignOptions
        );
    }

    /**
     * Verifica y decodifica un token JWT
     */
    static verifyToken(token: string): JwtPayload {
        return jwt.verify(token, JwtUtil.config.secret) as JwtPayload;
    }
}
