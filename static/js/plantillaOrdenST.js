/**
 * JavaScript para la Plantilla de Orden de Servicio Técnico
 * Archivo: plantillaOrdenST.js
 * Propósito: Funcionalidad interactiva para la visualización de órdenes ST
 * 
 * Dependencias:
 * - sweetalerts.js (sistema de alertas)
 * - simple_pattern_lock.js (visualización de patrones)
 * - plantilla_firmas.js (funciones base)
 * - html2pdf.js (generación de PDF)
 */

'use strict';

// ==========================================================================
// 1. CONFIGURACIÓN Y VARIABLES GLOBALES
// ==========================================================================

const PlantillaOrdenST = {
    // Configuración
    config: {
        pdfOptions: {
            margin: [10, 10, 10, 10],
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { 
                scale: 2,
                useCORS: true,
                allowTaint: true,
                logging: false
            },
            jsPDF: { 
                unit: 'mm', 
                format: 'a4', 
                orientation: 'portrait' 
            }
        },
        alertDuration: 5000,
        loadingDelay: 100
    },
    
    // Estado de la aplicación
    state: {
        isGeneratingPDF: false,
        isUploadingCloud: false,
        documentoId: null,
        numeroOrden: null
    },
    
    // Referencias a elementos DOM
    elements: {
        actionButtons: null,
        pdfButton: null,
        cloudButton: null,
        printButton: null,
        ordenContainer: null,
        patronContainer: null
    }
};

// ==========================================================================
// 2. INICIALIZACIÓN
// ==========================================================================

/**
 * Inicializa la aplicación cuando el DOM está listo
 */
document.addEventListener('DOMContentLoaded', function() {
    PlantillaOrdenST.init();
});

/**
 * Función principal de inicialización
 */
PlantillaOrdenST.init = function() {
    console.log('🚀 Inicializando Plantilla Orden ST...');
    
    try {
        this.initElements();
        this.initEventListeners();
        this.initPatronDisplay();
        this.showSuccessMessage();
        
        console.log('✅ Plantilla Orden ST inicializada correctamente');
    } catch (error) {
        console.error('❌ Error al inicializar Plantilla Orden ST:', error);
        this.showErrorAlert('Error de inicialización', 'No se pudo cargar la plantilla correctamente');
    }
};

/**
 * Inicializa las referencias a elementos DOM
 */
PlantillaOrdenST.initElements = function() {
    this.elements.actionButtons = document.querySelector('.action-buttons');
    this.elements.pdfButton = document.querySelector('.pdf-button');
    this.elements.cloudButton = document.querySelector('.cloud-button');
    this.elements.printButton = document.querySelector('.print-button');
    this.elements.ordenContainer = document.querySelector('.orden-st-print');
    this.elements.patronContainer = document.getElementById('patron_container');
    
    // Obtener datos de la plantilla
    const metaDocumento = document.querySelector('meta[name="documento-id"]');
    const metaNumero = document.querySelector('meta[name="numero-orden"]');
    
    if (metaDocumento) this.state.documentoId = metaDocumento.content;
    if (metaNumero) this.state.numeroOrden = metaNumero.content;
    
    // Para plantillas de tickets, no necesitamos documento_id específico
    // Los datos se obtienen de la sesión en el backend
    
    console.log('📝 Elementos DOM inicializados:', {
        documentoId: this.state.documentoId,
        numeroOrden: this.state.numeroOrden,
        elementos: Object.keys(this.elements).filter(key => this.elements[key] !== null)
    });
};

/**
 * Configura los event listeners
 */
PlantillaOrdenST.initEventListeners = function() {
    // Botón de impresión
    if (this.elements.printButton) {
        this.elements.printButton.addEventListener('click', this.handlePrint.bind(this));
    }
    
    // Botón de PDF
    if (this.elements.pdfButton) {
        this.elements.pdfButton.addEventListener('click', this.handleGeneratePDF.bind(this));
    }
    
    // Botón de subir a la nube
    if (this.elements.cloudButton) {
        this.elements.cloudButton.addEventListener('click', this.handleUploadCloud.bind(this));
    }
    
    // Eventos de teclado
    document.addEventListener('keydown', this.handleKeyboard.bind(this));
    
    console.log('🎯 Event listeners configurados');
};

/**
 * Inicializa la visualización del patrón (reutiliza plantilla_firmas.js)
 */
