// Variables globales
let signaturePad;
let documentFiles = [];
let currentCameraStream = null;
let currentCameraIndex = 0;
let availableCameras = [];

// Función para mostrar alertas
function showAlert(message, type = 'success') {
    const alertContainer = document.getElementById('alertContainer');
    const alert = document.createElement('div');
    alert.className = `alert alert-${type}`;
    alert.textContent = message;

    alertContainer.appendChild(alert);

    setTimeout(() => {
        alert.remove();
    }, 5000);
}

// Función para rellenar fecha automáticamente
function setCurrentDate() {
    const today = new Date();
    const day = today.getDate().toString().padStart(2, '0');
    const month = (today.getMonth() + 1).toString().padStart(2, '0');
    const year = today.getFullYear().toString().slice(-2);

    document.getElementById('day').textContent = day;
    document.getElementById('month').textContent = month;
    document.getElementById('year').textContent = year;

    // También llenar la fecha en texto
    const months = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
        'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
    document.getElementById('diaActual').textContent = today.getDate();
    document.getElementById('mesActual').textContent = months[today.getMonth()];
    document.getElementById('añoActual').textContent = today.getFullYear();
}

// Función para generar la orden de servicio técnico
function generateOrder(event) {
    event.preventDefault();

    // Obtener datos del formulario
    const formData = new FormData(event.target);
    const data = {};

    for (let [key, value] of formData.entries()) {
        data[key] = value;
    }

    // Validar campos requeridos
    const requiredFields = ['responsable', 'sede', 'marca', 'modelo', 'imei', 'prende', 'bateria'];
    const missingFields = requiredFields.filter(field => !data[field] || data[field].trim() === '');

    if (missingFields.length > 0) {
        showAlert('Por favor complete todos los campos requeridos', 'error');
        return;
    }

    // Validar firma
    if (!document.getElementById('firmaBase64').value) {
        showAlert('Por favor agregue la firma del cliente', 'error');
        return;
    }

    // Llenar datos en la orden generada
    document.getElementById('sedeDisplay').textContent = data.sede;
    document.getElementById('marcaDisplay').textContent = data.marca;
    document.getElementById('modeloDisplay').textContent = data.modelo;
    document.getElementById('imeiDisplay').textContent = data.imei;
    document.getElementById('prendeDisplay').textContent = data.prende === 'true' ? 'Sí' : 'No';
    document.getElementById('bateriaDisplay').textContent = data.bateria === 'true' ? 'Sí' : 'No';
    document.getElementById('porcentajeBateriaDisplay').textContent = data.porcentajeBateria || 'N/A';
    document.getElementById('codigoSeguridadDisplay').textContent = data.codigoSeguridad || 'N/A';
    document.getElementById('correoVinculadoDisplay').textContent = data.correoVinculado || 'N/A';
    document.getElementById('patronDisplay').textContent = data.patron ? 'Establecido' : 'N/A';
    document.getElementById('contraseñaDisplay').textContent = data.contraseña || 'N/A';
    document.getElementById('responsableDisplay').textContent = data.responsable;
    document.getElementById('sedeResponsableDisplay').textContent = data.sede;

    // Generar número de orden aleatorio si no existe
    if (!document.getElementById('numeroOrden').value) {
        document.getElementById('numeroOrden').value = 'ST-' + Math.floor(Math.random() * 9000 + 1000);
    }

    // Transferir firma del formulario a la orden
    const firmaBase64 = document.getElementById('firmaBase64').value;
    if (firmaBase64) {
        const firmaImg = document.getElementById('firmaClienteImg');
        if (firmaImg) {
            firmaImg.src = firmaBase64;
            firmaImg.style.display = 'block';
        }
    }

    // Mostrar la orden y ocultar el formulario
    document.querySelector('.formulario-comodato').style.display = 'none';
    const ordenContainer = document.querySelector('.orden-container');
    ordenContainer.style.display = 'block';
    ordenContainer.classList.add('show');

    // Configurar fecha
    setCurrentDate();

    // Scroll a la orden generada
    document.getElementById('ordenGenerada').scrollIntoView({ behavior: 'smooth' });

    showAlert('Orden de servicio técnico generada exitosamente', 'success');
}

