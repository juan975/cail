import { Oferta } from '../entities/Oferta.entity';

/**
 * Interfaz del repositorio de ofertas
 */
export interface IOfertaRepository {
    save(oferta: Oferta): Promise<Oferta>;
    findById(id: string): Promise<Oferta | null>;
    findAll(filters?: OfertaFilters): Promise<Oferta[]>;
    findByReclutador(idReclutador: string): Promise<Oferta[]>;
    delete(id: string): Promise<void>;
}

export interface OfertaFilters {
    estado?: string;
    ciudad?: string;
    modalidad?: string;
    limit?: number;
}
