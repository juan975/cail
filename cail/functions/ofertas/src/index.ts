/**
 * Cloud Function: Ofertas
 * 
 * Microservicio de gestión de ofertas laborales para CAIL.
 * Maneja: CRUD de ofertas de trabajo
 * 
 * Puerto: 8083
 * Endpoints:
 *   - GET    /offers
 *   - GET    /offers/:id
 *   - POST   /offers
 *   - PUT    /offers/:id
 *   - DELETE /offers/:id
 */

import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import { http } from '@google-cloud/functions-framework';
import dotenv from 'dotenv';

dotenv.config();

import { config } from './config/env.config';
import { initializeFirebase } from './config/firebase.config';
import offersRoutes from './offers/infrastructure/routes/offers.routes';
import { errorHandler } from './shared/middleware/error.middleware';

// Inicializar Firebase
initializeFirebase();

const app: Application = express();

// Middleware - CORS permitir todos los orígenes
app.use(cors({
    origin: true, // Refleja el origen de la solicitud (permite cualquier origen)
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
}));

// Manejar preflight requests explícitamente
app.options('*', cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check
app.get('/health', (_req: Request, res: Response) => {
    res.json({
        status: 'healthy',
        service: 'ofertas-function',
        timestamp: new Date().toISOString(),
        environment: config.nodeEnv,
        version: '1.0.0'
    });
});

// Rutas de Ofertas
app.use('/offers', offersRoutes);

// Error handler
app.use(errorHandler);

// Exportar para Cloud Functions
http('ofertas', app);

// Servidor local para desarrollo
if (process.env.NODE_ENV !== 'production' || !process.env.FUNCTION_TARGET) {
    const PORT = config.port;
    app.listen(PORT, () => {
        console.log(`🚀 Ofertas Function running on port ${PORT}`);
        console.log(`📍 Environment: ${config.nodeEnv}`);
        console.log(`❤️  Health check: http://localhost:${PORT}/health`);
        console.log(`📋 Offers endpoints: http://localhost:${PORT}/offers/*`);
    });
}

export default app;
