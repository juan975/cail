import { Account } from '../entities/Account.entity';
import { Email } from '../../../shared/domain/value-objects/Email';
import { UserId } from '../../../shared/domain/value-objects/UserId';

/**
 * Interfaz del repositorio de cuentas
 * Define el contrato para la persistencia de cuentas
 */
export interface IAccountRepository {
    /**
     * Guarda o actualiza una cuenta
     */
    save(account: Account): Promise<Account>;

    /**
     * Busca una cuenta por email
     */
    findByEmail(email: Email): Promise<Account | null>;

    /**
     * Busca una cuenta por ID
     */
    findById(id: UserId): Promise<Account | null>;

    /**
     * Verifica si existe una cuenta con el email dado
     */
    exists(email: Email): Promise<boolean>;
}
