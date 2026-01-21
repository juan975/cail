/**
 * Servicio de Catálogos para Web
 * 
 * Consume la colección `catalogs` de Firebase para obtener:
 * - Skills (técnicas HARD y blandas SOFT)
 * - Áreas funcionales
 * - Sectores industriales
 * - Niveles jerárquicos
 */

import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { app } from '../config/firebase.config';

export interface CatalogItem {
    id: string;
    name: string;
    type?: 'HARD' | 'SOFT'; // Solo para skills
}

export interface SystemConstants {
    applicationStatus: string[];
    companyValidationStatus: string[];
    jobStatus: string[];
}

class CatalogsService {
    private cache: Map<string, CatalogItem[]> = new Map();
    private systemConstantsCache: SystemConstants | null = null;
    private db = getFirestore(app);

    /**
     * Obtener habilidades (técnicas y/o blandas)
     * @param type 'HARD' para técnicas, 'SOFT' para blandas, undefined para todas
     */
    async getSkills(type?: 'HARD' | 'SOFT'): Promise<CatalogItem[]> {
        const items = await this.getCatalog('skills');
        return type ? items.filter(i => i.type === type) : items;
    }

    /**
     * Obtener habilidades técnicas (HARD skills)
     */
    async getTechnicalSkills(): Promise<CatalogItem[]> {
        return this.getSkills('HARD');
    }

    /**
     * Obtener habilidades blandas (SOFT skills)
     */
    async getSoftSkills(): Promise<CatalogItem[]> {
        return this.getSkills('SOFT');
    }

    /**
     * Obtener áreas funcionales
     */
    async getAreas(): Promise<CatalogItem[]> {
        return this.getCatalog('areas');
    }

    /**
     * Obtener sectores industriales
     */
    async getSectors(): Promise<CatalogItem[]> {
        return this.getCatalog('sectors');
    }

    /**
     * Obtener niveles jerárquicos
     */
    async getLevels(): Promise<CatalogItem[]> {
        return this.getCatalog('levels');
    }

    /**
     * Búsqueda fuzzy de habilidades
     * @param query Texto a buscar
     * @param type Tipo de skill opcional
     */
    async searchSkills(query: string, type?: 'HARD' | 'SOFT'): Promise<CatalogItem[]> {
        const skills = type ? await this.getSkills(type) : await this.getSkills();
        const q = query.toLowerCase().trim();

        if (!q) return skills.slice(0, 10); // Top 10 si no hay query

        return skills.filter(s =>
            s.name.toLowerCase().includes(q) ||
            s.id.toLowerCase().includes(q)
        );
    }

    /**
     * Obtener constantes del sistema
     */
    async getSystemConstants(): Promise<SystemConstants> {
        if (this.systemConstantsCache) return this.systemConstantsCache;

        const docRef = doc(this.db, 'catalogs', 'system_constants');
        const snap = await getDoc(docRef);

        const data = snap.data();
        this.systemConstantsCache = {
            applicationStatus: data?.applicationStatus || [],
            companyValidationStatus: data?.companyValidationStatus || [],
            jobStatus: data?.jobStatus || [],
        };

        return this.systemConstantsCache;
    }

    /**
     * Limpiar cache (útil para forzar recarga)
     */
    clearCache(): void {
        this.cache.clear();
        this.systemConstantsCache = null;
    }

    /**
     * Obtener catálogo por nombre
     */
    private async getCatalog(name: string): Promise<CatalogItem[]> {
        if (this.cache.has(name)) return this.cache.get(name)!;

        const docRef = doc(this.db, 'catalogs', name);
        const snap = await getDoc(docRef);
        const items: CatalogItem[] = snap.data()?.items || [];

        this.cache.set(name, items);
        return items;
    }
}

export const catalogsService = new CatalogsService();
