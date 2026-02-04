"""
Main preprocessing pipeline that orchestrates all preprocessing steps.
Uses spaCy for Spanish NLP processing.
"""
from typing import Dict, List, Any, Optional
from .text_cleaner import TextCleaner
from .normalizer import TextNormalizer
from .spacy_processor import SpacyProcessor


class PreprocessingPipeline:
    """
    Pipeline de preprocesamiento para texto de candidatos y ofertas.
    Usa spaCy para NLP en español (lematización, extracción de entidades).
    Ejecuta: Limpieza → Normalización → NLP (spaCy) → Texto optimizado
    """
    
    def __init__(self, use_spacy: bool = True):
        """
        Args:
            use_spacy: Si True, usa spaCy para NLP avanzado
        """
        self.cleaner = TextCleaner()
        self.normalizer = TextNormalizer()
        self.use_spacy = use_spacy
        self._spacy_processor = None
    
    @property
    def spacy_processor(self) -> SpacyProcessor:
        """Lazy loading de spaCy processor."""
        if self._spacy_processor is None:
            self._spacy_processor = SpacyProcessor()
        return self._spacy_processor
    
    def process_candidate(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Preprocesa datos de un candidato para vectorización.
        
        Args:
            data: Diccionario con campos del candidato
                - habilidadesTecnicas: List[str]
                - softSkills: List[str]  
                - resumenProfesional: str
                - competencias: List[str]
        
        Returns:
            Diccionario con texto procesado y metadatos
        """
        # Extraer campos
        habilidades_tecnicas = data.get('habilidadesTecnicas', []) or []
        soft_skills = data.get('softSkills', []) or []
        resumen = data.get('resumenProfesional', '') or ''
        competencias = data.get('competencias', []) or []
        
        # Procesar cada campo
        processed_skills = self._process_list(habilidades_tecnicas)
        processed_soft = self._process_list(soft_skills)
        processed_comps = self._process_list(competencias)
        processed_resumen = self._process_text(resumen)
        
        # Extraer entidades y frases clave del resumen
        entities = []
        key_phrases = []
        if self.use_spacy and resumen:
            analysis = self.spacy_processor.process(resumen)
            entities = analysis.get('entities', [])
            key_phrases = analysis.get('key_phrases', [])
        
        # Construir texto final para vectorización
        partes = []
        
        if processed_skills:
            partes.append(f"Habilidades técnicas: {', '.join(processed_skills)}")
        
        if processed_soft:
            partes.append(f"Habilidades blandas: {', '.join(processed_soft)}")
        
        if processed_comps:
            partes.append(f"Competencias: {', '.join(processed_comps)}")
        
        if processed_resumen:
            partes.append(f"Perfil: {processed_resumen}")
        
        if key_phrases:
            partes.append(f"Áreas: {', '.join(key_phrases[:10])}")  # Limitar a 10
        
        texto_final = '. '.join(partes) if partes else "Profesional en búsqueda de empleo"
        
        return {
            'processedText': texto_final,
            'skillsNormalized': processed_skills,
            'softSkillsNormalized': processed_soft,
            'competenciasNormalized': processed_comps,
            'entities': entities,
            'keyPhrases': key_phrases,
            'originalLength': len(str(data)),
            'processedLength': len(texto_final)
        }
    
    def process_offer(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Preprocesa datos de una oferta laboral para vectorización.
        
        Args:
            data: Diccionario con campos de la oferta
                - titulo: str
                - descripcion: str
                - habilidades_obligatorias: List[str/dict]
                - habilidades_deseables: List[str/dict]
                - competencias_requeridas: List[str]
        
        Returns:
            Diccionario con texto procesado y metadatos
        """
        # Extraer campos
        titulo = data.get('titulo', '') or ''
        descripcion = data.get('descripcion', '') or ''
        habilidades_obligatorias = data.get('habilidades_obligatorias', []) or []
        habilidades_deseables = data.get('habilidades_deseables', []) or []
        competencias = data.get('competencias_requeridas', []) or []
        
        # Procesar título y descripción
        titulo_proc = self._process_text(titulo)
        descripcion_proc = self._process_text(descripcion)
        
        # Procesar habilidades (pueden ser strings o dicts)
        hab_oblig_proc = self._process_skills_list(habilidades_obligatorias)
        hab_des_proc = self._process_skills_list(habilidades_deseables)
        comps_proc = self._process_list(competencias)
        
        # Extraer entidades y frases clave
        entities = []
        key_phrases = []
        if self.use_spacy and (titulo or descripcion):
            full_text = f"{titulo}. {descripcion}"
            analysis = self.spacy_processor.process(full_text)
            entities = analysis.get('entities', [])
            key_phrases = analysis.get('key_phrases', [])
        
        # Construir texto final
        partes = []
        
        if titulo_proc:
            partes.append(f"Puesto: {titulo_proc}")
        
        if descripcion_proc:
            # Usar versión lematizada si spaCy está activo
            if self.use_spacy and descripcion:
                desc_lemma = self.spacy_processor.lemmatize(descripcion)
                partes.append(f"Descripción: {desc_lemma[:500]}")
            else:
                partes.append(f"Descripción: {descripcion_proc[:500]}")
        
        todas_skills = list(set(hab_oblig_proc + hab_des_proc))
        if todas_skills:
            partes.append(f"Habilidades requeridas: {', '.join(todas_skills)}")
        
        if comps_proc:
            partes.append(f"Competencias: {', '.join(comps_proc)}")
        
        if key_phrases:
            partes.append(f"Áreas: {', '.join(key_phrases[:10])}")
        
        texto_final = '. '.join(partes) if partes else "Oferta de empleo"
        
        return {
            'processedText': texto_final,
            'skillsObligatorias': hab_oblig_proc,
            'skillsDeseables': hab_des_proc,
            'competenciasNormalized': comps_proc,
            'entities': entities,
            'keyPhrases': key_phrases,
            'originalLength': len(str(data)),
            'processedLength': len(texto_final)
        }
    
    def _process_text(self, text: str) -> str:
        """Limpia y normaliza un texto."""
        if not text:
            return ''
        cleaned = self.cleaner.clean(text)
        normalized = self.normalizer.normalize(cleaned)
        return normalized
    
    def _process_list(self, items: List[str]) -> List[str]:
        """Procesa una lista de strings."""
        result = []
        for item in items:
            processed = self._process_text(item)
            if processed:
                result.append(processed)
        return result
    
    def _process_skills_list(self, items: List) -> List[str]:
        """
        Procesa lista de skills que pueden ser strings o dicts.
        """
        result = []
        for item in items:
            # Extraer texto del skill
            if isinstance(item, str):
                skill_text = item
            elif isinstance(item, dict):
                skill_text = item.get('nombre', '') or item.get('name', '')
            else:
                continue
            
            processed = self._process_text(skill_text)
            if processed:
                result.append(processed)
        
        return result
