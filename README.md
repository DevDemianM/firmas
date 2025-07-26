# 🔐 Módulo de Firmas Electrónicas

Sistema web completo para la gestión de firmas digitales y documentos electrónicos. Desarrollado con Flask, este módulo proporciona una solución integral para organizaciones que requieren trazabilidad, seguridad y automatización en la gestión documental.

![Python](https://img.shields.io/badge/Python-3.7+-blue.svg)
![Flask](https://img.shields.io/badge/Flask-2.0+-green.svg)
![License](https://img.shields.io/badge/License-MIT-yellow.svg)

## 📋 Tabla de Contenidos

- [Características](#-características)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [Instalación](#-instalación)
- [Uso](#-uso)
- [API y Rutas](#-api-y-rutas)
- [Tecnologías](#-tecnologías)
- [Contribuir](#-contribuir)
- [Licencia](#-licencia)

## ✨ Características

- **Dashboard Centralizado**: Interfaz intuitiva con acceso rápido a todas las funcionalidades
- **Gestión de Firmas Digitales**: Creación, validación y configuración de certificados
- **Plantillas Reutilizables**: Sistema de plantillas para documentos frecuentes
- **Carga Automática**: Procesamiento y validación automática de archivos
- **Búsquedas Avanzadas**: Filtros personalizados y búsqueda inteligente
- **Reportes y Estadísticas**: Métricas detalladas de uso y eficiencia
- **Configuración Flexible**: Parámetros de seguridad y preferencias personalizables
- **Diseño Responsive**: Compatible con desktop, tablet y móvil

## 📁 Estructura del Proyecto

```
firmas/
├── __init__.py                    # Configuración principal del blueprint
├── models/                        # Modelos de datos
│   ├── __init__.py
│   ├── archivos.py               # Modelo para archivos subidos
│   ├── carta_antifraude.py      # Modelo carta antifraude
│   ├── cliente.py                # Modelo de clientes
│   ├── consentimiento_informado.py
│   ├── contrato_comodato.py     # Modelo contrato comodato
│   ├── contrato_garantia.py     # Modelo contrato garantía
│   ├── contrato_mandato.py      # Modelo contrato mandato
│   ├── documentos.py             # Modelo general de documentos
│   ├── firma.py                  # Modelo de firmas digitales
│   ├── orden_st.py              # Modelo orden servicio técnico
│   └── recibo_entrega_producto.py
├── routes/                       # Rutas organizadas por funcionalidad
│   ├── busquedas/               # Búsquedas avanzadas
│   │   ├── __init__.py
│   │   └── busqueda.py
│   ├── cargas/                  # Sistema de cargas
│   │   ├── __init__.py
│   │   └── cargas.py
│   ├── firmas/                  # Gestión de firmas
│   │   ├── __init__.py
│   │   └── firmas.py
│   ├── ordenServicioTecnico/    # Órdenes de servicio técnico
│   │   ├── __init__.py
│   │   ├── ordenST.py
│   │   └── SUMMARY.md
│   └── plantillas/              # Gestión de plantillas
│       ├── __init__.py
│       ├── comodato.py
│       ├── mandato.py
│       ├── ordenST.py
│       └── plantillas.py
├── static/                       # Archivos estáticos
│   ├── css/                     # Hojas de estilo
│   │   ├── base_firmas.css
│   │   ├── formulario.css
│   │   ├── mandato.css
│   │   ├── pattern_lock.css
│   │   ├── plantilla_firmas.css
│   │   └── plantillaOrdenSt.css
│   ├── images/                  # Imágenes del sistema
│   │   └── logo.png
│   ├── img/                     # Recursos gráficos
│   │   └── logoMicelu.png
│   └── js/                      # Scripts JavaScript
│       ├── base_firmas.js
│       ├── comodato.js
│       ├── entregaproduct.js
│       ├── mandato.js
│       ├── ordenST.js
│       ├── plantilla_firmas.js
│       ├── plantillaOrdenST.js
│       ├── simple_pattern_lock.js
│       └── sweetalerts.js
├── templates/                    # Plantillas HTML
│   ├── base_firmas.html         # Template base
│   ├── comodato.html           # Plantilla comodato
│   ├── entregaproduct.html     # Plantilla entrega producto
│   ├── mandato.html            # Plantilla mandato
│   ├── ordenST.html            # Plantilla orden ST
│   ├── plantilla.html          # Plantilla general
│   └── plantillaOrdenST.html   # Plantilla orden ST
└── README.md                    # Este archivo
```

## 🚀 Instalación

### Requisitos Previos

- Python 3.7 o superior
- Flask
- Acceso de administrador

### Pasos de Instalación

1. **Clona el repositorio**
   ```bash
   git clone https://github.com/tu-usuario/firmas.git
   cd firmas
   ```

2. **Instala las dependencias**
   ```bash
   pip install -r requirements.txt
   ```

3. **Configura el módulo en tu aplicación Flask**
   ```python
   from firmas import firmas_bp
   app.register_blueprint(firmas_bp, url_prefix='/firmas')
   ```

4. **Configura las variables de entorno**
   ```bash
   export FLASK_APP=app.py
   export FLASK_ENV=development
   ```

5. **Ejecuta la aplicación**
   ```bash
   flask run
   ```

## 💻 Uso

### Acceso al Sistema

1. Inicia sesión como administrador
2. Navega a **Negocio > Firmas Electrónicas** en el menú principal
3. O accede directamente a `/firmas/dashboard`

### Funcionalidades Principales

| Funcionalidad | URL | Descripción |
|---------------|-----|-------------|
| Dashboard | `/firmas/` | Vista principal con acceso a todas las funciones |
| Gestión de Firmas | `/firmas/firmas` | Administración y validación de firmas digitales |
| Plantillas | `/firmas/plantillas` | Creación y gestión de plantillas de documentos |
| Cargas | `/firmas/cargas` | Subida y validación de archivos |
| Búsquedas | `/firmas/busquedas` | Búsqueda avanzada y filtros de documentos |
| Reportes | `/firmas/reportes` | Generación de reportes y métricas |
| Configuración | `/firmas/configuracion` | Parámetros y preferencias del sistema |

## 🔌 API y Rutas

### Rutas Principales

```python
# Dashboard principal
GET /firmas/
GET /firmas/dashboard

# Gestión de firmas
GET /firmas/firmas
POST /firmas/firmas/crear
PUT /firmas/firmas/<id>
DELETE /firmas/firmas/<id>

# Plantillas
GET /firmas/plantillas
POST /firmas/plantillas/crear
PUT /firmas/plantillas/<id>

# Cargas
GET /firmas/cargas
POST /firmas/cargas/subir

# Búsquedas
GET /firmas/busquedas
POST /firmas/busquedas/filtrar

# Reportes
GET /firmas/reportes
GET /firmas/reportes/descargar
```

### Modelos de Datos

El sistema incluye modelos para diferentes tipos de documentos:

- **Firma**: Gestión de firmas digitales
- **Cliente**: Información de clientes
- **Documentos**: Documentos generales
- **Contratos**: Varios tipos de contratos (comodato, garantía, mandato)
- **Órdenes**: Órdenes de servicio técnico
- **Archivos**: Gestión de archivos subidos

## 🛠️ Tecnologías

### Backend
- **Python 3.7+**: Lenguaje principal
- **Flask**: Framework web
- **Jinja2**: Motor de plantillas
- **SQLAlchemy**: ORM para base de datos

### Frontend
- **HTML5**: Estructura semántica
- **CSS3**: Grid, Flexbox, variables CSS
- **JavaScript (ES6+)**: Interactividad y validaciones
- **Font Awesome 6.0**: Iconografía

### Características Técnicas
- **Diseño Responsive**: Desktop, tablet, móvil
- **Autenticación por Roles**: Sistema de permisos
- **Validación de Sesión**: Seguridad en cada request
- **Sanitización de Inputs**: Protección contra ataques
- **Protección CSRF**: Seguridad adicional




