import { Router } from 'express';
import { AuthController } from '../controllers/Auth.controller';
import { authenticate } from '../../../shared/middleware/auth.middleware';

const router = Router();
const authController = new AuthController();

/**
 * Rutas de autenticación con Firebase Auth
 * 
 * Flujo de autenticación:
 *   1. CANDIDATOS: Frontend crea usuario con Firebase Auth -> POST /register con firebaseUid
 *   2. EMPLEADORES: POST /register, backend crea en Firebase Auth y envía email
 *   3. Login: Frontend usa Firebase Auth SDK, luego GET /profile
 *   4. Cambio de contraseña: Frontend usa Firebase Auth SDK, luego POST /password-changed
 */

/**
 * @route   POST /auth/register
 * @desc    Registrar nuevo usuario (candidato o reclutador)
 * @access  Public
 */
router.post('/register', authController.register);

/**
 * @route   GET /auth/profile
 * @desc    Obtener perfil del usuario autenticado
 * @access  Private (requiere Firebase ID Token)
 */
router.get('/profile', authenticate, authController.getProfile);

/**
 * @route   POST /auth/password-changed
 * @desc    Confirmar que el usuario cambió su contraseña en Firebase Auth
 * @access  Private (requiere Firebase ID Token)
 */
router.post('/password-changed', authenticate, authController.confirmPasswordChanged);

/**
 * @route   POST /auth/validate-token
 * @desc    Validar Firebase ID Token (para comunicación entre microservicios)
 * @access  Private (requiere Firebase ID Token)
 */
router.post('/validate-token', authenticate, authController.validateToken);

// =========================================
// DEPRECATED ROUTES (mantener por compatibilidad temporal)
// =========================================

/**
 * @deprecated Use Firebase Auth SDK for login
 * @route   POST /auth/login
 */
router.post('/login', authController.login);

/**
 * @deprecated Use Firebase Auth SDK + POST /auth/password-changed
 * @route   POST /auth/change-password
 */
router.post('/change-password', authenticate, authController.changePassword);

export default router;