// Función para abrir modal de firma
function abrirModalFirma() {
    document.getElementById('modalFirma').style.display = 'flex';
    setTimeout(() => {
        if (!signaturePad) {
            const canvas = document.getElementById('firmaCanvas');
            signaturePad = new SignaturePad(canvas, {
                backgroundColor: 'rgba(255,255,255,0)',
                penColor: 'rgb(0,0,0)',
                minWidth: 0.5,
                maxWidth: 2.5,
                throttle: 16,
                minDistance: 5,
            });
        }
        signaturePad.clear();
    }, 100);
}

function cerrarModalFirma() {
    document.getElementById('modalFirma').style.display = 'none';
}

function limpiarFirma() {
    if (signaturePad) signaturePad.clear();
}

function guardarFirma() {
    if (signaturePad && !signaturePad.isEmpty()) {
        const dataUrl = signaturePad.toDataURL();
        document.getElementById('firmaBase64').value = dataUrl;
        document.getElementById('firmaPreview').innerHTML = `<img src="${dataUrl}" style="max-width:200px; border:1px solid #ccc; border-radius:6px;">`;
        cerrarModalFirma();
        showAlert('Firma guardada correctamente', 'success');
    } else {
        showAlert('Por favor, realice la firma antes de guardar.', 'error');
    }
}

// Función para editar orden
function editForm() {
    document.getElementById('ordenGenerada').style.display = 'none';
    document.querySelector('.formulario-comodato').style.display = 'block';
    document.querySelector('.formulario-comodato').scrollIntoView({ behavior: 'smooth' });
}

// Función para nueva orden
function newOrder() {
    if (confirm('¿Está seguro de que desea crear una nueva orden? Se perderán los datos actuales.')) {
        resetForm();
    }
}

// Función para resetear formulario
function resetForm() {
    document.getElementById('ordenSTForm').reset();
    const ordenContainer = document.querySelector('.orden-container');
    ordenContainer.style.display = 'none';
    ordenContainer.classList.remove('show');
    document.querySelector('.formulario-comodato').style.display = 'block';

    // Limpiar firma
    if (signaturePad) signaturePad.clear();
    signaturePad = null;

    // Limpiar documentos
    documentFiles = [];
    updateDocumentsGrid();

    // Limpiar preview de firma
    document.getElementById('firmaPreview').innerHTML = '';
    document.getElementById('firmaBase64').value = '';

    showAlert('Formulario limpiado correctamente', 'success');
}

// ====== FUNCIONES PARA DOCUMENTOS ======

// Función para obtener cámaras disponibles
async function openDocumentCamera() {
    try {
        const modal = document.getElementById('cameraModal');
        const video = document.getElementById('cameraVideo');
        
        // Configuración simple que funciona
        currentCameraStream = await navigator.mediaDevices.getUserMedia({
            video: true
        });
        
        video.srcObject = currentCameraStream;
        modal.style.display = 'flex';
        
        showAlert('Cámara abierta', 'success');
        
    } catch (error) {
        console.error('Error:', error);
        showAlert('No se pudo abrir la cámara', 'error');
    }
}

// Función simple para cambiar cámara
async function switchCamera() {
    try {
        // Cerrar stream actual
        if (currentCameraStream) {
            currentCameraStream.getTracks().forEach(track => track.stop());
        }

        // Obtener todas las cámaras
        const devices = await navigator.mediaDevices.enumerateDevices();
        const cameras = devices.filter(device => device.kind === 'videoinput');
        
        if (cameras.length <= 1) {
            showAlert('Solo hay una cámara', 'error');
            return;
        }

        // Cambiar a la siguiente cámara
        currentCameraIndex = (currentCameraIndex + 1) % cameras.length;
        
        currentCameraStream = await navigator.mediaDevices.getUserMedia({
            video: { deviceId: cameras[currentCameraIndex].deviceId }
        });

        const video = document.getElementById('cameraVideo');
        video.srcObject = currentCameraStream;

        showAlert('Cámara cambiada', 'success');
        
    } catch (error) {
        console.error('Error:', error);
        showAlert('Error al cambiar cámara', 'error');
    }
}

