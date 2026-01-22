// src/matching/infrastructure/controllers/Matching.controller.ts
// Controladores de Matching con manejo de errores y tipado estricto

import { Request, Response, NextFunction } from 'express';
import { MatchingService } from '../../services/matching.service';
import { AuthRequest } from '../../../shared/middleware/auth.middleware';
import { AppError, asyncHandler } from '../../../shared/middleware/error.middleware';
import {
    DomainError,
    OfertaNoEncontradaError,
    PostulacionDuplicadaError,
    LimitePostulacionesError,
    CatalogoInvalidoError
} from '../../domain/types';

/**
 * Factory para crear el servicio de matching con todas las dependencias
 */
let matchingServiceInstance: MatchingService | null = null;

export const getMatchingService = (): MatchingService => {
    if (!matchingServiceInstance) {
        // Lazy initialization - será configurado en index.ts
        throw new AppError(500, 'MatchingService no inicializado');
    }
    return matchingServiceInstance;
};

export const setMatchingService = (service: MatchingService): void => {
    matchingServiceInstance = service;
};

/**
 * Mapeo de errores de dominio a respuestas HTTP
 */
const handleDomainError = (error: unknown, res: Response): Response => {
    if (error instanceof DomainError) {
        return res.status(error.statusCode).json({
            success: false,
            code: error.code,
            message: error.message
        });
    }

    console.error('Error no controlado:', error);
    return res.status(500).json({
        success: false,
        code: 'INTERNAL_ERROR',
        message: 'Error interno del servidor'
    });
};

// ============================================
// CONTROLADORES EXPORTADOS
// ============================================

/**
 * GET /matching/oferta/:idOferta
 * Obtiene candidatos rankeados para una oferta
 * Acceso: RECLUTADOR, ADMIN
 */
export const getCandidatesForOffer = asyncHandler(
    async (req: AuthRequest, res: Response): Promise<Response> => {
        const { idOferta } = req.params;

        if (!idOferta) {
            return res.status(400).json({
                success: false,
                message: 'El parámetro idOferta es requerido'
            });
        }

        try {
            const service = getMatchingService();
            const resultados = await service.executeMatching(idOferta);

            return res.status(200).json({
                success: true,
                data: resultados,
                meta: {
                    total: resultados.length,
                    ofertaId: idOferta
                }
            });
        } catch (error) {
            return handleDomainError(error, res);
        }
    }
);

/**
 * POST /matching/apply
 * Permite a un candidato aplicar a una oferta
 * Acceso: CANDIDATO
 */
export const applyToOffer = asyncHandler(
    async (req: AuthRequest, res: Response): Promise<Response> => {
        // Validar autenticación
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'No autenticado'
            });
        }

        // Validar rol
        if (req.user.tipoUsuario !== 'CANDIDATO' && req.user.tipoUsuario !== 'POSTULANTE') {
            return res.status(403).json({
                success: false,
                message: 'Solo los candidatos pueden postular a ofertas'
            });
        }

        const { idOferta } = req.body;

        if (!idOferta) {
            return res.status(400).json({
                success: false,
                message: 'El campo idOferta es requerido'
            });
        }

        try {
            const service = getMatchingService();
            const resultado = await service.aplicarAOferta(req.user.uid, idOferta);

            return res.status(201).json({
                success: true,
                data: resultado
            });
        } catch (error) {
            return handleDomainError(error, res);
        }
    }
);

/**
 * Mapea una postulación del backend (snake_case) al formato del frontend (camelCase)
 */
const mapPostulacionToResponse = (postulacion: any) => ({
    idAplicacion: postulacion.id,
    idPostulante: postulacion.id_postulante,
    idOferta: postulacion.id_oferta,
    fechaAplicacion: postulacion.fecha_postulacion,
    estado: postulacion.estado,
    matchScore: postulacion.match_score,
});

/**
 * GET /matching/my-applications
 * Obtiene las postulaciones del candidato autenticado
 * Acceso: CANDIDATO
 */
export const getMyApplications = asyncHandler(
    async (req: AuthRequest, res: Response): Promise<Response> => {
        // Validar autenticación
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'No autenticado'
            });
        }

        // Validar rol
        if (req.user.tipoUsuario !== 'CANDIDATO' && req.user.tipoUsuario !== 'POSTULANTE') {
            return res.status(403).json({
                success: false,
                message: 'Solo los candidatos pueden ver sus postulaciones'
            });
        }

        try {
            const service = getMatchingService();
            const postulaciones = await service.obtenerMisPostulaciones(req.user.uid);

            // Mapear a formato camelCase para el frontend
            const mappedPostulaciones = postulaciones.map(mapPostulacionToResponse);

            return res.status(200).json({
                success: true,
                data: mappedPostulaciones,
                meta: {
                    total: mappedPostulaciones.length
                }
            });
        } catch (error) {
            return handleDomainError(error, res);
        }
    }
);

/**
 * GET /matching/applications (alias para my-applications, para compatibilidad)
 * Acceso: CANDIDATO
 */
export const getApplications = getMyApplications;

/**
 * GET /matching/oferta/:idOferta/applications
 * Lista las postulaciones recibidas para una oferta
 * Acceso: RECLUTADOR, ADMIN
 */
