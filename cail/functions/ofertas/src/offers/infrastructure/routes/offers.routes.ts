import { Router } from 'express';
import { authenticate, authorize } from '../../../shared/middleware/auth.middleware';
import {
    getOffers,
    getOfferById,
    createOffer,
    updateOffer,
    deleteOffer,
    getMyOffers
} from '../controllers/Offers.controller';

const router = Router();

/**
 * @route   GET /offers
 * @desc    Listar todas las ofertas activas
 * @access  Public
 */
router.get('/', getOffers);

/**
 * @route   GET /offers/my-offers
 * @desc    Listar ofertas del reclutador autenticado
 * @access  Private (RECLUTADOR)
 */
router.get('/my-offers', authenticate, authorize('RECLUTADOR'), getMyOffers);

/**
 * @route   GET /offers/:id
 * @desc    Obtener una oferta por ID
 * @access  Public
 */
router.get('/:id', getOfferById);

/**
 * @route   POST /offers
 * @desc    Crear nueva oferta
 * @access  Private (RECLUTADOR)
 */
router.post('/', authenticate, authorize('RECLUTADOR'), createOffer);

/**
 * @route   PUT /offers/:id
 * @desc    Actualizar una oferta
 * @access  Private (RECLUTADOR - dueño)
 */
router.put('/:id', authenticate, authorize('RECLUTADOR'), updateOffer);

/**
 * @route   DELETE /offers/:id
 * @desc    Eliminar una oferta
 * @access  Private (RECLUTADOR - dueño)
 */
router.delete('/:id', authenticate, authorize('RECLUTADOR'), deleteOffer);

export default router;
