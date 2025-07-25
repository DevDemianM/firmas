document.addEventListener('DOMContentLoaded', function () {
    console.log('DOM cargado, verificando modal...');
    
    // 1. Verificar que el modal existe
    const modal = document.getElementById('entregaProductoModal');
    if (!modal) {
        console.error('Modal no encontrado');
        return;
    }
    
    // Asegurar que el modal esté oculto inicialmente
    modal.style.display = 'none';
    modal.classList.remove('show');
    modal.setAttribute('aria-hidden', 'true');
    
    // Remover cualquier backdrop que pueda existir
    const existingBackdrop = document.querySelector('.modal-backdrop');
    if (existingBackdrop) {
        existingBackdrop.remove();
    }
    
    // Asegurar que el body no tenga clases de modal
    document.body.classList.remove('modal-open');
    document.body.style.paddingRight = '';
    
    console.log('Modal inicializado correctamente como oculto');
    
    // 2. Buscar el botón por su ID correcto
    const botonModal = document.getElementById('abrirModalEntrega');
    if (!botonModal) {
        console.error('Botón para abrir modal no encontrado');
        return;
    }
    
    // Agregar evento click para abrir el modal
    botonModal.addEventListener('click', function(e) {
        e.preventDefault();
        console.log('Botón clickeado - abriendo modal manualmente');
        
        // Copiar datos del formulario principal al modal
        copyMainFormToModal();
        
        // Abrir modal
        if (typeof bootstrap !== 'undefined' && bootstrap.Modal) {
            const modalInstance = new bootstrap.Modal(modal, {
                backdrop: true,
                keyboard: true
            });
            modalInstance.show();
        } else {
            openModalManually();
        }
    });
    
    console.log('Botón configurado correctamente');
    
    // 3. Configurar el formulario de entrega - SOLO UNA VEZ
    const entregaForm = document.getElementById('entregaProductoForm');
    if (entregaForm) {
        entregaForm.addEventListener('submit', function(e) {
            e.preventDefault();
            console.log('Procesando formulario de entrega...');
            
            // Procesar formulario
            const formData = new FormData(entregaForm);
            const json = JSON.stringify(Object.fromEntries(formData.entries()), null, 2);
            const blob = new Blob([json], {type: 'application/json'});
            const fileName = `entrega_producto_${Date.now()}.json`;
            const file = new File([blob], fileName, {type: 'application/json'});
            
            // Agregar a documentFiles si existe
            if (typeof documentFiles !== 'undefined') {
                documentFiles.push({
                    file: file,
                    name: fileName,
                    type: 'entrega_producto',
                    timestamp: new Date().toISOString(),
                    size: blob.size
                });
                
                if (typeof updateDocumentsGrid === 'function') {
                    updateDocumentsGrid();
                }
            }
            
            // Mostrar alerta
            if (typeof showAlert === 'function') {
                showAlert('Entrega de producto agregada a documentos', 'success');
            }
            
            // Cerrar modal
            closeModal();
            
            // Limpiar formulario
            entregaForm.reset();
            
            console.log('Formulario procesado y modal cerrado');
        });
    }
    
    // 4. Configurar botón de cerrar
    const closeButton = modal.querySelector('.btn-close');
    if (closeButton) {
        closeButton.addEventListener('click', function() {
            closeModal();
        });
    }
    
    // 5. Cerrar modal al hacer click en el backdrop
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            closeModal();
        }
    });
    
    // 6. Cerrar con Escape
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && modal.classList.contains('show')) {
            closeModal();
        }
    });
    
    console.log('Configuración del modal completada');
    
    // Funciones auxiliares
    function copyMainFormToModal() {
        const mainForm = document.getElementById('comodatoForm');
        const modalForm = document.getElementById('entregaProductoForm');
        
        if (!mainForm || !modalForm) return;
        
        // Mapeo de campos del formulario principal al modal
        const fieldMapping = {
            'nombreCompleto': 'nombreCompleto',
            'cedula': 'cedula',
            'direccion': 'direccion',
            'telefono': 'telefono',
            'ciudad': 'ciudad',
            'email': 'email',
            'numeroContrato': 'numeroContrato',
            'duracionDias': 'duracionDias',
            'diasDevolucion': 'diasDevolucion',
            'representanteLegal': 'representanteLegal',
            'descripcionBienes': 'descripcionBienes',
            'valorBienes': 'valorBienes',
            'porcentajePenalizacion': 'porcentajePenalizacion'
        };
        
        // Copiar valores de campos
        for (const [mainField, modalField] of Object.entries(fieldMapping)) {
            const mainInput = mainForm.querySelector(`[name="${mainField}"]`);
            const modalInput = modalForm.querySelector(`[name="${modalField}"]`);
            
            if (mainInput && modalInput) {
                modalInput.value = mainInput.value;
            }
        }
        
        // Copiar firma
        const firmaBase64 = document.getElementById('firmaBase64');
        const modalFirmaBase64 = modalForm.querySelector('[name="firmaBase64"]');
        
        if (firmaBase64 && modalFirmaBase64) {
            modalFirmaBase64.value = firmaBase64.value;
        }
        
        // Copiar preview de firma si existe
        const firmaPreview = document.getElementById('firmaPreview');
        const modalFirmaPreview = modalForm.querySelector('#firmaPreviewModal');
        
        if (firmaPreview && modalFirmaPreview && firmaPreview.innerHTML) {
            modalFirmaPreview.innerHTML = firmaPreview.innerHTML;
        }
        
        // Copiar documentos adjuntos
        if (typeof documentFiles !== 'undefined') {
            const modalDocumentsInfo = modalForm.querySelector('#documentosInfo');
            if (modalDocumentsInfo) {
                modalDocumentsInfo.innerHTML = `<p>${documentFiles.length} documentos adjuntos del formulario principal</p>`;
            }
        }
        
        console.log('Datos copiados del formulario principal al modal');
    }
    
    function closeModal() {
        if (typeof bootstrap !== 'undefined' && bootstrap.Modal) {
            const modalInstance = bootstrap.Modal.getInstance(modal);
            if (modalInstance) {
                modalInstance.hide();
            }
        } else {
            closeModalManually();
        }
    }
});

// Función de emergencia para resetear el modal
function resetModal() {
    closeModalManually();
    console.log('Modal reseteado manualmente');
}