export const getOfferApplications = asyncHandler(
    async (req: AuthRequest, res: Response): Promise<Response> => {
        // Validar autenticación
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'No autenticado'
            });
        }

        // Validar rol
        if (req.user.tipoUsuario !== 'RECLUTADOR' && req.user.tipoUsuario !== 'ADMIN') {
            return res.status(403).json({
                success: false,
                message: 'Solo reclutadores y administradores pueden ver postulaciones de ofertas'
            });
        }

        const { idOferta } = req.params;

        if (!idOferta) {
            return res.status(400).json({
                success: false,
                message: 'El parámetro idOferta es requerido'
            });
        }

        try {
            const service = getMatchingService();
            const postulaciones = await service.obtenerPostulacionesOferta(idOferta);

            return res.status(200).json({
                success: true,
                data: postulaciones,
                meta: {
                    total: postulaciones.length,
                    ofertaId: idOferta
                }
            });
        } catch (error) {
            return handleDomainError(error, res);
        }
    }
);

/**
 * Mapea PostulacionConCandidato a formato de respuesta para el frontend
 */
const mapPostulacionConCandidatoToResponse = (postulacion: any) => {
    const candidat = postulacion.candidato || {};
    const profile = candidat.candidateProfile || {};
    return {
        idAplicacion: postulacion.id,
        idPostulante: postulacion.id_postulante,
        idOferta: postulacion.id_oferta,
        fechaAplicacion: postulacion.fecha_postulacion,
        estado: postulacion.estado,
        matchScore: postulacion.match_score,
        candidato: postulacion.candidato ? {
            nombreCompleto: candidat.nombreCompleto,
            email: candidat.email,
            telefono: candidat.telefono || profile.phone,

            ciudad: profile.ciudad || candidat.ciudad,
            nivelEducativo: profile.nivelEducacion || candidat.nivelEducativo,
            resumenProfesional: profile.resumenProfesional || candidat.resumenProfesional,

            habilidadesTecnicas: profile.habilidadesTecnicas || candidat.habilidadesTecnicas || [],
            habilidadesBlandas: profile.softSkills || candidat.habilidadesBlandas || [],

            experienciaAnios: profile.anosExperiencia || candidat.experienciaAnios,
            cvUrl: profile.cvUrl || candidat.cvUrl,

            candidateProfile: profile
        } : undefined
    };
};

/**
 * GET /matching/oferta/:idOferta/applications-detailed
 * Lista las postulaciones recibidas para una oferta CON INFORMACIÓN DEL CANDIDATO
 * Acceso: RECLUTADOR, ADMIN
 */
export const getOfferApplicationsDetailed = asyncHandler(
    async (req: AuthRequest, res: Response): Promise<Response> => {
        // Validar autenticación
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'No autenticado'
            });
        }

        // Validar rol
        if (req.user.tipoUsuario !== 'RECLUTADOR' && req.user.tipoUsuario !== 'ADMIN') {
            return res.status(403).json({
                success: false,
                message: 'Solo reclutadores y administradores pueden ver postulaciones de ofertas'
            });
        }

        const { idOferta } = req.params;

        if (!idOferta) {
            return res.status(400).json({
                success: false,
                message: 'El parámetro idOferta es requerido'
            });
        }

        try {
            const service = getMatchingService();
            const postulaciones = await service.obtenerPostulacionesConCandidatos(idOferta);

            // Mapear a formato camelCase para el frontend
            const mappedPostulaciones = postulaciones.map(mapPostulacionConCandidatoToResponse);

            return res.status(200).json({
                success: true,
                data: mappedPostulaciones,
                meta: {
                    total: mappedPostulaciones.length,
                    ofertaId: idOferta
                }
            });
        } catch (error) {
            return handleDomainError(error, res);
        }
    }
);



/**
 * PATCH /matching/postulacion/:idAplicacion/status
 * Actualiza el estado de una postulación
 * Acceso: RECLUTADOR, ADMIN
 */
export const updateApplicationStatus = asyncHandler(
    async (req: AuthRequest, res: Response): Promise<Response> => {
        // Validar autenticación
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'No autenticado'
            });
        }

        // Validar rol
        if (req.user.tipoUsuario !== 'RECLUTADOR' && req.user.tipoUsuario !== 'ADMIN') {
            return res.status(403).json({
                success: false,
                message: 'Solo reclutadores y administradores pueden actualizar postulaciones'
            });
        }

        const { idAplicacion } = req.params;
        const { estado } = req.body;

        if (!idAplicacion || !estado) {
            return res.status(400).json({
                success: false,
                message: 'idAplicacion y estado son requeridos'
            });
        }

        const estadosValidos = ['PENDIENTE', 'EN_REVISION', 'ACEPTADA', 'RECHAZADA'];
        if (!estadosValidos.includes(estado)) {
            return res.status(400).json({
                success: false,
                message: `Estado inválido. Valores permitidos: ${estadosValidos.join(', ')}`
            });
        }

        try {
            const service = getMatchingService();
            await service.actualizarEstadoPostulacion(idAplicacion, estado as any);

            return res.status(200).json({
                success: true,
                message: 'Estado actualizado correctamente',
                data: { idAplicacion, nuevoEstado: estado }
            });
        } catch (error) {
            return handleDomainError(error, res);
        }
    }
);

// ============================================
// CLASE ALTERNATIVA (Para compatibilidad con código existente)
// ============================================

export class MatchingController {
    constructor(private matchingService: MatchingService) {
        // Registrar el servicio globalmente
        setMatchingService(matchingService);
    }

    async getRecommendations(req: Request, res: Response): Promise<Response> {
        try {
            const { offerId } = req.params;
            const results = await this.matchingService.executeMatching(offerId);

            return res.status(200).json({ success: true, data: results });
        } catch (error) {
            return handleDomainError(error, res);
        }
    }
}