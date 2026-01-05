import { Email } from '../../../../shared/domain/value-objects/Email';
import { UserId } from '../../../../shared/domain/value-objects/UserId';

export enum TipoUsuario {
    POSTULANTE = 'POSTULANTE',
    RECLUTADOR = 'RECLUTADOR',
    ADMINISTRADOR = 'ADMINISTRADOR',
}

export interface AccountProps {
    idCuenta: UserId;
    email: Email;
    passwordHash: string;
    nombreCompleto: string;
    telefono?: string;
    tipoUsuario: TipoUsuario;
    fechaRegistro: Date;
}

export class Account {
    private props: AccountProps;

    constructor(props: AccountProps) {
        this.props = props;
    }

    get idCuenta(): UserId {
        return this.props.idCuenta;
    }

    get email(): Email {
        return this.props.email;
    }

    get passwordHash(): string {
        return this.props.passwordHash;
    }

    get nombreCompleto(): string {
        return this.props.nombreCompleto;
    }

    get telefono(): string | undefined {
        return this.props.telefono;
    }

    get tipoUsuario(): TipoUsuario {
        return this.props.tipoUsuario;
    }

    get fechaRegistro(): Date {
        return this.props.fechaRegistro;
    }

    toJSON() {
        return {
            idCuenta: this.idCuenta.getValue(),
            email: this.email.getValue(),
            nombreCompleto: this.nombreCompleto,
            telefono: this.telefono,
            tipoUsuario: this.tipoUsuario,
            fechaRegistro: this.fechaRegistro,
        };
    }
}
