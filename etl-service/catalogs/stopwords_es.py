"""
Spanish stopwords for text preprocessing.
"""

STOPWORDS_ES = {
    # Artículos
    'el', 'la', 'los', 'las', 'un', 'una', 'unos', 'unas',
    
    # Preposiciones
    'a', 'ante', 'bajo', 'con', 'contra', 'de', 'desde', 'en', 'entre',
    'hacia', 'hasta', 'para', 'por', 'según', 'sin', 'sobre', 'tras',
    
    # Conjunciones
    'y', 'e', 'ni', 'o', 'u', 'pero', 'sino', 'aunque', 'que', 'si',
    'porque', 'como', 'cuando', 'donde', 'mientras', 'aunque',
    
    # Pronombres
    'yo', 'tú', 'él', 'ella', 'nosotros', 'vosotros', 'ellos', 'ellas',
    'me', 'te', 'se', 'nos', 'os', 'lo', 'le', 'les',
    'mi', 'tu', 'su', 'mis', 'tus', 'sus', 'nuestro', 'nuestra',
    'este', 'esta', 'estos', 'estas', 'ese', 'esa', 'esos', 'esas',
    'aquel', 'aquella', 'aquellos', 'aquellas',
    'esto', 'eso', 'aquello',
    'quien', 'quienes', 'cual', 'cuales',
    
    # Verbos auxiliares
    'ser', 'estar', 'haber', 'tener', 'poder', 'deber',
    'es', 'son', 'está', 'están', 'ha', 'han', 'he', 'has',
    'fue', 'fueron', 'era', 'eran', 'será', 'serán',
    'tiene', 'tienen', 'tenía', 'tenían',
    'puede', 'pueden', 'podía', 'podían',
    
    # Adverbios
    'no', 'sí', 'muy', 'más', 'menos', 'ya', 'aún', 'también',
    'siempre', 'nunca', 'ahora', 'antes', 'después', 'aquí', 'allí',
    'bien', 'mal', 'así', 'solo', 'tanto', 'tan',
    
    # Otros
    'del', 'al', 'qué', 'cómo', 'cuándo', 'dónde', 'cuánto',
    'todo', 'toda', 'todos', 'todas', 'algo', 'alguien', 'alguno',
    'ninguno', 'nada', 'nadie', 'cada', 'otro', 'otra', 'otros', 'otras',
    'mismo', 'misma', 'mismos', 'mismas',
    
    # Palabras comunes en ofertas laborales (opcional - para filtrar ruido)
    # 'empresa', 'trabajo', 'puesto', 'candidato', 'requisitos',
}