PlantillaOrdenST.initPatronDisplay = function() {
    if (!this.elements.patronContainer) return;
    
    try {
        // Reutilizar función de plantilla_firmas.js si está disponible
        if (typeof initPatronDisplay === 'function') {
            initPatronDisplay();
        } else {
            // Implementación alternativa
            this.renderPatron();
        }
        console.log('🔒 Patrón de desbloqueo inicializado');
    } catch (error) {
        console.warn('⚠️ Error al inicializar patrón:', error);
    }
};

/**
 * Muestra mensaje de éxito inicial
 */
PlantillaOrdenST.showSuccessMessage = function() {
    // Reutilizar SweetAlert si está disponible
    if (typeof showSuccessAlert === 'function') {
        showSuccessAlert(
            '¡Orden generada!', 
            'La orden de servicio técnico ha sido registrada y puede imprimirse.'
        );
    } else {
        // Implementación alternativa
        this.showCustomAlert('¡Orden generada correctamente!', 'success');
    }
};

// ==========================================================================
// 3. MANEJADORES DE EVENTOS
// ==========================================================================

/**
 * Maneja la impresión de la orden
 */
PlantillaOrdenST.handlePrint = function(event) {
    event.preventDefault();
    
    console.log('🖨️ Iniciando impresión...');
    
    // Ocultar botones temporalmente
    if (this.elements.actionButtons) {
        this.elements.actionButtons.style.display = 'none';
    }
    
    // Imprimir
    window.print();
    
    // Restaurar botones después de un delay
    setTimeout(() => {
        if (this.elements.actionButtons) {
            this.elements.actionButtons.style.display = 'flex';
        }
    }, 1000);
};

/**
 * Maneja la generación de PDF
 */
PlantillaOrdenST.handleGeneratePDF = function(event) {
    event.preventDefault();
    
    if (this.state.isGeneratingPDF) {
        console.log('⏳ Generación de PDF ya en proceso...');
        return;
    }
    
    this.generatePDF();
};

/**
 * Maneja la subida a la nube
 */
PlantillaOrdenST.handleUploadCloud = function(event) {
    event.preventDefault();
    
    if (this.state.isUploadingCloud) {
        console.log('⏳ Subida a la nube ya en proceso...');
        return;
    }
    
    this.uploadToCloud();
};

/**
 * Maneja eventos de teclado
 */
PlantillaOrdenST.handleKeyboard = function(event) {
    // Ctrl+P para imprimir
    if (event.ctrlKey && event.key === 'p') {
        event.preventDefault();
        this.handlePrint(event);
    }
    
    // Ctrl+S para PDF
    if (event.ctrlKey && event.key === 's') {
        event.preventDefault();
        this.handleGeneratePDF(event);
    }
};

// ==========================================================================
// 4. FUNCIONES DE GENERACIÓN DE PDF
// ==========================================================================

/**
 * Genera el PDF de la orden
 */
PlantillaOrdenST.generatePDF = function() {
    console.log('📄 Iniciando generación de PDF...');
    
    if (!this.elements.ordenContainer) {
        this.showErrorAlert('Error', 'No se encontró el contenido a convertir');
        return;
    }
    
    if (typeof html2pdf === 'undefined') {
        this.showErrorAlert('Error', 'Librería PDF no disponible');
        return;
    }
    
    this.state.isGeneratingPDF = true;
    this.updateButtonState(this.elements.pdfButton, true, 'Generando PDF...');
    
    // Ocultar botones durante la generación
    if (this.elements.actionButtons) {
        this.elements.actionButtons.style.display = 'none';
    }
    
    // Configurar opciones de PDF
    const options = {
        ...this.config.pdfOptions,
        filename: `orden_servicio_tecnico_${this.state.numeroOrden || 'documento'}.pdf`
    };
    
    // Generar PDF
    html2pdf()
        .set(options)
        .from(this.elements.ordenContainer)
        .save()
        .then(() => {
            console.log('✅ PDF generado correctamente');
            this.showSuccessAlert('PDF generado', 'El archivo se ha descargado correctamente');
        })
        .catch((error) => {
            console.error('❌ Error al generar PDF:', error);
            this.showErrorAlert('Error al generar PDF', error.message || 'Error desconocido');
        })
        .finally(() => {
            // Restaurar estado
            this.state.isGeneratingPDF = false;
            this.updateButtonState(this.elements.pdfButton, false, '<i class="fas fa-file-pdf"></i> Generar PDF');
            
            if (this.elements.actionButtons) {
                this.elements.actionButtons.style.display = 'flex';
            }
        });
};

// ==========================================================================
// 5. FUNCIONES DE SUBIDA A LA NUBE
// ==========================================================================

