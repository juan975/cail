import { Router } from 'express';
import { authenticate, AuthRequest } from '../../../../shared/infrastructure/middleware/auth.middleware';
import { MatchingController } from '../controllers/matching.controller';

const router = Router();
const matchingController = new MatchingController();

/**
 * @route   GET /api/v1/matching/oferta/:idOferta
 * @desc    Obtener candidatos matcheados para una oferta específica
 * @access  Public (por ahora con datos mock)
 */
router.get('/oferta/:idOferta', matchingController.getCandidatesForOffer);

/**
 * @route   POST /api/v1/matching/apply
 * @desc    Aplicar a una oferta laboral
 * @access  Private
 */
router.post('/apply', authenticate, (_req: AuthRequest, res) => {
    res.json({ message: 'Apply to offer - To be implemented' });
});

/**
 * @route   GET /api/v1/matching/applications
 * @desc    Listar aplicaciones del usuario
 * @access  Private
 */
router.get('/applications', authenticate, (_req: AuthRequest, res) => {
    res.json({ message: 'List applications - To be implemented' });
});

export default router;
