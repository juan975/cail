// src/modules/matching/services/matching.service.ts
import { Postulante, Oferta, MatchResult } from '../domain/types';

export class MatchingService {

    // Normaliza texto para comparaciones (minusculas, sin tildes)
    private normalize(text: string): string {
        return text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    }

    public calculateMatch(postulante: Postulante, oferta: Oferta): MatchResult {
        let scoreHabilidades = 0; // Max 40
        let scoreExperiencia = 0; // Max 30
        let scoreLogistica = 0;   // Max 20
        let scoreFormacion = 0;   // Max 10

        // 1. HABILIDADES Y COMPETENCIAS (40 pts)
        
        // A. Habilidades Técnicas vs Descripción (20 pts)
        // Buscamos si las skills del usuario aparecen en la descripción de la oferta
        const descNormalizada = this.normalize(oferta.descripcion);
        let skillsFound = 0;
        if (postulante.habilidades_tecnicas.length > 0) {
            postulante.habilidades_tecnicas.forEach(skill => {
                if (descNormalizada.includes(this.normalize(skill))) {
                    skillsFound++;
                }
            });
            // Si encuentra al menos el 50% de sus skills en la oferta, damos puntos proporcionales
            const ratio = skillsFound / Math.max(1, postulante.habilidades_tecnicas.length); 
            scoreHabilidades += Math.min(20, ratio * 20 + (skillsFound * 2)); // Formula simple de ajuste
        }

        // B. Habilidades Blandas vs Competencias Req (10 pts)
        let softSkillsMatch = 0;
        oferta.competencias_requeridas.forEach(req => {
            if (postulante.competencias.some(c => this.normalize(c) === this.normalize(req))) {
                softSkillsMatch++;
            }
        });
        if (oferta.competencias_requeridas.length > 0) {
            scoreHabilidades += (softSkillsMatch / oferta.competencias_requeridas.length) * 10;
        }

        // C. Competencias vs Descripción (10 pts)
        // Similar al punto A pero con competencias blandas en el texto
        let compInDesc = 0;
        postulante.competencias.forEach(comp => {
            if (descNormalizada.includes(this.normalize(comp))) compInDesc++;
        });
        if (compInDesc > 0) scoreHabilidades += 10; // Bono si aparecen


        // 2. EXPERIENCIA (30 pts)

        // A. Título Puesto vs Experiencia Previa (15 pts)
        const tituloOferta = this.normalize(oferta.titulo);
        const tieneExperienciaSimilar = postulante.experiencia.some(exp => 
            tituloOferta.includes(this.normalize(exp.cargo)) || 
            this.normalize(exp.cargo).includes(tituloOferta)
        );
        if (tieneExperienciaSimilar) scoreExperiencia += 15;

        // B. Responsabilidades vs Experiencia Requerida (15 pts)
        // Búsqueda simple de palabras clave
        const expReq = this.normalize(oferta.experiencia_requerida);
        const keywordsMatch = postulante.experiencia.some(exp => {
            const resp = this.normalize(exp.descripcion_responsabilidades);
            // Si el texto de responsabilidades comparte palabras clave significativas (simulado)
            return resp.split(" ").some(word => word.length > 4 && expReq.includes(word));
        });
        if (keywordsMatch) scoreExperiencia += 15;


        // 3. LOGÍSTICA (20 pts)
        
        // A. Dirección (10 pts)
        if (this.normalize(postulante.ciudad) === this.normalize(oferta.ciudad)) {
            scoreLogistica += 10;
        }

        // B. Modalidad (10 pts)
        if (this.normalize(postulante.modalidad_preferida) === this.normalize(oferta.modalidad)) {
            scoreLogistica += 10;
        }


        // 4. FORMACIÓN (10 pts)
        const formacionReq = this.normalize(oferta.formacion_requerida);
        const tieneTitulo = postulante.formacion.some(f => 
            this.normalize(f.titulo_carrera).includes(formacionReq) || 
            formacionReq.includes(this.normalize(f.titulo_carrera))
        );
        if (tieneTitulo) scoreFormacion += 10;


        // TOTAL
        const totalScore = Math.min(100, scoreHabilidades + scoreExperiencia + scoreLogistica + scoreFormacion);

        return {
            postulante,
            score: Math.round(totalScore),
            detalles: {
                habilidades: Math.round(scoreHabilidades),
                experiencia: Math.round(scoreExperiencia),
                logistica: Math.round(scoreLogistica),
                formacion: Math.round(scoreFormacion)
            }
        };
    }
}