/**
 * Sube el documento a la nube
 */
PlantillaOrdenST.uploadToCloud = function() {
    console.log('☁️ Iniciando subida a la nube...');
    
    // Para plantillas de tickets, no necesitamos validar documentoId
    // Los datos se obtienen de la sesión en el backend
    
    // Mostrar confirmación usando SweetAlert si está disponible
    if (typeof Swal !== 'undefined') {
        Swal.fire({
            title: '¿Subir a la nube?',
            text: '¿Está seguro de que desea subir este documento a la nube?',
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#28a745',
            cancelButtonColor: '#6c757d',
            confirmButtonText: 'Sí, subir',
            cancelButtonText: 'Cancelar'
        }).then((result) => {
            if (result.isConfirmed) {
                this.performCloudUpload();
            }
        });
    } else {
        // Confirmación básica
        if (confirm('¿Está seguro de que desea subir este documento a la nube?')) {
            this.performCloudUpload();
        }
    }
};

/**
 * Realiza la subida efectiva a la nube
 */
PlantillaOrdenST.performCloudUpload = function() {
    this.state.isUploadingCloud = true;
    this.updateButtonState(this.elements.cloudButton, true, 'Subiendo...');
    
    const uploadData = {
        numero_orden: this.state.numeroOrden || 'XXXX',
        timestamp: new Date().toISOString()
    };
    
    // Construir URL usando el nuevo endpoint para tickets
    const baseUrl = window.location.origin;
    const uploadUrl = `${baseUrl}/firmas/plantillas/ordenST/subir_nube_ticket`;
    
    console.log('📤 Enviando datos:', uploadData, 'a', uploadUrl);
    
    fetch(uploadUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(uploadData)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        return response.json();
    })
    .then(data => {
        console.log('✅ Respuesta del servidor:', data);
        
        if (data.success) {
            this.showSuccessAlert('Subida exitosa', data.message || 'Documento subido correctamente a la nube');
            
            if (data.cloud_url) {
                console.log('🔗 URL en la nube:', data.cloud_url);
            }
        } else {
            throw new Error(data.message || 'Error desconocido del servidor');
        }
    })
    .catch(error => {
        console.error('❌ Error en subida a la nube:', error);
        this.showErrorAlert('Error de subida', error.message || 'Error de conexión al subir a la nube');
    })
    .finally(() => {
        // Restaurar estado
        this.state.isUploadingCloud = false;
        this.updateButtonState(this.elements.cloudButton, false, '<i class="fas fa-cloud-upload-alt"></i> Subir a la Nube');
    });
};

// ==========================================================================
// 6. FUNCIONES DE UTILIDAD
// ==========================================================================

/**
 * Actualiza el estado visual de un botón
 */
PlantillaOrdenST.updateButtonState = function(button, isLoading, text) {
    if (!button) return;
    
    button.disabled = isLoading;
    button.innerHTML = isLoading ? `<i class="fas fa-spinner fa-spin"></i> ${text}` : text;
    
    if (isLoading) {
        button.classList.add('loading');
    } else {
        button.classList.remove('loading');
    }
};

/**
 * Muestra alerta de éxito (reutiliza sweetalerts.js)
 */
PlantillaOrdenST.showSuccessAlert = function(title, message, callback) {
    if (typeof showSuccessAlert === 'function') {
        showSuccessAlert(title, message, callback);
    } else {
        this.showCustomAlert(`${title}: ${message}`, 'success');
    }
};

/**
 * Muestra alerta de error (reutiliza sweetalerts.js)
 */
PlantillaOrdenST.showErrorAlert = function(title, message) {
    if (typeof showErrorAlert === 'function') {
        showErrorAlert(title, message);
    } else {
        this.showCustomAlert(`${title}: ${message}`, 'error');
    }
};

/**
 * Sistema de alertas personalizado (fallback)
 */
PlantillaOrdenST.showCustomAlert = function(message, type) {
    // Crear el elemento de alerta
    const alert = document.createElement('div');
    alert.className = `custom-alert ${type}`;
    alert.textContent = message;
    
    // Agregar al DOM
    document.body.appendChild(alert);
    
    // Remover después del tiempo configurado
    setTimeout(() => {
        if (alert.parentNode) {
            alert.parentNode.removeChild(alert);
        }
    }, this.config.alertDuration);
};

/**
 * Renderiza el patrón de desbloqueo (implementación alternativa)
 */
