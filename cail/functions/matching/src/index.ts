/**
 * Cloud Function: Matching
 * 
 * Microservicio de algoritmos de matching candidato-oferta para CAIL.
 * Maneja: Cálculo de compatibilidad, aplicaciones a ofertas
 * 
 * Puerto: 8084
 * Endpoints:
 *   - GET  /matching/oferta/:idOferta          (candidatos compatibles - RECLUTADOR/ADMIN)
 *   - GET  /matching/oferta/:id/applications   (postulaciones de oferta - RECLUTADOR/ADMIN)
 *   - POST /matching/apply                     (aplicar a oferta - CANDIDATO)
 *   - GET  /matching/my-applications           (mis aplicaciones - CANDIDATO)
 *   - GET  /matching/applications              (alias - CANDIDATO)
 */

import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import { http } from '@google-cloud/functions-framework';
import dotenv from 'dotenv';

dotenv.config();

import { config } from './config/env.config';
import { initializeFirebase, getFirestore } from './config/firebase.config';
import matchingRoutes from './matching/infrastructure/routes/matching.routes';
import { errorHandler } from './shared/middleware/error.middleware';
import { applySecurityMiddleware } from './shared/middleware/security.middleware';

// Importar componentes para inicialización
import { MatchingService } from './matching/services/matching.service';
import { FirestoreAplicacionRepository } from './matching/infrastructure/repositories/FirestoreAplicacionRepository';
import {
    FirestorePostulacionRepository,
    CatalogoValidator
} from './matching/infrastructure/repositories/FirestorePostulacionRepository';
import { FirestoreUsuarioRepository } from './matching/infrastructure/repositories/FirestoreUsuarioRepository';
import { createEmbeddingProvider } from './matching/infrastructure/providers/VertexAIEmbeddingProvider';
import { setMatchingService } from './matching/infrastructure/controllers/Matching.controller';

// Inicializar Firebase de forma segura
try {
    initializeFirebase();
} catch (error) {
    console.error('❌ CRITICAL: Error inicializando Firebase. El servidor iniciará pero los endpoints fallarán.', error);
}

// ============================================
// INICIALIZACIÓN DE DEPENDENCIAS (Clean Architecture)
// ============================================

const initializeServices = (): void => {
    const db = getFirestore();

    // Crear repositorios (Infraestructura)
    const matchingRepository = new FirestoreAplicacionRepository(db);
    const postulacionRepository = new FirestorePostulacionRepository(db);
    const catalogoRepository = new CatalogoValidator();
    const usuarioRepository = new FirestoreUsuarioRepository();

    // Crear provider de embeddings (Infraestructura)
    const embeddingProvider = createEmbeddingProvider(
        config.firebase.projectId,
        'us-central1'
    );

    // Crear servicio con inyección de dependencias
    const matchingService = new MatchingService(
        matchingRepository,
        postulacionRepository,
        catalogoRepository,
        embeddingProvider
    );

    // Inyectar repositorio de usuarios para postulaciones enriquecidas
    matchingService.setUsuarioRepository(usuarioRepository);

    // Registrar servicio globalmente para los controllers
    setMatchingService(matchingService);

    console.log('✅ MatchingService inicializado con todas las dependencias');
    console.log('✅ FirestoreUsuarioRepository configurado para postulaciones enriquecidas');
};

// Inicializar servicios
// Inicializar servicios de forma segura
try {
    console.log('🚀 Inicializando servicios de Matching...');
    initializeServices();
} catch (error) {
    console.error('❌ CRITICAL: Error inicializando servicios. El servidor iniciará pero los endpoints pueden fallar.', error);
    // No hacemos throw para permitir que el contenedor inicie y pase el healthcheck
    // Los endpoints individuales fallarán si dependen de servicios no inicializados
}

// ============================================
// CONFIGURACIÓN DE EXPRESS
// ============================================

const app: Application = express();

// Middleware
app.use(cors({
    origin: (requestOrigin: string | undefined, callback: (err: Error | null, allow?: boolean | string) => void) => {
        // Permitir requests sin origen (curl, mobile apps, etc)
        if (!requestOrigin) return callback(null, true);

        // Verificar si el origen está permitido
        // Si la config tiene '*', permitimos todo (reflejando el origen)
        if (config.cors.allowedOrigins.includes('*') || config.cors.allowedOrigins.includes(requestOrigin)) {
            callback(null, true);
        } else {
            console.warn(`⛔ [CORS] Blocked request from: ${requestOrigin}`);
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Aplicar middleware de seguridad (helmet + rate-limit)
applySecurityMiddleware(app);

// Health Check
app.get('/health', (_req: Request, res: Response) => {
    res.json({
        status: 'healthy',
        service: 'matching-function',
        timestamp: new Date().toISOString(),
        environment: config.nodeEnv,
        version: '2.0.0',
        features: [
            'hybrid-matching',
            'rbac-authorization',
            'duplicate-validation',
            'daily-limit-10'
        ]
    });
});

// Rutas de Matching
app.use('/matching', matchingRoutes);

// Error handler
app.use(errorHandler);

// Exportar para Cloud Functions
http('matching', app);

// Servidor local para desarrollo (NO iniciar durante tests o despliegue)
const isTest = process.env.NODE_ENV === 'test' || process.env.JEST_WORKER_ID !== undefined;
const isProduction = process.env.NODE_ENV === 'production';
const isCloudFunction = process.env.FUNCTION_TARGET !== undefined;
const isFirebaseDeployment = process.env.FIREBASE_CONFIG !== undefined ||
    process.env.GCLOUD_PROJECT !== undefined ||
    process.env.K_SERVICE !== undefined;

// Solo iniciar servidor local para desarrollo manual
if (false && !isTest && !isProduction && !isCloudFunction && !isFirebaseDeployment) {
    const PORT = config.port;
    app.listen(PORT, () => {
        console.log(`🚀 Matching Function running on port ${PORT}`);
        console.log(`📍 Environment: ${config.nodeEnv}`);
        console.log(`❤️  Health check: http://localhost:${PORT}/health`);
        console.log(`🎯 Matching endpoints: http://localhost:${PORT}/matching/*`);
        console.log(`🔒 RBAC: CANDIDATO, RECLUTADOR, ADMIN`);
    });
}

export default app;

// ============================================
// FIRESTORE TRIGGERS (Firebase Functions v2)
// ============================================
// Trigger para sincronizar usuarios → candidatos (genera embedding_habilidades)
export { syncCandidatoFromUsuario } from './matching/triggers/syncCandidato.trigger';

// Trigger para generar embeddings de ofertas (genera embedding_oferta)
// export { syncOfertaEmbedding } from './matching/triggers/syncOferta.trigger';