// Función para capturar documento
function captureDocument() {
    const video = document.getElementById('cameraVideo');
    const canvas = document.getElementById('captureCanvas');
    if (!video || !canvas) return;

    // Dibuja la imagen del video en el canvas
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Convierte el canvas a blob y lo agrega a la lista de documentos
    canvas.toBlob(function(blob) {
        if (blob) {
            const fileName = `foto_${Date.now()}.jpg`;
            const file = new File([blob], fileName, { type: 'image/jpeg' });
            documentFiles.push({
                file: file,
                name: fileName,
                type: 'camera',
                timestamp: new Date().toISOString(),
                size: blob.size
            });
            updateDocumentsGrid();
            showAlert('Foto capturada y agregada a documentos.', 'success');
            closeDocumentCamera();
        }
    }, 'image/jpeg', 0.95);
}

// Función para cerrar cámara de documentos
function closeDocumentCamera() {
    const modal = document.getElementById('cameraModal');
    const video = document.getElementById('cameraVideo');
    
    if (currentCameraStream) {
        currentCameraStream.getTracks().forEach(track => track.stop());
        currentCameraStream = null;
    }
    
    video.srcObject = null;
    modal.style.display = 'none';
}

// Función para manejar subida de archivos
function handleFileUpload(event) {
    const files = Array.from(event.target.files);
    
    files.forEach(file => {
        if (validateDocumentFile(file)) {
            documentFiles.push({
                file: file,
                name: file.name,
                type: 'upload',
                timestamp: new Date().toISOString(),
                size: file.size
            });
        }
    });
    
    updateDocumentsGrid();
    
    if (files.length > 0) {
        showAlert(`${files.length} documento(s) agregado(s)`, 'success');
    }
    
    // Limpiar input
    event.target.value = '';
}

// Función para validar archivos de documentos
function validateDocumentFile(file) {
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf'];
    
    if (!allowedTypes.includes(file.type)) {
        showAlert(`Tipo de archivo no permitido: ${file.name}. Solo se permiten imágenes y PDF.`, 'error');
        return false;
    }
    
    if (file.size > maxSize) {
        showAlert(`El archivo ${file.name} es demasiado grande. Máximo 10MB.`, 'error');
        return false;
    }
    
    return true;
}

