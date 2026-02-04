"""
Text cleaner module - removes HTML, special characters, and unwanted content.
"""
import re
from typing import Optional

try:
    from bs4 import BeautifulSoup
    HAS_BS4 = True
except ImportError:
    HAS_BS4 = False


class TextCleaner:
    """
    Limpia texto de HTML, caracteres especiales y contenido no deseado.
    """
    
    def __init__(self):
        # Patrones para limpiar
        self.html_pattern = re.compile(r'<[^>]+>')
        self.url_pattern = re.compile(r'https?://\S+|www\.\S+')
        self.email_pattern = re.compile(r'\S+@\S+\.\S+')
        self.multiple_spaces = re.compile(r'\s+')
        self.special_chars = re.compile(r'[^\w\s\-\.\,\áéíóúñüÁÉÍÓÚÑÜ]')
    
    def clean(self, text: Optional[str]) -> str:
        """
        Limpia el texto de HTML, URLs, emails y caracteres especiales.
        
        Args:
            text: Texto a limpiar
            
        Returns:
            Texto limpio
        """
        if not text:
            return ''
        
        text = str(text)
        
        # Remover HTML con BeautifulSoup si está disponible
        if HAS_BS4 and ('<' in text or '&' in text):
            soup = BeautifulSoup(text, 'html.parser')
            text = soup.get_text(separator=' ')
        else:
            # Fallback: usar regex
            text = self.html_pattern.sub(' ', text)
        
        # Remover URLs
        text = self.url_pattern.sub('', text)
        
        # Remover emails
        text = self.email_pattern.sub('', text)
        
        # Remover caracteres especiales (mantener acentos españoles)
        text = self.special_chars.sub(' ', text)
        
        # Normalizar espacios
        text = self.multiple_spaces.sub(' ', text)
        
        # Trim
        text = text.strip()
        
        return text
    
    def remove_stopwords(self, text: str, stopwords: set) -> str:
        """
        Remueve stopwords del texto.
        
        Args:
            text: Texto a procesar
            stopwords: Set de palabras a remover
            
        Returns:
            Texto sin stopwords
        """
        words = text.split()
        filtered = [w for w in words if w.lower() not in stopwords]
        return ' '.join(filtered)
