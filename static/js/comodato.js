// Variables globales
let signatureComodatario, signatureComodante;
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

// Función para generar el contrato - VERSIÓN CORREGIDA
function generateContract(event) {
    event.preventDefault();

    // Obtener datos del formulario
    const formData = new FormData(event.target);
    const data = {};

    for (let [key, value] of formData.entries()) {
        data[key] = value;
    }
    
    // Obtener valores reales de campos numéricos
    const valorBienesInput = document.getElementById('valorBienes');
    const penalizacionInput = document.getElementById('porcentajePenalizacion');
    
    data.valorBienes = getRawValue(valorBienesInput);
    data.porcentajePenalizacion = getRawValue(penalizacionInput);

    // Validar campos requeridos
    const requiredFields = ['nombreCompleto', 'cedula', 'direccion', 'telefono', 'ciudad', 'duracionDias', 'descripcionBienes', 'valorBienes'];
    const missingFields = requiredFields.filter(field => !data[field] || data[field].trim() === '');

    if (missingFields.length > 0) {
        showAlert('Por favor complete todos los campos requeridos', 'error');
        return;
    }

    // Llenar campos de entrada en el contrato
    const inputs = document.querySelectorAll('#contratoGenerado .input-field');

    // Mapear los campos según su posición/contexto
    inputs.forEach((input, index) => {
        const placeholder = input.getAttribute('placeholder');

        if (placeholder === 'NOMBRE') {
            input.value = data.nombreCompleto;
        } else if (placeholder === 'CEDULA') {
            input.value = data.cedula;
        } else if (placeholder === 'Describa aquí los bienes entregados en comodato') {
            input.value = data.descripcionBienes;
        } else if (placeholder === 'NOMBRE CLIENTE') {
            input.value = data.nombreCompleto;
        } else if (placeholder === 'DÍAS') {
            input.value = data.duracionDias;
        } else if (placeholder === '5 DÍAS') {
            input.value = data.diasDevolucion || '5';
        } else if (placeholder === 'VALOR') {
            input.value = Number(data.valorBienes).toLocaleString('es-CO');
        } else if (placeholder === '1302') {
            input.value = data.numeroContrato || Math.floor(Math.random() * 9000) + 1000;
        }
    });

    // CORREGIDO: Llenar campos específicos en la sección de firmas
    document.getElementById('cedulaContrato').textContent = data.cedula;
    document.getElementById('nombreContrato').textContent = data.nombreCompleto;
    
    // Llenar campos de dirección y teléfono en la sección de firmas
    const signatureInputs = document.querySelectorAll('.signature-section .signature-box:first-child .signature-field input');
    if (signatureInputs.length >= 2) {
        signatureInputs[0].value = data.direccion;
        signatureInputs[1].value = data.telefono;
    }

    // CORREGIDO: Transferir la firma del formulario al contrato
    const firmaBase64 = document.getElementById('firmaBase64').value;
    if (firmaBase64) {
        const firmaImg = document.getElementById('firmaComodatarioImg');
        if (firmaImg) {
            firmaImg.src = firmaBase64;
            firmaImg.style.display = 'block';
        }
    }

    // Llenar representante legal
    const representanteLegalField = document.getElementById('contratoRepresentanteLegal');
    if (representanteLegalField) {
        representanteLegalField.value = data.representanteLegal || 'ALFREDO MORALES';
    }

    // Actualizar ciudad en la fecha
    document.getElementById('ciudadFechaDisplay').textContent = data.ciudad;

    // Mostrar el contrato y ocultar el formulario
    document.querySelector('.formulario-comodato').style.display = 'none';
    const contratoContainer = document.querySelector('.comodato-container');
    contratoContainer.style.display = 'block';
    contratoContainer.classList.add('show');

    // Configurar fecha
    setCurrentDate();

    // Inicializar signature pads
    setTimeout(() => {
        initSignaturePads();
    }, 100);

    // Scroll al contrato
    document.getElementById('contratoGenerado').scrollIntoView({ behavior: 'smooth' });

    showAlert('Contrato generado exitosamente', 'success');
}

