import { Router } from 'express';
import { AuthController } from '../controllers/Auth.controller';
import { authenticate } from '../../../shared/middleware/auth.middleware';

const router = Router();
const authController = new AuthController();

/**
 * @route   POST /auth/register
 * @desc    Registrar nuevo usuario (candidato o reclutador)
 * @access  Public
 */
router.post('/register', authController.register);

/**
 * @route   POST /auth/login
 * @desc    Iniciar sesión
 * @access  Public
 */
router.post('/login', authController.login);

/**
 * @route   POST /auth/change-password
 * @desc    Cambiar contraseña del usuario autenticado
 * @access  Private
 */
router.post('/change-password', authenticate, authController.changePassword);

/**
 * @route   POST /auth/validate-token
 * @desc    Validar token JWT (para comunicación entre microservicios)
 * @access  Private
 */
router.post('/validate-token', authenticate, authController.validateToken);

export default router;
