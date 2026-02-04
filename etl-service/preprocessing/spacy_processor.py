"""
spaCy-based NLP processor for Spanish text.
Provides lemmatization, entity extraction, and semantic processing.
"""
import os
from typing import List, Optional, Tuple, Dict, Any

# Lazy loading of spaCy
_nlp = None

def get_nlp():
    """Lazy load spaCy model to reduce cold start time."""
    global _nlp
    if _nlp is None:
        import spacy
        try:
            _nlp = spacy.load("es_core_news_sm")
        except OSError:
            # Fallback: download if not available
            from spacy.cli import download
            download("es_core_news_sm")
            _nlp = spacy.load("es_core_news_sm")
    return _nlp


class SpacyProcessor:
    """
    Procesador NLP usando spaCy para español.
    Provee lematización, extracción de entidades y análisis semántico.
    """
    
    def __init__(self):
        self._nlp = None
    
    @property
    def nlp(self):
        """Lazy property for spaCy model."""
        if self._nlp is None:
            self._nlp = get_nlp()
        return self._nlp
    
    def process(self, text: str) -> Dict[str, Any]:
        """
        Procesa texto con spaCy y retorna análisis completo.
        
        Args:
            text: Texto a procesar
            
        Returns:
            Diccionario con tokens, lemas, entidades y análisis
        """
        if not text or not text.strip():
            return {
                'original': text,
                'lemmatized': '',
                'entities': [],
                'nouns': [],
                'verbs': [],
                'key_phrases': []
            }
        
        doc = self.nlp(text)
        
        return {
            'original': text,
            'lemmatized': self._lemmatize(doc),
            'entities': self._extract_entities(doc),
            'nouns': self._extract_nouns(doc),
            'verbs': self._extract_verbs(doc),
            'key_phrases': self._extract_key_phrases(doc)
        }
    
    def lemmatize(self, text: str) -> str:
        """
        Lematiza el texto (reduce palabras a su forma base).
        Ej: "programando aplicaciones" → "programar aplicación"
        
        Args:
            text: Texto a lematizar
            
        Returns:
            Texto lematizado
        """
        if not text or not text.strip():
            return ''
        
        doc = self.nlp(text)
        return self._lemmatize(doc)
    
    def _lemmatize(self, doc) -> str:
        """Lematiza un documento spaCy."""
        lemmas = []
        for token in doc:
            # Ignorar stopwords, puntuación y espacios
            if not token.is_stop and not token.is_punct and not token.is_space:
                lemmas.append(token.lemma_.lower())
        return ' '.join(lemmas)
    
    def extract_entities(self, text: str) -> List[Dict[str, str]]:
        """
        Extrae entidades nombradas del texto.
        Ej: "Trabajar en Microsoft como ingeniero" → [{"text": "Microsoft", "label": "ORG"}]
        
        Args:
            text: Texto a analizar
            
        Returns:
            Lista de entidades con texto y etiqueta
        """
        if not text:
            return []
        
        doc = self.nlp(text)
        return self._extract_entities(doc)
    
    def _extract_entities(self, doc) -> List[Dict[str, str]]:
        """Extrae entidades de un documento spaCy."""
        entities = []
        for ent in doc.ents:
            entities.append({
                'text': ent.text,
                'label': ent.label_,
                'description': self._get_entity_description(ent.label_)
            })
        return entities
    
    def _get_entity_description(self, label: str) -> str:
        """Retorna descripción de la etiqueta de entidad."""
        descriptions = {
            'PER': 'Persona',
            'ORG': 'Organización',
            'LOC': 'Lugar',
            'MISC': 'Misceláneo',
            'GPE': 'Lugar geopolítico',
            'DATE': 'Fecha',
            'TIME': 'Hora',
            'MONEY': 'Dinero',
            'PERCENT': 'Porcentaje',
        }
        return descriptions.get(label, label)
    
    def _extract_nouns(self, doc) -> List[str]:
        """Extrae sustantivos del documento."""
        nouns = []
        for token in doc:
            if token.pos_ == 'NOUN' and not token.is_stop:
                nouns.append(token.lemma_.lower())
        return list(set(nouns))
    
    def _extract_verbs(self, doc) -> List[str]:
        """Extrae verbos del documento."""
        verbs = []
        for token in doc:
            if token.pos_ == 'VERB' and not token.is_stop:
                verbs.append(token.lemma_.lower())
        return list(set(verbs))
    
    def _extract_key_phrases(self, doc) -> List[str]:
        """
        Extrae frases clave (noun chunks) del documento.
        """
        phrases = []
        for chunk in doc.noun_chunks:
            # Lematizar la frase
            lemmatized = ' '.join([t.lemma_.lower() for t in chunk if not t.is_stop])
            if lemmatized and len(lemmatized) > 2:
                phrases.append(lemmatized)
        return list(set(phrases))
    
    def get_pos_tags(self, text: str) -> List[Tuple[str, str]]:
        """
        Obtiene etiquetas POS (Part of Speech) para cada token.
        
        Args:
            text: Texto a analizar
            
        Returns:
            Lista de tuplas (token, etiqueta_pos)
        """
        if not text:
            return []
        
        doc = self.nlp(text)
        return [(token.text, token.pos_) for token in doc]
    
    def get_similarity(self, text1: str, text2: str) -> float:
        """
        Calcula similitud entre dos textos.
        Nota: Requiere modelo con word vectors (md o lg).
        
        Args:
            text1: Primer texto
            text2: Segundo texto
            
        Returns:
            Score de similitud [0, 1]
        """
        if not text1 or not text2:
            return 0.0
        
        doc1 = self.nlp(text1)
        doc2 = self.nlp(text2)
        
        return doc1.similarity(doc2)