// Función para actualizar la grilla de documentos
function updateDocumentsGrid() {
    const grid = document.getElementById('documentsGrid');
    const counter = document.getElementById('documentsCounter');
    
    grid.innerHTML = '';
    
    documentFiles.forEach((doc, index) => {
        const docElement = document.createElement('div');
        docElement.className = 'document-item';
        
        // Crear preview
        const reader = new FileReader();
        reader.onload = function(e) {
            const isImage = doc.file.type.startsWith('image/');
            const preview = isImage ? 
                `<img src="${e.target.result}" alt="${doc.name}" class="document-preview">` :
                `<div class="document-preview pdf-preview"><i class="fas fa-file-pdf"></i></div>`;
            
            // Determinar icono según el tipo
            let typeIcon = '<i class="fas fa-file"></i>';
            if (doc.type === 'camera') typeIcon = '<i class="fas fa-camera"></i>';
            else if (doc.type === 'order') typeIcon = '<i class="fas fa-clipboard"></i>';
            
            docElement.innerHTML = `
                <div class="document-content">
                    ${preview}
                    <div class="document-info">
                        <div class="document-name">${doc.name}</div>
                        <div class="document-details">
                            <span class="document-type">${typeIcon}</span>
                            <span class="document-size">${formatFileSize(doc.size)}</span>
                        </div>
                    </div>
                    <button class="document-remove" onclick="removeDocument(${index})"><i class="fas fa-times"></i></button>
                </div>
            `;
        };
        
        if (doc.file.type.startsWith('image/')) {
            reader.readAsDataURL(doc.file);
        } else {
            // Para PDFs, mostrar icono
            let typeIcon = '<i class="fas fa-file"></i>';
            if (doc.type === 'camera') typeIcon = '<i class="fas fa-camera"></i>';
            else if (doc.type === 'order') typeIcon = '<i class="fas fa-clipboard"></i>';
            
            docElement.innerHTML = `
                <div class="document-content">
                    <div class="document-preview pdf-preview"><i class="fas fa-file-pdf"></i></div>
                    <div class="document-info">
                        <div class="document-name">${doc.name}</div>
                        <div class="document-details">
                            <span class="document-type">${typeIcon}</span>
                            <span class="document-size">${formatFileSize(doc.size)}</span>
                        </div>
                    </div>
                    <button class="document-remove" onclick="removeDocument(${index})"><i class="fas fa-times"></i></button>
                </div>
            `;
        }
        
        grid.appendChild(docElement);
    });
    
    // Actualizar contador
    counter.textContent = `${documentFiles.length} documento${documentFiles.length !== 1 ? 's' : ''} adjunto${documentFiles.length !== 1 ? 's' : ''}`;
}

// Función para remover documento
function removeDocument(index) {
    if (confirm('¿Está seguro de que desea eliminar este documento?')) {
        documentFiles.splice(index, 1);
        updateDocumentsGrid();
        showAlert('Documento eliminado', 'success');
    }
}

// Función para formatear tamaño de archivo
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Función para guardar orden como documento
function saveOrderAsDocument() {
    try {
        // Mostrar indicador de carga
        showAlert('Generando documento de la orden...', 'info');
        
        // Obtener el contenedor de la orden
        const ordenContainer = document.getElementById('ordenGenerada');
        
        // Ocultar temporalmente los botones de acción para la captura
        const orderActions = ordenContainer.querySelector('.contract-actions');
        const originalDisplay = orderActions.style.display;
        orderActions.style.display = 'none';
        
        // Usar html2canvas para capturar la orden
        html2canvas(ordenContainer, {
            scale: 2,
            useCORS: true,
            backgroundColor: '#ffffff',
            height: ordenContainer.scrollHeight,
            width: ordenContainer.scrollWidth,
            scrollX: 0,
            scrollY: 0
        }).then(canvas => {
            // Restaurar los botones
            orderActions.style.display = originalDisplay;
            
            // Convertir canvas a blob
            canvas.toBlob(function(blob) {
                if (blob) {
                    // Obtener número de orden para el nombre del archivo
                    const numeroOrden = document.getElementById('numeroOrden').value || 'sin-numero';
                    const fechaActual = new Date().toISOString().split('T')[0];
                    const fileName = `orden_${numeroOrden}_${fechaActual}.png`;
                    
                    // Crear archivo
                    const file = new File([blob], fileName, { 
                        type: 'image/png',
                        lastModified: Date.now()
                    });
                    
                    // Agregar a la lista de documentos
                    documentFiles.push({
                        file: file,
                        name: fileName,
                        type: 'order',
                        timestamp: new Date().toISOString(),
                        size: blob.size
                    });
                    
                    // Actualizar interfaz de documentos
                    updateDocumentsGrid();
                    
                    showAlert('Orden guardada exitosamente. Mostrando sección de documentos...', 'success');
                    
                    // Navegar de vuelta al formulario y mostrar sección de documentos
                    setTimeout(() => {
                        navigateToDocumentsSection();
                    }, 1000);
                    
                } else {
                    showAlert('Error al generar el documento de la orden', 'error');
                }
            }, 'image/png', 0.95);
            
        }).catch(error => {
            // Restaurar los botones en caso de error
            orderActions.style.display = originalDisplay;
            console.error('Error al capturar orden:', error);
            showAlert('Error al guardar orden: ' + error.message, 'error');
        });
        
    } catch (error) {
        console.error('Error en saveOrderAsDocument:', error);
        showAlert('Error al guardar orden: ' + error.message, 'error');
    }
}

