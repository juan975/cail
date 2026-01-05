import { Router } from 'express';
import { authenticate, AuthRequest } from '../../../../shared/infrastructure/middleware/auth.middleware';

const router = Router();

router.post('/apply', authenticate, (_req: AuthRequest, res) => {
    res.json({ message: 'Apply to offer - To be implemented' });
});

router.get('/applications', authenticate, (_req: AuthRequest, res) => {
    res.json({ message: 'List applications - To be implemented' });
});

export default router;
