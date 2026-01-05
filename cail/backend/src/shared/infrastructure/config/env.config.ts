import dotenv from 'dotenv';

dotenv.config();

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
            throw new Error(`Missing required environment variable: ${envVar}`);
        }
    }

    return {
        nodeEnv: process.env.NODE_ENV || 'development',
        port: parseInt(process.env.PORT || '8080', 10),
        firebase: {
            projectId: process.env.FIREBASE_PROJECT_ID as string,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL as string,
            privateKey: (process.env.FIREBASE_PRIVATE_KEY as string).replace(/\\n/g, '\n'),
        },
        jwt: {
            secret: process.env.JWT_SECRET as string,
            expiresIn: (process.env.JWT_EXPIRES_IN || '7d') as string,
        },
        cors: {
            allowedOrigins: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:8081'],
        },
    };
};

export const config: EnvConfig = validateEnv();