// Función para navegar a la sección de documentos
function navigateToDocumentsSection() {
    // Ocultar la orden generada
    const ordenContainer = document.querySelector('.orden-container');
    ordenContainer.style.display = 'none';
    ordenContainer.classList.remove('show');
    
    // Mostrar el formulario
    const formulario = document.querySelector('.formulario-comodato');
    formulario.style.display = 'block';
    
    // Hacer scroll hasta la sección de documentos
    const documentsSection = document.querySelector('.documents-section');
    if (documentsSection) {
        documentsSection.scrollIntoView({ 
            behavior: 'smooth',
            block: 'start'
        });
        
        // Agregar efecto visual para destacar la sección
        documentsSection.style.border = '2px solid #4A90E2';
        documentsSection.style.borderRadius = '8px';
        documentsSection.style.padding = '15px';
        documentsSection.style.backgroundColor = '#f8f9fa';
        
        // Quitar el destacado después de 3 segundos
        setTimeout(() => {
            documentsSection.style.border = '';
            documentsSection.style.borderRadius = '';
            documentsSection.style.padding = '';
            documentsSection.style.backgroundColor = '';
        }, 3000);
    }
    
    showAlert('Orden guardada en documentos. Puede continuar agregando más archivos.', 'success');
}

// Inicialización del patrón de desbloqueo
document.addEventListener('DOMContentLoaded', function() {
    // Inicializar el modal de patrón
    window.initSimplePatternModal({
        openBtnId: 'openPatternModal',
        modalId: 'patternModal',
        containerId: 'patternContainer',
        inputId: 'patron',
        statusId: 'patternStatus',
        onPatternSet: function(pattern) {
            showAlert('Patrón guardado correctamente', 'success');
        },
        minLength: 4,
        nodeSize: 40
    });

    // Agregar event listener al formulario
    document.getElementById('ordenSTForm').addEventListener('submit', generateOrder);

    // Validación de campos en tiempo real
    const inputs = document.querySelectorAll('input[required], textarea[required]');
    inputs.forEach(input => {
        input.addEventListener('blur', function () {
            validateField(this);
        });

        input.addEventListener('input', function () {
            if (this.style.borderColor === 'rgb(231, 76, 60)') {
                validateField(this);
            }
        });
    });

    // Cerrar modal de cámara con ESC
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            const cameraModal = document.getElementById('cameraModal');
            if (cameraModal && cameraModal.style.display === 'flex') {
                closeDocumentCamera();
            }
        }
    });

    // Inicializar grid de documentos
    updateDocumentsGrid();
});

// Función para validar campos en tiempo real
function validateField(field) {
    const value = field.value.trim();
    const fieldContainer = field.closest('.form-group');
    const existingError = fieldContainer.querySelector('.error-message');

    if (existingError) {
        existingError.remove();
    }

    if (field.hasAttribute('required') && !value) {
        const errorMsg = document.createElement('div');
        errorMsg.className = 'error-message';
        errorMsg.style.color = '#e74c3c';
        errorMsg.style.fontSize = '0.9em';
        errorMsg.style.marginTop = '5px';
        errorMsg.textContent = 'Este campo es requerido';
        fieldContainer.appendChild(errorMsg);
        field.style.borderColor = '#e74c3c';
    } else {
        field.style.borderColor = '#e1e8ed';
    }
}

// Limpiar recursos al cerrar/recargar página
window.addEventListener('beforeunload', function() {
    if (currentCameraStream) {
        currentCameraStream.getTracks().forEach(track => track.stop());
    }
}); 