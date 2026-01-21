import { getFirestore } from '../../../config/firebase.config';
import { IAccountRepository } from '../../domain/repositories/IAccountRepository';
import { Account, TipoUsuario } from '../../domain/entities/Account.entity';
import { Email } from '../../../shared/domain/value-objects/Email';
import { UserId } from '../../../shared/domain/value-objects/UserId';

/**
 * Implementación del repositorio de cuentas usando Firestore
 * Colección: usuarios (Esquema Usuarios según el diagrama)
 */
export class FirestoreAccountRepository implements IAccountRepository {
    private getCollection() {
        return getFirestore().collection('usuarios');
    }

    async save(account: Account): Promise<Account> {
        const data = {
            idCuenta: account.idCuenta.getValue(),
            email: account.email.getValue(),
            passwordHash: account.passwordHash,
            nombreCompleto: account.nombreCompleto,
            telefono: account.telefono || null,
            tipoUsuario: account.tipoUsuario,
            fechaRegistro: account.fechaRegistro,
            needsPasswordChange: account.needsPasswordChange || false,
            candidateProfile: account.candidateProfile || null,
            employerProfile: account.employerProfile || null,
            // Metadata
            updatedAt: new Date(),
        };

        await this.getCollection().doc(account.idCuenta.getValue()).set(data, { merge: true });
        return account;
    }

    async findByEmail(email: Email): Promise<Account | null> {
        const snapshot = await this.getCollection()
            .where('email', '==', email.getValue())
            .limit(1)
            .get();

        if (snapshot.empty) {
            return null;
        }

        const doc = snapshot.docs[0];
        return this.mapToEntity(doc.data());
    }

    async findById(id: UserId): Promise<Account | null> {
        const doc = await this.getCollection().doc(id.getValue()).get();

        if (!doc.exists) {
            return null;
        }

        return this.mapToEntity(doc.data()!);
    }

    async exists(email: Email): Promise<boolean> {
        const account = await this.findByEmail(email);
        return account !== null;
    }

    /**
     * Busca una cuenta por su token de verificación de email
     */
    async findByVerificationToken(token: string): Promise<Account | null> {
        const snapshot = await this.getCollection()
            .where('employerProfile.emailVerificationToken', '==', token)
            .limit(1)
            .get();

        if (snapshot.empty) {
            return null;
        }

        const doc = snapshot.docs[0];
        return this.mapToEntity(doc.data());
    }

    /**
     * Marca el email de un usuario como verificado
     */
    async markEmailAsVerified(userId: string): Promise<void> {
        await this.getCollection().doc(userId).update({
            'employerProfile.emailVerified': true,
            'employerProfile.emailVerificationToken': null, // Limpiar token usado
            'updatedAt': new Date(),
        });
    }

    /**
     * Mapea datos de Firestore a la entidad Account
     */
    private mapToEntity(data: any): Account {
        return new Account({
            idCuenta: new UserId(data.idCuenta),
            email: new Email(data.email),
            passwordHash: data.passwordHash,
            nombreCompleto: data.nombreCompleto,
            telefono: data.telefono,
            tipoUsuario: data.tipoUsuario as TipoUsuario,
            fechaRegistro: data.fechaRegistro?.toDate?.() || new Date(data.fechaRegistro),
            needsPasswordChange: data.needsPasswordChange,
            candidateProfile: data.candidateProfile || undefined,
            employerProfile: data.employerProfile || undefined,
        });
    }
}
