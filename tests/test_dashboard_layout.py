"""Pruebas de regresión de la distribución del dashboard (HU41).

Comprueban las reglas CSS del layout. El aspecto final debe revisarse
también en navegador a distintos tamaños de pantalla.
"""
import re
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CSS = (ROOT / "static" / "style.css").read_text(encoding="utf-8")
HTML = (ROOT / "templates" / "index.html").read_text(encoding="utf-8")


class DashboardLayoutTests(unittest.TestCase):
    def test_sidebar_se_mantiene_fija_en_escritorio(self):
        self.assertRegex(CSS, r"@media\s*\(min-width:\s*1024px\)")
        self.assertRegex(CSS, r"\.app-body\s+\.navbar\s*\{\s*position:\s*fixed;")
        self.assertIn("--sidebar-width: 264px", CSS)

    def test_contenido_no_tiene_limite_de_1500px(self):
        desktop = CSS[CSS.index("/* Navegación lateral en escritorio."): ]
        self.assertIn("width: calc(100% - var(--sidebar-width))", desktop)
        self.assertIn("max-width: none;", desktop)
        self.assertNotRegex(desktop, r"max-width:\s*1500px")

    def test_cuadricula_de_cuatro_columnas_en_pantallas_grandes(self):
        self.assertRegex(CSS, r"@media\s*\(min-width:\s*1450px\)\s*\{\s*"
                              r"\.app-body\s+\.metrics-grid,\s*"
                              r"\.app-body\s+\.modules-grid\s*\{\s*"
                              r"grid-template-columns:\s*repeat\(4,\s*minmax\(0,\s*1fr\)\)")

    def test_cuadricula_de_dos_columnas_en_escritorio_medio(self):
        self.assertRegex(CSS, r"\.app-body\s+\.metrics-grid,\s*"
                              r"\.app-body\s+\.modules-grid\s*\{\s*"
                              r"grid-template-columns:\s*repeat\(2,\s*minmax\(0,\s*1fr\)\)")

    def test_cuadricula_de_una_columna_en_movil(self):
        self.assertRegex(CSS, r"@media\s*\(max-width:\s*767px\)")
        self.assertIn("grid-template-columns: minmax(0, 1fr);", CSS)

    def test_dashboard_contiene_las_cuadriculas_esperadas(self):
        self.assertIn('class="metrics-grid"', HTML)
        self.assertIn('class="modules-grid"', HTML)
        self.assertIn('class="main-content"', HTML)


if __name__ == "__main__":
    unittest.main()
