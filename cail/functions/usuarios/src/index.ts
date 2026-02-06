
/**
 * Cloud Function: Usuarios
 * 
 * Microservicio de autenticación y gestión de usuarios para CAIL.
 * Maneja: registro, login, cambio de contraseña y perfiles de usuario.
 * 
 * Puerto: 8080
 * Endpoints:
 *   - POST /auth/register
 *   - POST /auth/login
 *   - POST /auth/change-password
 *   - GET  /users/profile
 *   - PUT  /users/profile
 *   - GET  /users/:id
 */

import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import { http } from '@google-cloud/functions-framework';
import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

// Importar configuración
import { config } from './config/env.config';
import { initializeFirebase } from './config/firebase.config';

// Importar rutas
import authRoutes from './auth/infrastructure/routes/auth.routes';
import usersRoutes from './users/infrastructure/routes/users.routes';

// Importar middleware
import { errorHandler } from './shared/middleware/error.middleware';
import { applySecurityMiddleware } from './shared/middleware/security.middleware';

// Inicializar Firebase
initializeFirebase();

// Crear aplicación Express
const app: Application = express();

// Configurar CORS - permitir todos los orígenes para desarrollo y producción
app.use(cors({
    origin: true, // Refleja el origen de la solicitud (permite cualquier origen)
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
}));

// Manejar preflight requests explícitamente
app.options('*', cors());

// Parseo de JSON y URL-encoded (skip multipart/form-data para que multer lo maneje)
app.use((req, res, next) => {
    const contentType = req.headers['content-type'] || '';
    if (contentType.includes('multipart/form-data')) {
        // Skip body parsing for multipart - multer will handle it
        next();
    } else {
        express.json()(req, res, (err) => {
            if (err) return next(err);
            express.urlencoded({ extended: true })(req, res, next);
        });
    }
});

// Aplicar middleware de seguridad (helmet + rate-limit) - Agregado por Erick Gaona
applySecurityMiddleware(app);

// ============================================
// Health Check Endpoint
// ============================================
app.get('/health', (_req: Request, res: Response) => {
    res.json({
        status: 'healthy',
        service: 'usuarios-function',
        timestamp: new Date().toISOString(),
        environment: config.nodeEnv,
        version: '1.0.0'
    });
});

// ============================================
// Rutas de Autenticación
// ============================================
// Debug Logger
app.use((req, res, next) => {
    console.log(`[DEBUG] Request: ${req.method} ${req.originalUrl}`);
    next();
});

// ============================================
// Rutas de Autenticación
// ============================================
app.use('/auth', authRoutes);
app.use('/api/auth', authRoutes);

// ============================================
// Rutas de Usuarios/Perfiles
// ============================================
app.use('/users', usersRoutes);
app.use('/api/users', usersRoutes);

// ============================================
// Debug Catch-All (Temporary)
// ============================================
app.use('*', (req, res) => {
    res.status(404).json({
        status: 'debug_404',
        message: 'Route not found in Express App',
        path: req.path,
        originalUrl: req.originalUrl,
        baseUrl: req.baseUrl,
        method: req.method,
        routes: ['/auth', '/api/auth', '/users', '/api/users']
    });
});

// ============================================
// Manejador de errores global
// ============================================
app.use(errorHandler);

// ============================================
// Exportar para Google Cloud Functions
// ============================================
http('usuarios', app);

// ============================================
// Servidor local para desarrollo
// ============================================
const isTest = process.env.NODE_ENV === 'test' || process.env.JEST_WORKER_ID !== undefined;
const isProduction = process.env.NODE_ENV === 'production';
const isCloudFunction = !!process.env.FUNCTION_TARGET;

if (!isTest && !isProduction && !isCloudFunction) {
    const PORT = config.port;
    app.listen(PORT, () => {
        console.log(`🚀 Usuarios Function running on port ${PORT}`);
        console.log(`📍 Environment: ${config.nodeEnv}`);
        console.log(`❤️  Health check: http://localhost:${PORT}/health`);
        console.log(`🔐 Auth endpoints: http://localhost:${PORT}/auth/*`);
        console.log(`👤 Users endpoints: http://localhost:${PORT}/users/*`);
    });
}

export default app;
