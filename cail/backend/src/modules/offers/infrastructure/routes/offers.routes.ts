import { Router } from 'express';
import { authenticate, AuthRequest } from '../../../../shared/infrastructure/middleware/auth.middleware';

const router = Router();

router.get('/', authenticate, (_req: AuthRequest, res) => {
    res.json({ message: 'List offers - To be implemented' });
});

router.post('/', authenticate, (_req: AuthRequest, res) => {
    res.json({ message: 'Create offer - To be implemented' });
});

export default router;
