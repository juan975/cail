import { Router } from 'express';
import { authenticate, AuthRequest } from '../../../../shared/infrastructure/middleware/auth.middleware';

const router = Router();

router.get('/profile', authenticate, (req: AuthRequest, res) => {
    res.json({
        message: 'User profile - To be implemented',
        user: req.user
    });
});

export default router;
