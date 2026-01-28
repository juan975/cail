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
    };
    cors: {
        allowedOrigins: string[];
    };
    services: {
        usuarios: string;
        ofertas: string;
    };
}

const validateEnv = (): EnvConfig => {
    return {
        nodeEnv: process.env.NODE_ENV || 'development',
        port: parseInt(process.env.APP_PORT || '8084', 10),
        firebase: {
            projectId: process.env.FB_PROJECT_ID || '',
            clientEmail: process.env.FB_CLIENT_EMAIL || '',
            privateKey: (process.env.FB_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
        },
        jwt: {
            secret: process.env.JWT_SECRET || 'default-secret',
        },
        cors: {
            allowedOrigins: process.env.ALLOWED_ORIGINS?.split(',') || ['*'],
        },
        services: {
            usuarios: process.env.USUARIOS_SERVICE_URL || 'http://localhost:8080',
            ofertas: process.env.OFERTAS_SERVICE_URL || 'http://localhost:8083',
        },
    };
};

export const config: EnvConfig = validateEnv();
