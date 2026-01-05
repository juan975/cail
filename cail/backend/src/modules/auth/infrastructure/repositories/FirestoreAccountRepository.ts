import { db } from '../../../../shared/infrastructure/config/firebase.config';
import { IAccountRepository } from '../../domain/repositories/IAccountRepository';
import { Account, TipoUsuario } from '../../domain/entities/Account.entity';
import { Email } from '../../../../shared/domain/value-objects/Email';
import { UserId } from '../../../../shared/domain/value-objects/UserId';

export class FirestoreAccountRepository implements IAccountRepository {
    private collection = db.collection('cuentas');

    async save(account: Account): Promise<Account> {
        const data = {
            idCuenta: account.idCuenta.getValue(),
            email: account.email.getValue(),
            passwordHash: account.passwordHash,
            nombreCompleto: account.nombreCompleto,
            telefono: account.telefono || null,
            tipoUsuario: account.tipoUsuario,
            fechaRegistro: account.fechaRegistro,
        };

        await this.collection.doc(account.idCuenta.getValue()).set(data);
        return account;
    }

    async findByEmail(email: Email): Promise<Account | null> {
        const snapshot = await this.collection.where('email', '==', email.getValue()).get();

        if (snapshot.empty) {
            return null;
        }

        const doc = snapshot.docs[0];
        return this.mapToEntity(doc.data());
    }

    async findById(id: UserId): Promise<Account | null> {
        const doc = await this.collection.doc(id.getValue()).get();

        if (!doc.exists) {
            return null;
        }

        return this.mapToEntity(doc.data()!);
    }

    async exists(email: Email): Promise<boolean> {
        const account = await this.findByEmail(email);
        return account !== null;
    }

    private mapToEntity(data: any): Account {
        return new Account({
            idCuenta: new UserId(data.idCuenta),
            email: new Email(data.email),
            passwordHash: data.passwordHash,
            nombreCompleto: data.nombreCompleto,
            telefono: data.telefono,
            tipoUsuario: data.tipoUsuario as TipoUsuario,
            fechaRegistro: data.fechaRegistro.toDate(),
        });
    }
}
