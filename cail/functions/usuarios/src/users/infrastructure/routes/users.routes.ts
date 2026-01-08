import { Router } from 'express';
import { authenticate } from '../../../shared/middleware/auth.middleware';
import { getProfile, updateProfile, getUserById } from '../controllers/Users.controller';

const router = Router();

/**
 * @route   GET /users/profile
 * @desc    Obtener perfil del usuario autenticado
 * @access  Private
 */
router.get('/profile', authenticate, getProfile);

/**
 * @route   PUT /users/profile
 * @desc    Actualizar perfil del usuario autenticado
 * @access  Private
 */
router.put('/profile', authenticate, updateProfile);

/**
 * @route   GET /users/:id
 * @desc    Obtener usuario por ID (comunicación entre servicios)
 * @access  Private
 */
router.get('/:id', authenticate, getUserById);

export default router;