// Función para inicializar signature pads
function initSignaturePads() {
    const canvasComodatario = document.getElementById('signatureComodatario');
    const canvasComodante = document.getElementById('signatureComodante');

    if (canvasComodatario && !signatureComodatario) {
        signatureComodatario = new SignaturePad(canvasComodatario, {
            backgroundColor: 'rgba(255, 255, 255, 0)',
            penColor: 'rgb(0, 0, 0)',
            minWidth: 0.5,
            maxWidth: 2.5,
            throttle: 16,
            minDistance: 5,
        });
    }

    if (canvasComodante && !signatureComodante) {
        signatureComodante = new SignaturePad(canvasComodante, {
            backgroundColor: 'rgba(255, 255, 255, 0)',
            penColor: 'rgb(0, 0, 0)',
            minWidth: 0.5,
            maxWidth: 2.5,
            throttle: 16,
            minDistance: 5,
        });
    }

    // Ajustar tamaño inicial
    setTimeout(() => {
        resizeCanvas();
    }, 100);
}

// Función para limpiar firma
function clearSignature(canvasId) {
    if (canvasId === 'signatureComodatario' && signatureComodatario) {
        signatureComodatario.clear();
    } else if (canvasId === 'signatureComodante' && signatureComodante) {
        signatureComodante.clear();
    }
}

