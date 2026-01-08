import { Router } from 'express';
import { authenticate } from '../../../../shared/infrastructure/middleware/auth.middleware';
import { getProfile, updateProfile } from '../controllers/Users.controller';

const router = Router();

// GET /api/v1/users/profile - Get authenticated user's profile
router.get('/profile', authenticate, getProfile);

// PUT /api/v1/users/profile - Update authenticated user's profile
router.put('/profile', authenticate, updateProfile);

export default router;
