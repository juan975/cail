import { Response } from 'express';
import { FirestoreOfertaRepository } from '../repositories/FirestoreOfertaRepository';
import { Oferta } from '../../domain/entities/Oferta.entity';
import { AuthRequest } from '../../../shared/middleware/auth.middleware';
import { ApiResponse } from '../../../shared/utils/response.util';
import { asyncHandler, AppError } from '../../../shared/middleware/error.middleware';

const ofertaRepository = new FirestoreOfertaRepository();

/**
 * GET /offers
 * Lista todas las ofertas (con filtros opcionales)
 */
export const getOffers = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { estado, ciudad, modalidad, limit } = req.query;

    const ofertas = await ofertaRepository.findAll({
        estado: estado as string,
        ciudad: ciudad as string,
        modalidad: modalidad as string,
        limit: limit ? parseInt(limit as string) : undefined,
    });

    return ApiResponse.success(res, ofertas.map(o => o.toJSON()));
});

/**
 * GET /offers/:id
 * Obtiene una oferta por ID
 */
export const getOfferById = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;

    const oferta = await ofertaRepository.findById(id);
    if (!oferta) {
        throw new AppError(404, 'Offer not found');
    }

    return ApiResponse.success(res, oferta.toJSON());
});

/**
 * POST /offers
 * Crea una nueva oferta (solo reclutadores)
 */
export const createOffer = asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.user) {
        throw new AppError(401, 'Unauthorized');
    }

    if (req.user.tipoUsuario !== 'RECLUTADOR') {
        throw new AppError(403, 'Only recruiters can create offers');
    }

    const oferta = new Oferta({
        idOferta: `offer_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        ...req.body,
        fechaPublicacion: new Date(),
        estado: 'ACTIVA',
        idReclutador: req.user.uid,
    });

    const saved = await ofertaRepository.save(oferta);
    return ApiResponse.created(res, saved.toJSON(), 'Offer created successfully');
});

/**
 * PUT /offers/:id
 * Actualiza una oferta
 */
export const updateOffer = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;

    const oferta = await ofertaRepository.findById(id);
    if (!oferta) {
        throw new AppError(404, 'Offer not found');
    }

    // Verificar que el reclutador sea el dueño
    if (req.user?.uid !== oferta.idReclutador) {
        throw new AppError(403, 'Not authorized to update this offer');
    }

    // Get current offer data
    const currentData = oferta.toJSON();

    // Merge only the fields that are provided in req.body
    // Preserve fechaPublicacion and other system fields
    const updateData = {
        ...currentData,
        titulo: req.body.titulo ?? currentData.titulo,
        descripcion: req.body.descripcion ?? currentData.descripcion,
        empresa: req.body.empresa ?? currentData.empresa,
        ciudad: req.body.ciudad ?? currentData.ciudad,
        modalidad: req.body.modalidad ?? currentData.modalidad,
        tipoContrato: req.body.tipoContrato ?? currentData.tipoContrato,
        salarioMin: req.body.salarioMin ?? currentData.salarioMin,
        salarioMax: req.body.salarioMax ?? currentData.salarioMax,
        experiencia_requerida: req.body.experiencia_requerida ?? currentData.experiencia_requerida,
        formacion_requerida: req.body.formacion_requerida ?? currentData.formacion_requerida,
        competencias_requeridas: req.body.competencias_requeridas ?? currentData.competencias_requeridas,
        nivelJerarquico: req.body.nivelJerarquico ?? currentData.nivelJerarquico,
        estado: req.body.estado ?? currentData.estado,
        // Always preserve these system fields
        idOferta: id,
        idReclutador: currentData.idReclutador,
        fechaPublicacion: currentData.fechaPublicacion,
    };

    const updatedOferta = new Oferta(updateData);

    const saved = await ofertaRepository.save(updatedOferta);
    return ApiResponse.success(res, saved.toJSON(), 'Offer updated successfully');
});

/**
 * DELETE /offers/:id
 * Elimina una oferta
 */
export const deleteOffer = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;

    const oferta = await ofertaRepository.findById(id);
    if (!oferta) {
        throw new AppError(404, 'Offer not found');
    }

    if (req.user?.uid !== oferta.idReclutador) {
        throw new AppError(403, 'Not authorized to delete this offer');
    }

    await ofertaRepository.delete(id);
    return ApiResponse.success(res, null, 'Offer deleted successfully');
});

/**
 * GET /offers/my-offers
 * Lista ofertas del reclutador autenticado
 */
export const getMyOffers = asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.user) {
        throw new AppError(401, 'Unauthorized');
    }

    const ofertas = await ofertaRepository.findByReclutador(req.user.uid);
    return ApiResponse.success(res, ofertas.map(o => o.toJSON()));
});