// NUEVA FUNCIÓN: Guardar contrato completo con documentos
function saveCompleteContract() {
    try {
        // Obtener datos del contrato
        const contractData = {
            timestamp: new Date().toISOString(),
            numeroContrato: document.querySelector('#contratoGenerado input[placeholder="1302"]')?.value || 'N/A',
            comodatario: {
                nombre: document.getElementById('nombreContrato')?.textContent || 'N/A',
                cedula: document.getElementById('cedulaContrato')?.textContent || 'N/A',
                direccion: document.querySelector('.signature-box .signature-field:has(label[textContent*="DIRECCIÓN"]) input')?.value || 'N/A',
                telefono: document.querySelector('.signature-box .signature-field:has(label[textContent*="CELULAR"]) input')?.value || 'N/A'
            },
            bienes: {
                descripcion: document.querySelector('#contratoGenerado input[placeholder*="bienes entregados"]')?.value || 'N/A',
                valor: document.querySelector('#contratoGenerado input[placeholder="VALOR"]')?.value || 'N/A',
                duracion: document.querySelector('#contratoGenerado input[placeholder="DÍAS"]')?.value || 'N/A'
            },
            firmas: {
                comodatario: document.getElementById('firmaComodatarioImg')?.src || null,
                comodante: signatureComodante && !signatureComodante.isEmpty() ? signatureComodante.toDataURL() : null
            },
            documentos: getAllDocuments(),
            ciudad: document.getElementById('ciudadFechaDisplay')?.textContent || 'N/A',
            representanteLegal: document.getElementById('contratoRepresentanteLegal')?.value || 'N/A'
        };

        // Simular guardado (aquí conectarías con tu backend)
        console.log('Guardando contrato completo:', contractData);
        
        // Crear un archivo JSON con toda la información
        const jsonData = JSON.stringify(contractData, null, 2);
        const blob = new Blob([jsonData], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        // Crear link de descarga
        const downloadLink = document.createElement('a');
        downloadLink.href = url;
        downloadLink.download = `contrato_${contractData.numeroContrato}_${new Date().toISOString().split('T')[0]}.json`;
        downloadLink.style.display = 'none';
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
        
        URL.revokeObjectURL(url);
        
        showAlert('Contrato guardado exitosamente', 'success');
        
    } catch (error) {
        console.error('Error al guardar:', error);
        showAlert('Error al guardar contrato: ' + error.message, 'error');
    }
}

// Función para guardar firmas
function saveSignatures() {
    if (!signatureComodatario || !signatureComodante) {
        showAlert('Error: Firmas no inicializadas correctamente.', 'error');
        return;
    }

    const firmaComodatario = signatureComodatario.isEmpty() ? null : signatureComodatario.toDataURL();
    const firmaComodante = signatureComodante.isEmpty() ? null : signatureComodante.toDataURL();

    if (!firmaComodatario && !firmaComodante) {
        showAlert('Por favor, agregue al menos una firma antes de guardar.', 'error');
        return;
    }

    const data = {
        firma_comodatario: firmaComodatario,
        firma_comodante: firmaComodante,
        timestamp: new Date().toISOString()
    };

    try {
        // Simular guardado
        console.log('Firmas guardadas:', data);
        showAlert('Firmas guardadas correctamente!', 'success');

        // Aquí puedes agregar código para enviar al servidor
        // fetch('/api/guardar-firmas', { method: 'POST', body: JSON.stringify(data) })

    } catch (error) {
        showAlert('Error al guardar firmas', 'error');
        console.error('Error:', error);
    }
}

// Función para ajustar tamaño de canvas
function resizeCanvas() {
    if (!signatureComodatario || !signatureComodante) return;

    const ratio = Math.max(window.devicePixelRatio || 1, 1);

    [signatureComodatario, signatureComodante].forEach(signaturePad => {
        const canvas = signaturePad.canvas;
        const rect = canvas.getBoundingClientRect();

        canvas.width = rect.width * ratio;
        canvas.height = rect.height * ratio;
        canvas.getContext('2d').scale(ratio, ratio);

        signaturePad.clear();
    });
}

// Función para editar contrato
function editContract() {
    document.getElementById('contratoGenerado').style.display = 'none';
    document.querySelector('.formulario-comodato').style.display = 'block';
    document.querySelector('.formulario-comodato').scrollIntoView({ behavior: 'smooth' });
}

// Función para formatear números
function formatNumber(input) {
    // Remover formato previo y mantener solo números
    const value = input.value.replace(/[^\d]/g, '');
    
    // Solo formatear si hay valor
    if (value) {
        const formatted = Number(value).toLocaleString('es-CO');
        input.value = formatted;
    }
    
    // Guardar el valor sin formato en un atributo data para uso posterior
    input.setAttribute('data-raw-value', value);
}

// Función para obtener valor numérico real
function getRawValue(input) {
    return input.getAttribute('data-raw-value') || input.value.replace(/[^\d]/g, '');
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
                `<div class="document-preview pdf-preview">📄</div>`;
            
            docElement.innerHTML = `
                <div class="document-content">
                    ${preview}
                    <div class="document-info">
                        <div class="document-name">${doc.name}</div>
                        <div class="document-details">
                            <span class="document-type">${doc.type === 'camera' ? '📷' : '📁'}</span>
                            <span class="document-size">${formatFileSize(doc.size)}</span>
                        </div>
                    </div>
                    <button class="document-remove" onclick="removeDocument(${index})">❌</button>
                </div>
            `;
        };
        
        if (doc.file.type.startsWith('image/')) {
            reader.readAsDataURL(doc.file);
        } else {
            // Para PDFs, mostrar icono
            docElement.innerHTML = `
                <div class="document-content">
                    <div class="document-preview pdf-preview">📄</div>
                    <div class="document-info">
                        <div class="document-name">${doc.name}</div>
                        <div class="document-details">
                            <span class="document-type">${doc.type === 'camera' ? '📷' : '📁'}</span>
                            <span class="document-size">${formatFileSize(doc.size)}</span>
                        </div>
                    </div>
                    <button class="document-remove" onclick="removeDocument(${index})">❌</button>
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

// Función para obtener todos los documentos
function getAllDocuments() {
    return {
        count: documentFiles.length,
        totalSize: documentFiles.reduce((total, doc) => total + doc.size, 0),
        documents: documentFiles
    };
}

// Función para limpiar todos los documentos
function clearAllDocuments() {
    if (documentFiles.length === 0) {
        showAlert('No hay documentos para eliminar', 'error');
        return;
    }
    
    if (confirm(`¿Está seguro de que desea eliminar todos los ${documentFiles.length} documentos?`)) {
        documentFiles = [];
        updateDocumentsGrid();
        showAlert('Todos los documentos han sido eliminados', 'success');
    }
}

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

// Eventos del DOM
document.addEventListener('DOMContentLoaded', function () {
    // Agregar event listener al formulario
    document.getElementById('comodatoForm').addEventListener('submit', generateContract);

    // Formatear campos numéricos
    const numberInputs = document.querySelectorAll('#valorBienes, #porcentajePenalizacion');
    numberInputs.forEach(input => {
        input.addEventListener('input', function (e) {
            this.value = this.value.replace(/[^\d]/g, '');
        });
        
        input.addEventListener('blur', function() {
            if (this.value) {
                formatNumber(this);
            }
        });
    });

    // Auto-generar número de contrato
    const numeroContrato = document.getElementById('numeroContrato');
    if (numeroContrato && !numeroContrato.value) {
        numeroContrato.value = Math.floor(Math.random() * 9000) + 1000;
    }

    // Agregar validación en tiempo real
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

// Ajustar canvas al redimensionar ventana
window.addEventListener('resize', function () {
    setTimeout(resizeCanvas, 100);
});

// Limpiar recursos al cerrar/recargar página
window.addEventListener('beforeunload', function() {
    if (currentCameraStream) {
        currentCameraStream.getTracks().forEach(track => track.stop());
    }
});
// Función para guardar contrato como documento
// Función mejorada para guardar contrato como documento
function saveContractAsDocument() {
    try {
        // Mostrar indicador de carga
        showAlert('Generando documento del contrato...', 'info');
        
        // Obtener el contenedor del contrato
        const contratoContainer = document.getElementById('contratoGenerado');
        
        // Ocultar temporalmente los botones de acción para la captura
        const contractActions = contratoContainer.querySelector('.contract-actions');
        const originalDisplay = contractActions.style.display;
        contractActions.style.display = 'none';
        
        // Usar html2canvas para capturar el contrato
        html2canvas(contratoContainer, {
            scale: 2,
            useCORS: true,
            backgroundColor: '#ffffff',
            height: contratoContainer.scrollHeight,
            width: contratoContainer.scrollWidth,
            scrollX: 0,
            scrollY: 0
        }).then(canvas => {
            // Restaurar los botones
            contractActions.style.display = originalDisplay;
            
            // Convertir canvas a blob
            canvas.toBlob(function(blob) {
                if (blob) {
                    // Obtener número de contrato para el nombre del archivo
                    const numeroContrato = document.querySelector('#contratoGenerado input[placeholder="1302"]')?.value || 'sin-numero';
                    const fechaActual = new Date().toISOString().split('T')[0];
                    const fileName = `contrato_${numeroContrato}_${fechaActual}.png`;
                    
                    // Crear archivo
                    const file = new File([blob], fileName, { 
                        type: 'image/png',
                        lastModified: Date.now()
                    });
                    
                    // Agregar a la lista de documentos
                    documentFiles.push({
                        file: file,
                        name: fileName,
                        type: 'contract',
                        timestamp: new Date().toISOString(),
                        size: blob.size
                    });
                    
                    // Actualizar interfaz de documentos
                    updateDocumentsGrid();
                    
                    showAlert('Contrato guardado exitosamente. Mostrando sección de documentos...', 'success');
                    
                    // NUEVO: Navegar de vuelta al formulario y mostrar sección de documentos
                    setTimeout(() => {
                        navigateToDocumentsSection();
                    }, 1000);
                    
                } else {
                    showAlert('Error al generar el documento del contrato', 'error');
                }
            }, 'image/png', 0.95);
            
        }).catch(error => {
            // Restaurar los botones en caso de error
            contractActions.style.display = originalDisplay;
            console.error('Error al capturar contrato:', error);
            showAlert('Error al guardar contrato: ' + error.message, 'error');
        });
        
    } catch (error) {
        console.error('Error en saveContractAsDocument:', error);
        showAlert('Error al guardar contrato: ' + error.message, 'error');
    }
}


// Actualizar la función updateDocumentsGrid para mostrar el tipo de documento
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
                `<div class="document-preview pdf-preview">📄</div>`;
            
            // Determinar icono según el tipo
            let typeIcon = '📁';
            if (doc.type === 'camera') typeIcon = '📷';
            else if (doc.type === 'contract') typeIcon = '📋';
            
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
                    <button class="document-remove" onclick="removeDocument(${index})">❌</button>
                </div>
            `;
        };
        
        if (doc.file.type.startsWith('image/')) {
            reader.readAsDataURL(doc.file);
        } else {
            // Para PDFs, mostrar icono
            let typeIcon = '📁';
            if (doc.type === 'camera') typeIcon = '📷';
            else if (doc.type === 'contract') typeIcon = '📋';
            
            docElement.innerHTML = `
                <div class="document-content">
                    <div class="document-preview pdf-preview">📄</div>
                    <div class="document-info">
                        <div class="document-name">${doc.name}</div>
                        <div class="document-details">
                            <span class="document-type">${typeIcon}</span>
                            <span class="document-size">${formatFileSize(doc.size)}</span>
                        </div>
                    </div>
                    <button class="document-remove" onclick="removeDocument(${index})">❌</button>
                </div>
            `;
        }
        
        grid.appendChild(docElement);
    });
    
    // Actualizar contador
    counter.textContent = `${documentFiles.length} documento${documentFiles.length !== 1 ? 's' : ''} adjunto${documentFiles.length !== 1 ? 's' : ''}`;
}
// NUEVA FUNCIÓN: Navegar a la sección de documentos
function navigateToDocumentsSection() {
    // Ocultar el contrato generado
    const contratoContainer = document.querySelector('.comodato-container');
    contratoContainer.style.display = 'none';
    contratoContainer.classList.remove('show');
    
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
        
        // Opcional: Agregar efecto visual para destacar la sección
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
    
    showAlert('Contrato guardado en documentos. Puede continuar agregando más archivos.', 'success');
}
/// Función para registrar firmas y contrato
function registrarFirmasYContrato() {
    const form = document.getElementById('comodatoForm');
    const formData = new FormData(form);
    
    // Obtener datos del formulario
    const contratoData = {
        nombreCompleto: formData.get('nombreCompleto'),
        cedula: formData.get('cedula'),
        direccion: formData.get('direccion'),
        telefono: formData.get('telefono'),
        ciudad: formData.get('ciudad'),
        email: formData.get('email'),
        duracionDias: formData.get('duracionDias'),
        diasDevolucion: formData.get('diasDevolucion'),
        representanteLegal: formData.get('representanteLegal'),
        descripcionBienes: formData.get('descripcionBienes'),
        valorBienes: formData.get('valorBienes'),
        firmaBase64: document.getElementById('firmaBase64').value
    };
    
    // Validar campos requeridos
    const camposRequeridos = ['nombreCompleto', 'cedula', 'direccion', 'telefono', 'ciudad', 'duracionDias', 'descripcionBienes', 'valorBienes'];
    
    for (const campo of camposRequeridos) {
        if (!contratoData[campo] || contratoData[campo].trim() === '') {
            showAlert(`El campo ${campo} es requerido`, 'error');
            return;
        }
    }
    
    showAlert('Procesando registro...', 'info');
    
    // Preparar datos para enviar
    const datosEnvio = {
        contrato_data: contratoData,
        firma_comodatario: contratoData.firmaBase64
    };
    
    console.log('DEBUG: Datos enviados al backend:', datosEnvio);
    
    // Enviar datos
    fetch('/firmas/comodato/guardar_firma', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify(datosEnvio)
    })
    .then(response => {
        console.log('DEBUG: Status de respuesta:', response.status);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        console.log('DEBUG: Respuesta del servidor:', data);
        
        if (data.success) {
            showAlert(data.message, 'success');
            
            if (data.contrato_id) {
                console.log('Contrato registrado con ID:', data.contrato_id);
            }
            
            if (data.firma_id) {
                console.log('Firma guardada con ID:', data.firma_id);
            }

            
        } else {
            showAlert(data.message, 'error');
        }
    })
    .catch(error => {
        console.error('ERROR:', error);
        showAlert('Error al procesar la solicitud: ' + error.message, 'error');
    });
}

