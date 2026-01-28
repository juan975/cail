"""
Tests for preprocessing pipeline
"""
import unittest
import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from preprocessing.pipeline import PreprocessingPipeline
from preprocessing.text_cleaner import TextCleaner
from preprocessing.normalizer import TextNormalizer
from preprocessing.skill_mapper import SkillMapper


class TestTextCleaner(unittest.TestCase):
    def setUp(self):
        self.cleaner = TextCleaner()
    
    def test_clean_html(self):
        text = "<p>Hello <strong>World</strong></p>"
        result = self.cleaner.clean(text)
        self.assertNotIn("<", result)
        self.assertIn("Hello", result)
        self.assertIn("World", result)
    
    def test_clean_url(self):
        text = "Visit https://example.com for more info"
        result = self.cleaner.clean(text)
        self.assertNotIn("https://", result)
    
    def test_clean_email(self):
        text = "Contact us at test@example.com"
        result = self.cleaner.clean(text)
        self.assertNotIn("@", result)
    
    def test_empty_input(self):
        self.assertEqual(self.cleaner.clean(None), '')
        self.assertEqual(self.cleaner.clean(''), '')


class TestTextNormalizer(unittest.TestCase):
    def setUp(self):
        self.normalizer = TextNormalizer()
    
    def test_lowercase(self):
        text = "HELLO World"
        result = self.normalizer.normalize(text)
        self.assertEqual(result, "hello world")
    
    def test_trim_spaces(self):
        text = "  hello   world  "
        result = self.normalizer.normalize(text)
        self.assertEqual(result, "hello world")


class TestSkillMapper(unittest.TestCase):
    def setUp(self):
        self.mapper = SkillMapper()
    
    def test_map_alias(self):
        self.assertEqual(self.mapper.map_skill("JS"), "javascript")
        self.assertEqual(self.mapper.map_skill("Node.js"), "nodejs")
        self.assertEqual(self.mapper.map_skill("React.js"), "react")
    
    def test_add_context(self):
        skills = ["javascript", "react"]
        result = self.mapper.add_context(skills)
        self.assertEqual(len(result), 2)
        self.assertIn("programacion", result[0])
        self.assertIn("frontend", result[1])


class TestPreprocessingPipeline(unittest.TestCase):
    def setUp(self):
        self.pipeline = PreprocessingPipeline()
    
    def test_process_candidate(self):
        data = {
            "habilidadesTecnicas": ["React", "Node.js"],
            "softSkills": ["Trabajo en equipo"],
            "resumenProfesional": "Desarrollador con 5 años de experiencia"
        }
        result = self.pipeline.process_candidate(data)
        
        self.assertIn("processedText", result)
        self.assertIn("skillsNormalized", result)
        self.assertIn("react", result["skillsNormalized"])
        self.assertIn("nodejs", result["skillsNormalized"])
    
    def test_process_offer(self):
        data = {
            "titulo": "Desarrollador Full Stack",
            "descripcion": "Buscamos desarrollador con experiencia",
            "habilidades_obligatorias": ["JavaScript", "Python"],
            "competencias_requeridas": ["Comunicación"]
        }
        result = self.pipeline.process_offer(data)
        
        self.assertIn("processedText", result)
        self.assertIn("skillsObligatorias", result)


if __name__ == '__main__':
    unittest.main()
