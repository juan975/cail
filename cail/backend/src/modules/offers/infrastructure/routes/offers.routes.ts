import { Router } from 'express';
import { authenticate, AuthRequest } from '../../../../shared/infrastructure/middleware/auth.middleware';
import { OffersController } from '../controllers/offers.controller';

const router = Router();
const offersController = new OffersController();

// GET /api/v1/offers
router.get('/', authenticate, offersController.getOffers);

// POST /api/v1/offers
router.post('/', authenticate, offersController.createOffer);

// GET /api/v1/offers/:id
router.get('/:id', authenticate, offersController.getOfferById);

export default router;
