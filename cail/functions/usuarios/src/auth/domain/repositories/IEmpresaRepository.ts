// src/auth/domain/repositories/IEmpresaRepository.ts
// Interfaz para validación de empresas (RUC)

/**
 * Información de empresa validada
 */
export interface EmpresaValidada {
    ruc: string;
    razonSocial: string;
    estado: 'ACTIVA' | 'INACTIVA' | 'SUSPENDIDA' | 'VERIFICADA' | 'PENDIENTE' | 'RECHAZADA';
    direccion?: string;
    ciudad?: string;
    website?: string;
    descripcion?: string;
    emailContacto?: string;
    fechaValidacion?: Date;
}

/**
 * Contrato para repositorio de validación de empresas
 * Consulta la colección 'empresas' para verificar RUC y obtener datos
 */
export interface IEmpresaRepository {
    /**
     * Verifica si un RUC existe en la colección de empresas autorizadas
     * @param ruc RUC a verificar (13 dígitos)
     * @returns true si la empresa existe y está activa
     */
    existeEmpresaActiva(ruc: string): Promise<boolean>;

    /**
     * Obtiene información de la empresa por RUC
     * @param ruc RUC a buscar
     * @returns Datos de la empresa o null si no existe
     */
    getByRuc(ruc: string): Promise<EmpresaValidada | null>;

    /**
     * Obtiene todas las empresas validadas
     * @returns Lista de empresas
     */
    getAll(): Promise<EmpresaValidada[]>;
}
