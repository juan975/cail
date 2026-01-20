// src/matching/infrastructure/routes/matching.routes.ts
// Rutas de Matching con autenticación y autorización RBAC

import { Router } from 'express';
import { authenticate, authorize } from '../../../shared/middleware/auth.middleware';
import {
    getCandidatesForOffer,
    applyToOffer,
    getMyApplications,
    getOfferApplications
} from '../controllers/Matching.controller';

const router = Router();

// ============================================
// RUTAS PÚBLICAS (Sin autenticación)
// ============================================

// Ninguna ruta pública en este módulo

// ============================================
// RUTAS PARA CANDIDATOS/POSTULANTES
// ============================================

/**
 * @route   POST /matching/apply
 * @desc    Aplicar a una oferta laboral
 * @access  Private - Solo CANDIDATO/POSTULANTE
 */
router.post(
    '/apply',
    authenticate,
    authorize('CANDIDATO', 'POSTULANTE'),
    applyToOffer
);

/**
 * @route   GET /matching/my-applications
 * @desc    Obtener mis postulaciones (candidato autenticado)
 * @access  Private - Solo CANDIDATO/POSTULANTE
 */
router.get(
    '/my-applications',
    authenticate,
    authorize('CANDIDATO', 'POSTULANTE'),
    getMyApplications
);

/**
 * @route   GET /matching/applications
 * @desc    Alias de /my-applications para compatibilidad
 * @access  Private - Solo CANDIDATO/POSTULANTE
 */
router.get(
    '/applications',
    authenticate,
    authorize('CANDIDATO', 'POSTULANTE'),
    getMyApplications
);

// ============================================
// RUTAS PARA RECLUTADORES Y ADMINISTRADORES
// ============================================

/**
 * @route   GET /matching/oferta/:idOferta
 * @desc    Obtener candidatos rankeados para una oferta
 * @access  Private - Solo RECLUTADOR/ADMIN
 */
router.get(
    '/oferta/:idOferta',
    authenticate,
    authorize('RECLUTADOR', 'ADMIN'),
    getCandidatesForOffer
);

/**
 * @route   GET /matching/oferta/:idOferta/applications
 * @desc    Listar postulaciones recibidas para una oferta
 * @access  Private - Solo RECLUTADOR/ADMIN
 */
router.get(
    '/oferta/:idOferta/applications',
    authenticate,
    authorize('RECLUTADOR', 'ADMIN'),
    getOfferApplications
);

export default router;
