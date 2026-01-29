import { Request, Response } from 'express';
import Busboy from 'busboy';
import { Readable } from 'stream';
import { getStorage, getFirestore } from '../../../config/firebase.config';
import { AuthRequest } from '../../../shared/middleware/auth.middleware';

/**
 * Controller para gesti├│n de CV (Curriculum Vitae)
 * Usa busboy para parsing de multipart (compatible con Cloud Functions Gen2)
 */

interface FileUpload {
    buffer: Buffer;
    filename: string;
    mimetype: string;
}

// Extend Request para incluir rawBody de Cloud Functions
interface CloudFunctionRequest extends AuthRequest {
    rawBody?: Buffer;
}

/**
 * Parsea el multipart form data usando busboy
 * Cloud Functions Gen2 provee rawBody, usamos eso en lugar de piping el request
 */
const parseMultipart = (req: CloudFunctionRequest): Promise<FileUpload | null> => {
    return new Promise((resolve, reject) => {
        const busboy = Busboy({ headers: req.headers });
        const chunks: Buffer[] = [];
        let fileInfo: { filename: string; mimetype: string } | null = null;

        busboy.on('file', (fieldname: string, file: Readable, info: { filename: string; mimeType: string }) => {
            console.log('Busboy file event:', fieldname, info);
            fileInfo = { filename: info.filename, mimetype: info.mimeType };

            file.on('data', (data: Buffer) => {
                chunks.push(data);
            });
        });

        busboy.on('finish', () => {
            if (chunks.length === 0 || !fileInfo) {
                resolve(null);
            } else {
                resolve({
                    buffer: Buffer.concat(chunks),
                    filename: fileInfo.filename,
                    mimetype: fileInfo.mimetype,
                });
            }
        });

        busboy.on('error', (error: Error) => {
            console.error('Busboy error:', error);
            reject(error);
        });

        // En Cloud Functions Gen2, el body ya fue consumido - usar rawBody
        if (req.rawBody) {
            console.log('Using rawBody, length:', req.rawBody.length);
            const stream = Readable.from(req.rawBody);
            stream.pipe(busboy);
        } else {
            console.log('No rawBody, piping request directly');
            req.pipe(busboy);
        }
    });
};

/**
 * @route   POST /users/cv/upload
 * @desc    Subir CV del usuario autenticado
 * @access  Private
 */
export const uploadCV = async (req: CloudFunctionRequest, res: Response): Promise<void> => {
    try {
        console.log('=== CV Upload Started ===');

        const userId = req.user?.uid;
        if (!userId) {
            res.status(401).json({ status: 'error', message: 'No autorizado' });
            return;
        }
        console.log('User ID:', userId);

        // Parsear multipart usando busboy
        const file = await parseMultipart(req);
        console.log('Parsed file:', file ? { filename: file.filename, mimetype: file.mimetype, size: file.buffer.length } : 'null');

        if (!file) {
            res.status(400).json({ status: 'error', message: 'No se envi├│ ning├║n archivo' });
            return;
        }

        // Validar que sea PDF
        if (file.mimetype !== 'application/pdf') {
            res.status(400).json({ status: 'error', message: 'Solo se permiten archivos PDF' });
            return;
        }

        // Validar tama├▒o (m├íximo 5MB)
        const maxSize = 5 * 1024 * 1024;
        if (file.buffer.length > maxSize) {
            res.status(400).json({ status: 'error', message: 'El archivo no puede superar 5MB' });
            return;
        }

        const storage = getStorage();
        const bucket = storage.bucket();
        const fileName = `cv/${userId}/cv_${Date.now()}.pdf`;
        const storageFile = bucket.file(fileName);

        console.log('Uploading to Storage:', fileName);

        // Subir archivo a Firebase Storage
        await storageFile.save(file.buffer, {
            metadata: {
                contentType: 'application/pdf',
                metadata: {
                    userId: userId,
                    originalName: file.filename,
                },
            },
        });

        // Hacer el archivo p├║blico y obtener URL
        await storageFile.makePublic();
        const publicUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;

        console.log('File uploaded. Public URL:', publicUrl);

        // Actualizar perfil del usuario con la URL del CV
        const db = getFirestore();
        await db.collection('usuarios').doc(userId).update({
            'candidateProfile.cvUrl': publicUrl,
            updatedAt: new Date(),
        });

        console.log('=== CV Upload Completed ===');

        res.status(200).json({
            status: 'success',
            message: 'CV subido correctamente',
            data: { cvUrl: publicUrl },
        });
    } catch (error: any) {
        console.error('Error uploading CV:', error);
        res.status(500).json({
            status: 'error',
            message: 'Error al subir el CV: ' + (error.message || 'Unknown error'),
        });
    }
};

/**
 * @route   GET /users/cv
 * @desc    Obtener URL del CV del usuario autenticado
 * @access  Private
 */
export const getCV = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user?.uid;
        if (!userId) {
            res.status(401).json({ status: 'error', message: 'No autorizado' });
            return;
        }

        const db = getFirestore();
        const userDoc = await db.collection('usuarios').doc(userId).get();

        if (!userDoc.exists) {
            res.status(404).json({ status: 'error', message: 'Usuario no encontrado' });
            return;
        }

        const userData = userDoc.data();
        const cvUrl = userData?.candidateProfile?.cvUrl;

        res.status(200).json({
            status: 'success',
            data: { cvUrl: cvUrl || null },
        });
    } catch (error: any) {
        console.error('Error getting CV:', error);
        res.status(500).json({
            status: 'error',
            message: 'Error al obtener el CV',
        });
    }
};

/**
 * @route   DELETE /users/cv
 * @desc    Eliminar CV del usuario autenticado
 * @access  Private
 */
export const deleteCV = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user?.uid;
        if (!userId) {
            res.status(401).json({ status: 'error', message: 'No autorizado' });
            return;
        }

        const db = getFirestore();
        const userDoc = await db.collection('usuarios').doc(userId).get();

        if (!userDoc.exists) {
            res.status(404).json({ status: 'error', message: 'Usuario no encontrado' });
            return;
        }

        const userData = userDoc.data();
        const cvUrl = userData?.candidateProfile?.cvUrl;

        if (cvUrl) {
            try {
                const storage = getStorage();
                const bucket = storage.bucket();
                const urlParts = cvUrl.split(`${bucket.name}/`);
                if (urlParts.length > 1) {
                    const filePath = urlParts[1];
                    await bucket.file(filePath).delete();
                }
            } catch (deleteError) {
                console.error('Error deleting file from storage:', deleteError);
            }
        }

        await db.collection('usuarios').doc(userId).update({
            'candidateProfile.cvUrl': null,
            updatedAt: new Date(),
        });

        res.status(200).json({
            status: 'success',
            message: 'CV eliminado correctamente',
        });
    } catch (error: any) {
        console.error('Error deleting CV:', error);
        res.status(500).json({
            status: 'error',
            message: 'Error al eliminar el CV',
        });
    }
};
