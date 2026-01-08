import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

/**
 * Configuración de entorno para la función Usuarios
 */
interface EnvConfig {
    nodeEnv: string;
    port: number;
    firebase: {
        projectId: string;
        clientEmail: string;
        privateKey: string;
    };
    jwt: {
        secret: string;
        expiresIn: string;
    };
    cors: {
        allowedOrigins: string[];
    };
    email: {
        gmailUser: string;
        gmailAppPassword: string;
    };
    // URLs de otros microservicios (para comunicación interna)
    services: {
        ofertas: string;
        matching: string;
    };
}

const validateEnv = (): EnvConfig => {
    const requiredEnvVars = [
        'FIREBASE_PROJECT_ID',
        'FIREBASE_CLIENT_EMAIL',
        'FIREBASE_PRIVATE_KEY',
        'JWT_SECRET',
    ];

    for (const envVar of requiredEnvVars) {
        if (!process.env[envVar]) {
            console.warn(`⚠️ Missing environment variable: ${envVar}`);
        }
    }

    return {
        nodeEnv: process.env.NODE_ENV || 'development',
        port: parseInt(process.env.PORT || '8080', 10),
        firebase: {
            projectId: process.env.FIREBASE_PROJECT_ID || '',
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL || '',
            privateKey: process.env.FIREBASE_PRIVATE_KEY_PATH
                ? fs.readFileSync(process.env.FIREBASE_PRIVATE_KEY_PATH, 'utf8').replace(/\\n/g, '\n')
                : (process.env.FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
        },
        jwt: {
            secret: process.env.JWT_SECRET || 'default-secret-change-in-production',
            expiresIn: process.env.JWT_EXPIRES_IN || '7d',
        },
        cors: {
            allowedOrigins: process.env.ALLOWED_ORIGINS?.split(',') || ['*'],
        },
        email: {
            gmailUser: process.env.GMAIL_USER || '',
            gmailAppPassword: process.env.GMAIL_APP_PASSWORD || '',
        },
        services: {
            ofertas: process.env.OFERTAS_SERVICE_URL || 'http://localhost:8083',
            matching: process.env.MATCHING_SERVICE_URL || 'http://localhost:8084',
        },
    };
};

export const config: EnvConfig = validateEnv();
