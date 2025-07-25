"""
Módulo de Orden de Servicio Técnico (ordenST)

Este módulo gestiona todo el ciclo de vida de las órdenes de servicio técnico,
desde la creación del formulario hasta la visualización final con firma digital,
fotos y funcionalidades de exportación.

Componentes principales:
- ordenST.py: Rutas y lógica principal del backend
- plantillaOrdenST.html: Vista de la plantilla generada
- plantillaOrdenST.css: Estilos específicos
- plantillaOrdenST.js: Funcionalidad JavaScript

Funcionalidades:
- Creación de órdenes de servicio técnico
- Captura de firma digital
- Manejo de fotos del equipo
- Generación de plantilla completa
- Exportación a PDF
- Subida a servicios en la nube

Autor: Equipo de Desarrollo
Fecha: 2024
"""

from .ordenST import ordenST_bp

__all__ = ['ordenST_bp'] 