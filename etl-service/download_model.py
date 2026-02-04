# Script de post-instalación para Cloud Functions
# Descarga el modelo de spaCy para español

import subprocess
import sys

def download_spacy_model():
    """Descarga el modelo de spaCy si no está instalado."""
    try:
        import spacy
        spacy.load("es_core_news_sm")
        print("✅ Modelo es_core_news_sm ya está instalado")
    except:
        print("📥 Descargando modelo es_core_news_sm...")
        subprocess.check_call([
            sys.executable, "-m", "spacy", "download", "es_core_news_sm"
        ])
        print("✅ Modelo descargado correctamente")

if __name__ == "__main__":
    download_spacy_model()
