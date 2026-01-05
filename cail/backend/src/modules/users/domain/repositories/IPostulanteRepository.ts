import { Postulante } from '../entities/Postulante.entity';
import { UserId } from '../../../../shared/domain/value-objects/UserId';

export interface IPostulanteRepository {
    save(postulante: Postulante): Promise<Postulante>;
    findById(id: UserId): Promise<Postulante | null>;
    update(postulante: Postulante): Promise<Postulante>;
    delete(id: UserId): Promise<void>;
}
