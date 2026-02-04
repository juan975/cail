
import { Request, Response } from 'express';
import { FirestoreOfferRepository } from '../repositories/FirestoreOfferRepository';
import { ApiResponse } from '../../../../shared/infrastructure/utils/response.util';
import { asyncHandler } from '../../../../shared/infrastructure/middleware/error.middleware';

export class OffersController {
    private offerRepository = new FirestoreOfferRepository();

    public getOffers = asyncHandler(async (req: Request, res: Response) => {
        const offers = await this.offerRepository.findAll();
        return ApiResponse.success(res, offers);
    });

    public createOffer = asyncHandler(async (req: Request, res: Response) => {
        return ApiResponse.success(res, { ...req.body }, 'Create disabled in this cleanup phase');
    });

    public getOfferById = asyncHandler(async (req: Request, res: Response) => {
        const { id } = req.params;
        const offer = await this.offerRepository.findById(id);
        if (!offer) {
            return res.status(404).json({ message: 'Offer not found' });
        }
        return ApiResponse.success(res, offer);
    });
}
