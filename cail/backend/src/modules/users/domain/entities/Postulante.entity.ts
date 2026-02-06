import { UserId } from '../../../../shared/domain/value-objects/UserId';

export interface PostulanteProps {
    idPostulante: UserId;
    cedula: string;
    fechaNacimiento: Date;
    direccion: string;
    ciudad: string;
    pushToken?: string;
}

export class Postulante {
    private props: PostulanteProps;

    constructor(props: PostulanteProps) {
        this.props = props;
    }

    get idPostulante(): UserId {
        return this.props.idPostulante;
    }

    get cedula(): string {
        return this.props.cedula;
    }

    get fechaNacimiento(): Date {
        return this.props.fechaNacimiento;
    }

    get direccion(): string {
        return this.props.direccion;
    }

    get ciudad(): string {
        return this.props.ciudad;
    }

    get pushToken(): string | undefined {
        return this.props.pushToken;
    }

    toJSON() {
        return {
            idPostulante: this.idPostulante.getValue(),
            cedula: this.cedula,
            fechaNacimiento: this.fechaNacimiento,
            direccion: this.direccion,
            ciudad: this.ciudad,
            pushToken: this.props.pushToken,
        };
    }
}
