"""
Skills catalog - Minimal alias mappings (domain-agnostic).
spaCy handles most NLP processing, this is just for common abbreviations.
"""

# Mapeo de aliases comunes a nombres canónicos
# Solo abreviaciones universales, NO específico a ningún sector
SKILL_ALIASES = {
    # Abreviaciones generales de educación/títulos
    "ing.": "ingeniero",
    "lic.": "licenciado",
    "dr.": "doctor",
    "dra.": "doctora",
    "msc.": "master",
    "phd.": "doctorado",
    "bach.": "bachiller",
    
    # Idiomas
    "esp.": "español",
    "eng.": "inglés",
    "ing": "inglés",  # Común en CVs
    
    # Niveles
    "jr.": "junior",
    "sr.": "senior",
    "mid": "intermedio",
    
    # Tech mínimo (muy común)
    "js": "javascript",
    "ts": "typescript",
    "py": "python",
    "sql": "sql",
    "db": "base de datos",
    
    # Soft skills abreviados
    "colab.": "colaboración",
    "comunic.": "comunicación",
}

# Contexto semántico mínimo - solo para words muy comunes
# spaCy ya maneja la semántica general
SKILL_CONTEXT = {
    # Dejamos esto vacío - spaCy extrae semántica automáticamente
}
