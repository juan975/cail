import { Router } from 'express';
import { authenticate } from '../../../shared/middleware/auth.middleware';
import {
    getCandidatesForOffer,
    applyToOffer,
    getMyApplications,
    getOfferApplications
} from '../controllers/Matching.controller';

const router = Router();

/**
 * @route   GET /matching/oferta/:idOferta
 * @desc    Obtener candidatos rankeados para una oferta
 * @access  Public (por ahora)
 */
router.get('/oferta/:idOferta', getCandidatesForOffer);

/**
 * @route   GET /matching/oferta/:idOferta/applications
 * @desc    Listar aplicaciones para una oferta
 * @access  Private (RECLUTADOR)
 */
router.get('/oferta/:idOferta/applications', authenticate, getOfferApplications);

/**
 * @route   POST /matching/apply
 * @desc    Aplicar a una oferta
 * @access  Private (POSTULANTE)
 */
router.post('/apply', authenticate, applyToOffer);

/**
 * @route   GET /matching/applications
 * @desc    Listar mis aplicaciones
 * @access  Private
 */
router.get('/applications', authenticate, getMyApplications);

export default router;