// Función para registrar solo contrato
function registrarSoloContrato() {
    const form = document.getElementById('comodatoForm');
    const formData = new FormData(form);
    
   const contratoData = {
        nombreCompleto: formData.get('nombreCompleto'),
        cedula: formData.get('cedula'),
        direccion: formData.get('direccion'),
        telefono: formData.get('telefono'),
        ciudad: formData.get('ciudad'),
        email: formData.get('email'),
        duracionDias: formData.get('duracionDias'),
        diasDevolucion: formData.get('diasDevolucion'),
        representanteLegal: formData.get('representanteLegal'),
        descripcionBienes: formData.get('descripcionBienes'),
        valorBienes: getRawValue(document.getElementById('valorBienes')) || formData.get('valorBienes'),
        firmaBase64: '' // Sin firma
    };
    
    // Validar campos requeridos
    const camposRequeridos = ['nombreCompleto', 'cedula', 'direccion', 'telefono', 'ciudad', 'duracionDias', 'descripcionBienes', 'valorBienes'];
    
    for (const campo of camposRequeridos) {
        if (!contratoData[campo] || contratoData[campo].trim() === '') {
            showAlert(`El campo ${campo} es requerido`, 'error');
            return;
        }
    }
    
    showAlert('Procesando registro...', 'info');
    
    fetch('/firmas/comodato/registrar_contrato', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify(contratoData)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        mostrarLoading(false);
        
        if (data.success) {
            mostrarAlerta(data.message, 'success');
            console.log('Contrato registrado:', data.contrato_id);
        } else {
            mostrarAlerta(data.message, 'error');
        }
    })
    .catch(error => {
        mostrarLoading(false);
        console.error('Error:', error);
        mostrarAlerta('Error al procesar la solicitud: ' + error.message, 'error');
    });
}

