"""
Skill mapper module - maps skill aliases to canonical names and adds semantic context.
"""
from typing import Optional, List
from catalogs.skills import SKILL_ALIASES, SKILL_CONTEXT


class SkillMapper:
    """
    Mapea skills a nombres canónicos y agrega contexto semántico.
    """
    
    def __init__(self):
        # Crear índice invertido para búsqueda rápida
        self.alias_map = {k.lower(): v.lower() for k, v in SKILL_ALIASES.items()}
        self.context_map = {k.lower(): v for k, v in SKILL_CONTEXT.items()}
    
    def map_skill(self, skill: Optional[str]) -> Optional[str]:
        """
        Mapea un skill a su nombre canónico.
        
        Args:
            skill: Nombre del skill (puede ser alias)
            
        Returns:
            Nombre canónico del skill, o el original si no hay mapeo
        """
        if not skill:
            return None
        
        skill_lower = skill.lower().strip()
        
        if not skill_lower:
            return None
        
        # Buscar en aliases
        if skill_lower in self.alias_map:
            return self.alias_map[skill_lower]
        
        # Si no hay alias, devolver el original normalizado
        return skill_lower
    
    def add_context(self, skills: List[str]) -> List[str]:
        """
        Agrega contexto semántico a una lista de skills.
        
        Args:
            skills: Lista de skills normalizados
            
        Returns:
            Lista de skills con contexto agregado
        """
        result = []
        
        for skill in skills:
            skill_lower = skill.lower() if skill else ''
            
            # Buscar contexto
            if skill_lower in self.context_map:
                # Agregar skill + contexto
                context = self.context_map[skill_lower]
                result.append(f"{skill_lower} {context}")
            else:
                # Sin contexto, solo agregar el skill
                result.append(skill_lower)
        
        return result
    
    def get_related_skills(self, skill: str) -> List[str]:
        """
        Obtiene skills relacionados.
        
        Args:
            skill: Skill base
            
        Returns:
            Lista de skills relacionados
        """
        # Por ahora devuelve lista vacía
        # Se puede expandir con un grafo de skills relacionados
        return []
