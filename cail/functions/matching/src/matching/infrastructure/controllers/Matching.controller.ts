import { Response } from 'express';
import axios from 'axios';
import { MatchingService } from '../../services/matching.service';
import { FirestoreAplicacionRepository } from '../repositories/FirestoreAplicacionRepository';
import { AuthRequest } from '../../../shared/middleware/auth.middleware';
import { ApiResponse } from '../../../shared/utils/response.util';
import { asyncHandler, AppError } from '../../../shared/middleware/error.middleware';
import { config } from '../../../config/env.config';
import { Postulante, Oferta, Aplicacion } from '../../domain/types';

const matchingService = new MatchingService();
const aplicacionRepository = new FirestoreAplicacionRepository();

/**
 * GET /matching/oferta/:idOferta
 * Obtiene candidatos rankeados para una oferta
 */
export const getCandidatesForOffer = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { idOferta } = req.params;

    // Obtener la oferta desde el servicio de ofertas
    let oferta: Oferta;
    try {
        const ofertaResponse = await axios.get(`${config.services.ofertas}/offers/${idOferta}`);
        oferta = ofertaResponse.data.data;
    } catch (error) {
        throw new AppError(404, 'Offer not found');
    }

    // Por ahora, usar datos mock para postulantes
    // TODO: Obtener postulantes reales desde el servicio de usuarios
    const mockPostulantes: Postulante[] = [
        {
            idPostulante: 'post_001',
            nombreCompleto: 'Juan Pérez',
            email: 'juan@email.com',
            ciudad: oferta.ciudad,
            modalidad_preferida: oferta.modalidad,
            habilidades_tecnicas: ['JavaScript', 'React', 'Node.js'],
            competencias: ['Trabajo en equipo', 'Comunicación'],
            experiencia: [{
                empresa: 'Tech Corp',
                cargo: oferta.titulo,
                fechaInicio: '2020-01-01',
                descripcion_responsabilidades: 'Desarrollo de aplicaciones web'
            }],
            formacion: [{
                institucion: 'Universidad',
                titulo_carrera: 'Ingeniería de Software',
                fechaInicio: '2015-01-01',
                estado: 'COMPLETADO'
            }]
        },
        {
            idPostulante: 'post_002',
            nombreCompleto: 'María García',
            email: 'maria@email.com',
            ciudad: 'Otra Ciudad',
            modalidad_preferida: 'Remoto',
            habilidades_tecnicas: ['Python', 'Django'],
            competencias: ['Liderazgo'],
            experiencia: [],
            formacion: [{
                institucion: 'Instituto',
                titulo_carrera: 'Técnico',
                fechaInicio: '2018-01-01',
                estado: 'COMPLETADO'
            }]
        }
    ];

    const rankedCandidates = matchingService.rankCandidates(mockPostulantes, oferta);

    return ApiResponse.success(res, {
        oferta: {
            idOferta: oferta.idOferta,
            titulo: oferta.titulo,
            empresa: oferta.empresa
        },
        candidatos: rankedCandidates.map(r => ({
            postulante: {
                id: r.postulante.idPostulante,
                nombre: r.postulante.nombreCompleto,
                email: r.postulante.email
            },
            score: r.score,
            detalles: r.detalles
        }))
    });
});

/**
 * POST /matching/apply
 * Aplicar a una oferta
 */
export const applyToOffer = asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.user) {
        throw new AppError(401, 'Unauthorized');
    }

    if (req.user.tipoUsuario !== 'POSTULANTE') {
        throw new AppError(403, 'Only candidates can apply to offers');
    }

    const { idOferta } = req.body;

    if (!idOferta) {
        throw new AppError(400, 'idOferta is required');
    }

    // Verificar si ya aplicó
    const alreadyApplied = await aplicacionRepository.exists(req.user.uid, idOferta);
    if (alreadyApplied) {
        throw new AppError(409, 'Already applied to this offer');
    }

    const aplicacion: Aplicacion = {
        idAplicacion: `app_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        idPostulante: req.user.uid,
        idOferta,
        fechaAplicacion: new Date(),
        estado: 'PENDIENTE'
    };

    await aplicacionRepository.save(aplicacion);

    return ApiResponse.created(res, aplicacion, 'Application submitted successfully');
});

/**
 * GET /matching/applications
 * Listar aplicaciones del usuario autenticado
 */
export const getMyApplications = asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.user) {
        throw new AppError(401, 'Unauthorized');
    }

    const aplicaciones = await aplicacionRepository.findByPostulante(req.user.uid);

    return ApiResponse.success(res, aplicaciones);
});

/**
 * GET /matching/oferta/:idOferta/applications
 * Listar aplicaciones para una oferta (solo reclutadores)
 */
export const getOfferApplications = asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.user || req.user.tipoUsuario !== 'RECLUTADOR') {
        throw new AppError(403, 'Only recruiters can view offer applications');
    }

    const { idOferta } = req.params;
    const aplicaciones = await aplicacionRepository.findByOferta(idOferta);

    return ApiResponse.success(res, aplicaciones);
});
