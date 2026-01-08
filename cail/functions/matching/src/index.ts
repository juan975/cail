/**
 * Cloud Function: Matching
 * 
 * Microservicio de algoritmos de matching candidato-oferta para CAIL.
 * Maneja: Cálculo de compatibilidad, aplicaciones a ofertas
 * 
 * Puerto: 8084
 * Endpoints:
 *   - GET  /matching/oferta/:idOferta  (candidatos compatibles)
 *   - POST /matching/apply             (aplicar a oferta)
 *   - GET  /matching/applications      (mis aplicaciones)
 */

import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import { http } from '@google-cloud/functions-framework';
import dotenv from 'dotenv';

dotenv.config();

import { config } from './config/env.config';
import { initializeFirebase } from './config/firebase.config';
import matchingRoutes from './matching/infrastructure/routes/matching.routes';
import { errorHandler } from './shared/middleware/error.middleware';

// Inicializar Firebase
initializeFirebase();

const app: Application = express();

// Middleware
app.use(cors({
    origin: config.cors.allowedOrigins,
    credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check
app.get('/health', (_req: Request, res: Response) => {
    res.json({
        status: 'healthy',
        service: 'matching-function',
        timestamp: new Date().toISOString(),
        environment: config.nodeEnv,
        version: '1.0.0'
    });
});

// Rutas de Matching
app.use('/matching', matchingRoutes);

// Error handler
app.use(errorHandler);

// Exportar para Cloud Functions
http('matching', app);

// Servidor local para desarrollo
if (process.env.NODE_ENV !== 'production' || !process.env.FUNCTION_TARGET) {
    const PORT = config.port;
    app.listen(PORT, () => {
        console.log(`🚀 Matching Function running on port ${PORT}`);
        console.log(`📍 Environment: ${config.nodeEnv}`);
        console.log(`❤️  Health check: http://localhost:${PORT}/health`);
        console.log(`🎯 Matching endpoints: http://localhost:${PORT}/matching/*`);
    });
}

export default app;
