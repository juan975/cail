/**
 * Entidad Oferta Laboral
 * Pertenece al Esquema Ofertas de Firestore
 */
export interface OfertaProps {
    idOferta: string;
    titulo: string;
    descripcion: string;
    empresa: string;
    ciudad: string;
    modalidad: string;
    tipoContrato: string;
    salarioMin?: number;
    salarioMax?: number;
    experiencia_requerida: string;
    formacion_requerida: string;
    competencias_requeridas: string[];
    fechaPublicacion: Date;
    fechaCierre?: Date;
    estado: 'ACTIVA' | 'CERRADA' | 'PAUSADA';
    idReclutador: string;
}

export class Oferta {
    constructor(private props: OfertaProps) { }

    get idOferta(): string { return this.props.idOferta; }
    get titulo(): string { return this.props.titulo; }
    get descripcion(): string { return this.props.descripcion; }
    get empresa(): string { return this.props.empresa; }
    get ciudad(): string { return this.props.ciudad; }
    get modalidad(): string { return this.props.modalidad; }
    get tipoContrato(): string { return this.props.tipoContrato; }
    get salarioMin(): number | undefined { return this.props.salarioMin; }
    get salarioMax(): number | undefined { return this.props.salarioMax; }
    get experiencia_requerida(): string { return this.props.experiencia_requerida; }
    get formacion_requerida(): string { return this.props.formacion_requerida; }
    get competencias_requeridas(): string[] { return this.props.competencias_requeridas; }
    get fechaPublicacion(): Date { return this.props.fechaPublicacion; }
    get fechaCierre(): Date | undefined { return this.props.fechaCierre; }
    get estado(): string { return this.props.estado; }
    get idReclutador(): string { return this.props.idReclutador; }

    set estado(value: 'ACTIVA' | 'CERRADA' | 'PAUSADA') { this.props.estado = value; }

    toJSON() {
        return { ...this.props };
    }
}