// Función para mostrar alertas
function mostrarAlerta(mensaje, tipo = 'info') {
    const alertContainer = document.getElementById('alertContainer');
    if (!alertContainer) {
        console.error('No se encontró el contenedor de alertas');
        return;
    }
    
    const alertClass = tipo === 'success' ? 'alert-success' : 
                     tipo === 'error' ? 'alert-danger' : 'alert-info';
    
    const alertHTML = `
        <div class="alert ${alertClass} alert-dismissible fade show" role="alert">
            ${mensaje}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        </div>
    `;
    
    alertContainer.innerHTML = alertHTML;
    
    setTimeout(() => {
        const alert = alertContainer.querySelector('.alert');
        if (alert) {
            alert.remove();
        }
    }, 5000);
}

// Función para mostrar/ocultar loading
function mostrarLoading(mostrar) {
    const loadingOverlay = document.getElementById('loadingOverlay');
    if (loadingOverlay) {
        loadingOverlay.style.display = mostrar ? 'flex' : 'none';
    }
}

// Función para confirmar registro
function confirmarRegistro() {
    cerrarModalConfirmar();
    
    const firmaBase64 = document.getElementById('firmaBase64').value;
    const hasSignature = firmaBase64 && firmaBase64.trim() !== '';
    
    if (hasSignature) {
        registrarFirmasYContrato();
    } else {
        registrarSoloContrato();
    }
}

// Función para cerrar modal
function cerrarModalConfirmar() {
    const modal = document.getElementById('confirmModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

// Función para abrir modal
function abrirModalConfirmar() {
    const modal = document.getElementById('confirmModal');
    if (modal) {
        modal.style.display = 'flex';
    }
}
