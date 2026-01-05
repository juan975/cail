import { Account } from '../entities/Account.entity';
import { Email } from '../../../../shared/domain/value-objects/Email';
import { UserId } from '../../../../shared/domain/value-objects/UserId';

export interface IAccountRepository {
    save(account: Account): Promise<Account>;
    findByEmail(email: Email): Promise<Account | null>;
    findById(id: UserId): Promise<Account | null>;
    exists(email: Email): Promise<boolean>;
}
