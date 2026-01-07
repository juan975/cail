import { Request, Response } from 'express';
import { MatchingService } from '../../services/matching.service';
import { MOCK_POSTULANTES, MOCK_OFERTAS } from '../mockData';

export class MatchingController {
    private matchingService: MatchingService;

    constructor() {
        this.matchingService = new MatchingService();
    }

    // GET /matching/oferta/:idOferta
    public getCandidatesForOffer = async (req: Request, res: Response) => {
        try {
            const { idOferta } = req.params;
            
            // 1. Buscar la oferta (Simulación de DB)
            const oferta = MOCK_OFERTAS.find(o => o.id_oferta === Number(idOferta));
            
            if (!oferta) {
                return res.status(404).json({ message: 'Oferta no encontrada' });
            }

            // 2. Traer todos los candidatos (En prod, esto sería una query filtrada)
            const postulantes = MOCK_POSTULANTES;

            // 3. Ejecutar algoritmo de matching
            const resultados = postulantes.map(p => 
                this.matchingService.calculateMatch(p, oferta)
            );

            // 4. Ordenar por mejor puntuación (Descendente)
            resultados.sort((a, b) => b.score - a.score);

            // 5. Responder
            return res.status(200).json({
                oferta: { id: oferta.id_oferta, titulo: oferta.titulo },
                total_candidatos: resultados.length,
                matches: resultados
            });

        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: 'Error interno del servidor' });
        }
    }
}