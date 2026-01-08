import { Router } from 'express';
import { AuthController } from '../controllers/Auth.controller';
import { authenticate } from '../../../../shared/infrastructure/middleware/auth.middleware';

const router = Router();
const authController = new AuthController();

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/change-password', authenticate, authController.changePassword);

export default router;