PlantillaOrdenST.renderPatron = function() {
    if (!this.elements.patronContainer) return;
    
    const patronData = this.elements.patronContainer.dataset.patron;
    if (!patronData || patronData.trim() === '') return;
    
    try {
        // Convertir el patrón a array de números
        const patronArray = patronData.split(',').map(p => parseInt(p.trim())).filter(p => !isNaN(p));
        if (patronArray.length === 0) return;
        
        // Crear canvas
        const patronDisplay = document.getElementById('patron_display');
        if (!patronDisplay) return;
        
        // Limpiar contenido anterior
        patronDisplay.innerHTML = '';
        
        const canvas = document.createElement('canvas');
        canvas.width = 150;
        canvas.height = 150;
        patronDisplay.appendChild(canvas);
        
        // Dibujar el patrón
        this.drawPatron(canvas, patronArray);
        
        console.log('🔒 Patrón renderizado:', patronArray);
    } catch (error) {
        console.error('❌ Error al renderizar patrón:', error);
    }
};

/**
 * Dibuja el patrón en el canvas
 */
PlantillaOrdenST.drawPatron = function(canvas, patronArray) {
    const ctx = canvas.getContext('2d');
    const gridSize = 3;
    const nodeSize = 12;
    const margin = 25;
    const spacing = (canvas.width - 2 * margin) / (gridSize - 1);
    
    // Fondo del canvas
    ctx.fillStyle = '#f9fafb';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Calcular posiciones de los nodos
    const nodePositions = [];
    for (let i = 0; i < 9; i++) {
        const row = Math.floor(i / gridSize);
        const col = i % gridSize;
        nodePositions.push({
            x: margin + col * spacing,
            y: margin + row * spacing
        });
    }
    
    // Dibujar todos los nodos
    ctx.fillStyle = '#e5e7eb';
    ctx.strokeStyle = '#9ca3af';
    ctx.lineWidth = 2;
    
    for (let i = 0; i < 9; i++) {
        const pos = nodePositions[i];
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, nodeSize, 0, 2 * Math.PI);
        ctx.fill();
        ctx.stroke();
    }
    
    // Dibujar nodos activos y líneas del patrón
    if (patronArray.length > 0) {
        ctx.strokeStyle = '#3b82f6';
        ctx.fillStyle = '#3b82f6';
        ctx.lineWidth = 3;
        
        // Dibujar líneas del patrón
        if (patronArray.length > 1) {
            ctx.beginPath();
            const firstPos = nodePositions[patronArray[0]];
            ctx.moveTo(firstPos.x, firstPos.y);
            
            for (let i = 1; i < patronArray.length; i++) {
                const pos = nodePositions[patronArray[i]];
                ctx.lineTo(pos.x, pos.y);
            }
            ctx.stroke();
        }
        
        // Dibujar nodos activos
        for (let nodeIndex of patronArray) {
            if (nodeIndex >= 0 && nodeIndex < 9) {
                const pos = nodePositions[nodeIndex];
                ctx.beginPath();
                ctx.arc(pos.x, pos.y, nodeSize, 0, 2 * Math.PI);
                ctx.fill();
            }
        }
    }
};

// ==========================================================================
// 7. EXPOSICIÓN GLOBAL
// ==========================================================================

// Exponer funciones principales para uso externo
window.PlantillaOrdenST = PlantillaOrdenST;

// Mantener compatibilidad con funciones individuales
window.generarPDF = function() {
    PlantillaOrdenST.generatePDF();
};

window.subirALaNube = function() {
    PlantillaOrdenST.uploadToCloud();
};

// ==========================================================================
// 8. MANEJO DE ERRORES GLOBALES
// ==========================================================================

window.addEventListener('error', function(event) {
    console.error('❌ Error global capturado:', event.error);
    
    // Solo mostrar alerta si es un error relacionado con nuestra aplicación
    if (event.filename && event.filename.includes('plantillaOrdenST.js')) {
        PlantillaOrdenST.showErrorAlert(
            'Error inesperado', 
            'Se produjo un error en la aplicación. Por favor, recarga la página.'
        );
    }
});

// ==========================================================================
// 9. LOGGING Y DEBUG
// ==========================================================================

if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    // Habilitar logging detallado en desarrollo
    console.log('🔧 Modo desarrollo activado - Logging detallado habilitado');
    
    window.PlantillaOrdenST.debug = {
        state: () => console.table(PlantillaOrdenST.state),
        elements: () => console.log(PlantillaOrdenST.elements),
        config: () => console.table(PlantillaOrdenST.config)
    };
}

console.log('📚 plantillaOrdenST.js cargado correctamente'); 