import { Request, Response } from 'express';
import { bucket } from '../../../config/firebase.config';
import { ApiResponse } from '../../../shared/utils/response.util';

/**
 * Controller para manejo de CV (Curriculum Vitae)
 * Responsable: Alex Ramírez
 * Seguridad implementada:
 * - Solo archivos PDF permitidos (validado en multer)
 * - Máximo 5MB (validado en multer)
 * - Rutas protegidas con authenticate middleware
 */

/**
 * @desc    Subir CV del usuario autenticado
 * @route   POST /users/cv/upload
 * @access  Private
 */
export const uploadCV = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = (req as any).user?.uid;
        
        if (!userId) {
            ApiResponse.error(res, 'Usuario no autenticado', 401);
            return;
        }

        if (!req.file) {
            ApiResponse.error(res, 'No se proporcionó ningún archivo', 400);
            return;
        }

        // Crear nombre único para el archivo
        const fileName = `cvs/${userId}/cv_${Date.now()}.pdf`;
        const file = bucket.file(fileName);

        // Subir archivo a Firebase Storage
        await file.save(req.file.buffer, {
            metadata: {
                contentType: 'application/pdf',
            },
        });

        // Obtener URL pública (o signed URL si es privado)
        const [url] = await file.getSignedUrl({
            action: 'read',
            expires: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 días
        });

        ApiResponse.created(res, { 
            cvUrl: url,
            fileName: fileName
        }, 'CV subido exitosamente');

    } catch (error: any) {
        console.error('Error subiendo CV:', error);
        ApiResponse.error(res, 'Error al subir el CV', 500);
    }
};

/**
 * @desc    Obtener URL del CV del usuario
 * @route   GET /users/cv
 * @access  Private
 */
export const getCV = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = (req as any).user?.uid;
        
        if (!userId) {
            ApiResponse.error(res, 'Usuario no autenticado', 401);
            return;
        }

        // Buscar CV del usuario en Storage
        const [files] = await bucket.getFiles({ prefix: `cvs/${userId}/` });
        
        if (files.length === 0) {
            ApiResponse.error(res, 'No se encontró CV para este usuario', 404);
            return;
        }

        // Obtener el CV más reciente
        const latestFile = files[files.length - 1];
        const [url] = await latestFile.getSignedUrl({
            action: 'read',
            expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
        });

        ApiResponse.success(res, { 
            cvUrl: url,
            fileName: latestFile.name
        });

    } catch (error: any) {
        console.error('Error obteniendo CV:', error);
        ApiResponse.error(res, 'Error al obtener el CV', 500);
    }
};

/**
 * @desc    Eliminar CV del usuario
 * @route   DELETE /users/cv
 * @access  Private
 */
export const deleteCV = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = (req as any).user?.uid;
        
        if (!userId) {
            ApiResponse.error(res, 'Usuario no autenticado', 401);
            return;
        }

        // Buscar y eliminar CVs del usuario
        const [files] = await bucket.getFiles({ prefix: `cvs/${userId}/` });
        
        if (files.length === 0) {
            ApiResponse.error(res, 'No se encontró CV para eliminar', 404);
            return;
        }

        // Eliminar todos los CVs del usuario
        await Promise.all(files.map(file => file.delete()));

        ApiResponse.success(res, { 
            message: 'CV eliminado exitosamente' 
        });

    } catch (error: any) {
        console.error('Error eliminando CV:', error);
        ApiResponse.error(res, 'Error al eliminar el CV', 500);
    }
};

