"""
Text normalizer module - handles case, accents, and whitespace normalization.
"""
import re
from typing import Optional

try:
    from unidecode import unidecode
    HAS_UNIDECODE = True
except ImportError:
    HAS_UNIDECODE = False


class TextNormalizer:
    """
    Normaliza texto: minúsculas, espacios, y opcionalmente acentos.
    """
    
    def __init__(self, remove_accents: bool = False):
        """
        Args:
            remove_accents: Si True, convierte caracteres acentuados a ASCII
        """
        self.remove_accents = remove_accents
        self.multiple_spaces = re.compile(r'\s+')
    
    def normalize(self, text: Optional[str]) -> str:
        """
        Normaliza el texto.
        
        Args:
            text: Texto a normalizar
            
        Returns:
            Texto normalizado
        """
        if not text:
            return ''
        
        text = str(text)
        
        # Convertir a minúsculas
        text = text.lower()
        
        # Remover acentos si está configurado
        if self.remove_accents and HAS_UNIDECODE:
            text = unidecode(text)
        
        # Normalizar espacios
        text = self.multiple_spaces.sub(' ', text)
        
        # Trim
        text = text.strip()
        
        return text
    
    def expand_abbreviations(self, text: str) -> str:
        """
        Expande abreviaciones comunes.
        
        Args:
            text: Texto con posibles abreviaciones
            
        Returns:
            Texto con abreviaciones expandidas
        """
        abbreviations = {
            'ing.': 'ingeniero',
            'lic.': 'licenciado',
            'dr.': 'doctor',
            'sr.': 'señor',
            'sra.': 'señora',
            'exp.': 'experiencia',
            'req.': 'requerido',
            'min.': 'mínimo',
            'max.': 'máximo',
            'aprox.': 'aproximadamente',
        }
        
        for abbr, expanded in abbreviations.items():
            text = text.replace(abbr, expanded)
        
        return text
