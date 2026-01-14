import { Router } from 'express';
import { authenticate } from '../../../shared/middleware/auth.middleware';
import { getProfile, updateProfile, getUserById } from '../controllers/Users.controller';
import { uploadCV, getCV, deleteCV } from '../controllers/Cv.controller';

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
 * @route   POST /users/cv/upload
 * @desc    Subir CV del usuario autenticado (busboy handles multipart directly)
 * @access  Private
 */
router.post('/cv/upload', authenticate, uploadCV);

/**
 * @route   GET /users/cv
 * @desc    Obtener URL del CV del usuario
 * @access  Private
 */
router.get('/cv', authenticate, getCV);

/**
 * @route   DELETE /users/cv
 * @desc    Eliminar CV del usuario
 * @access  Private
 */
router.delete('/cv', authenticate, deleteCV);

/**
 * @route   GET /users/:id
 * @desc    Obtener usuario por ID (comunicación entre servicios)
 * @access  Private
 */
router.get('/:id', authenticate, getUserById);

export default router;

