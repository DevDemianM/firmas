// Configuración de canvas para firmas
let isDrawing = false;
let canvases = ['mandanteCanvas', 'mandatarioCanvas'];

canvases.forEach(canvasId => {
    const canvas = document.getElementById(canvasId);
    const ctx = canvas.getContext('2d');
    
    // Configurar canvas
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';

    // Eventos de mouse
    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', stopDrawing);
    canvas.addEventListener('mouseout', stopDrawing);

    // Eventos touch para tablets
    canvas.addEventListener('touchstart', handleTouch);
    canvas.addEventListener('touchmove', handleTouch);
    canvas.addEventListener('touchend', stopDrawing);

    function startDrawing(e) {
        isDrawing = true;
        const rect = canvas.getBoundingClientRect();
        ctx.beginPath();
        ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
    }

    function draw(e) {
        if (!isDrawing) return;
        const rect = canvas.getBoundingClientRect();
        ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
        ctx.stroke();
    }

    function stopDrawing() {
        isDrawing = false;
    }

    function handleTouch(e) {
        e.preventDefault();
        const touch = e.touches[0];
        const mouseEvent = new MouseEvent(
            e.type === 'touchstart' ? 'mousedown' : 
            e.type === 'touchmove' ? 'mousemove' : 'mouseup', {
                clientX: touch.clientX,
                clientY: touch.clientY
        });
        canvas.dispatchEvent(mouseEvent);
    }
});

function clearCanvas(canvasId) {
    const canvas = document.getElementById(canvasId);
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

// Actualizar información automáticamente
document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('mandatoForm');
    
    // Actualizar información del mandante en tiempo real
    form.addEventListener('input', function(e) {
        const name = e.target.name;
        const value = e.target.value;
        
        switch(name) {
            case 'nombre_completo':
                document.getElementById('mandante_nombre').textContent = value || '_________________';
                break;
            case 'cedula':
                document.getElementById('mandante_id').textContent = value || '_________________';
                break;
            case 'direccion':
                document.getElementById('mandante_direccion').textContent = value || '_________________';
                break;
            case 'telefono':
                document.getElementById('mandante_celular').textContent = value || '_________________';
                break;
            case 'representante':
                document.getElementById('representante_legal').textContent = value || '_________________';
                break;
        }
    });

    // Envío del formulario
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Obtener firmas en base64
        const mandanteSignature = document.getElementById('mandanteCanvas').toDataURL();
        const mandatarioSignature = document.getElementById('mandatarioCanvas').toDataURL();
        
        // Obtener datos del formulario
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());
        
        // Agregar firmas
        data.firma_mandante = mandanteSignature;
        data.firma_mandatario = mandatarioSignature;
        
        // Generar contrato
        generateContract(data);
    });
});

function generateContract(data) {
    const contractHTML = `
        <div class="contract-header">
            <h1 class="contract-title">CONTRATO DE MANDATO SIN REPRESENTACIÓN</h1>
            <p class="contract-number-display">N° ${data.numero_contrato}</p>
            <p>Venta de celulares - Recibimos el pago en forma de pago</p>
            <p>Ciudad: ${data.ciudad} - Fecha: ${new Date().toLocaleDateString()}</p>
        </div>
        
        <div class="contract-content">
            <p>Entre los suscritos, por una parte <strong>MICELU.CO S.A.S</strong> identificada con NIT 901.530.467-8, quien en adelante se denominará el <strong>MANDATARIO</strong> de una parte, y por la otra <strong>${data.nombre_completo}</strong>, identificado con cédula de ciudadanía No. ${data.cedula}, actuando en representación propia, y quien para los efectos del presente contrato se denominará el <strong>MANDANTE</strong>. Hemos acordado celebrar el presente contrato de mandato sin representación, el cual se regirá por las siguientes cláusulas:</p>
            
            <p><strong>PRIMERA: DISPOSICIONES GENERALES.</strong> El presente contrato de mandato surge como consecuencia de una compraventa previamente realizada entre el <strong>MANDANTE</strong> y el <strong>MANDATARIO</strong>, en donde el <strong>MANDANTE</strong> adquirió un equipo tecnológico que era propiedad del <strong>MANDATARIO</strong>, entregándolo a éste como forma de pago, para su administración temporal conforme a las cláusulas contenidas en el presente contrato de mandato.</p>
            
            <p><strong>SEGUNDA: OBJETO DEL CONTRATO.</strong> El <strong>MANDANTE</strong> autoriza expresamente al <strong>MANDATARIO</strong> para vender el equipo tecnológico, lo cual implica: buscar, contactar y recibir el dinero procedente de cualquier transacción que se pueda realizar con el equipo tecnológico de propiedad del <strong>MANDANTE</strong>.</p>
            
            <p><strong>TERCERA: REMUNERACIÓN.</strong> La remuneración del <strong>MANDATARIO</strong> corresponde a una comisión por la venta del equipo tecnológico entregado por el <strong>MANDANTE</strong>.</p>
            
            <p><strong>CUARTA: OBLIGACIONES DEL MANDANTE.</strong> El <strong>MANDANTE</strong> se obliga a suministrar al <strong>MANDATARIO</strong> junto con el equipo tecnológico la factura de venta original del equipo o la documentación correspondiente, el cual da fe de que el equipo se encuentra como una declaración voluntaria bajo la gravedad del juramento y con el conocimiento de las consecuencias penales por el delito de falso testimonio.</p>
            
            <p><strong>QUINTA: OBLIGACIÓN DEL MANDANTE DE COMPARECER ANTE LAS AUTORIDADES.</strong> En virtud del deber del <strong>MANDANTE</strong> de dar fe de la procedencia lícita del equipo tecnológico suministrado para su administración temporal, con ocasión del presente contrato, se corrobora que el equipo tecnológico suministrado por el <strong>MANDANTE</strong> es objeto de denuncia penal.</p>
            
            <p><strong>SEXTA: RELEVO DEL DEBER DE INFORMACIÓN.</strong> El <strong>MANDATARIO</strong> actúa bajo su propio nombre en la labor de administración, custodia y disposición del equipo tecnológico entregado por el <strong>MANDANTE</strong>.</p>
            
            <p><strong>SÉPTIMA: IRREVOCABILIDAD DEL MANDATO.</strong> El <strong>MANDANTE</strong> acepta expresamente con la suscripción del presente contrato que no podrá revocar el mandato conferido al <strong>MANDATARIO</strong>.</p>
            
            <p><strong>OCTAVA: VIGENCIA DEL CONTRATO DE MANDATO.</strong> El presente contrato cobrará vigencia a partir de la fecha en que se firme por ambas partes y se entenderá contenido por término indefinido.</p>
            
            <p><strong>DETALLES DEL PRODUCTO:</strong></p>
            <ul>
                <li><strong>Producto:</strong> ${data.producto}</li>
                <li><strong>Marca:</strong> ${data.marca_producto}</li>
                <li><strong>IMEI:</strong> ${data.imei}</li>
                <li><strong>Valor del producto:</strong> $${parseInt(data.valor_producto).toLocaleString()}</li>
                <li><strong>Valor de penalización:</strong> $${data.valor_penalizacion ? parseInt(data.valor_penalizacion).toLocaleString() : 'No especificado'}</li>
                <li><strong>Duración:</strong> ${data.duracion} días</li>
            </ul>
        </div>
        
        <div class="contract-parties">
            <div class="party-info">
                <h3 class="party-title">EL MANDANTE</h3>
                <div class="party-details">
                    <p><strong>Nombre:</strong> ${data.nombre_completo}</p>
                    <p><strong>Identificación:</strong> ${data.cedula}</p>
                    <p><strong>Dirección:</strong> ${data.direccion}</p>
                    <p><strong>Celular:</strong> ${data.telefono}</p>
                    <p><strong>Ciudad:</strong> ${data.ciudad}</p>
                    <p><strong>Email:</strong> ${data.email || 'No especificado'}</p>
                </div>
            </div>
            <div class="party-info">
                <h3 class="party-title">EL MANDATARIO</h3>
                <div class="party-details">
                    <p><strong>Empresa:</strong> Micelu.co S.A.S</p>
                    <p><strong>NIT:</strong> 901.530.467-8</p>
                    <p><strong>Dirección:</strong> Carrera 43A No. 30 25 local 1265</p>
                    <p><strong>Representante Legal:</strong> ${data.representante || 'No especificado'}</p>
                </div>
            </div>
        </div>
        
        <div class="contract-signatures">
            <div class="signature-display">
                <h4>FIRMA DEL MANDANTE</h4>
                <img src="${data.firma_mandante}" alt="Firma del Mandante" />
                <div class="signature-line">
                    ${data.nombre_completo}<br>
                    C.C. ${data.cedula}
                </div>
            </div>
            <div class="signature-display">
                <h4>FIRMA DEL MANDATARIO</h4>
                <img src="${data.firma_mandatario}" alt="Firma del Mandatario" />
                <div class="signature-line">
                    Micelu.co S.A.S<br>
                    NIT: 901.530.467-8<br>
                    Rep. Legal: ${data.representante || '_________________'}
                </div>
            </div>
        </div>
    `;
    
    // Mostrar el contrato en el modal
    document.getElementById('contractPreview').innerHTML = contractHTML;
    document.getElementById('contractModal').style.display = 'block';
    
    // Guardar datos del contrato para uso posterior
    window.contractData = data;
}

function closeModal() {
    document.getElementById('contractModal').style.display = 'none';
}

function saveContract() {
    const contractData = window.contractData;
    
    if (!contractData) {
        alert('No hay datos del contrato para guardar.');
        return;
    }
    
    // Crear objeto con toda la información del contrato
    const contractToSave = {
        ...contractData,
        fecha_generacion: new Date().toISOString(),
        numero_contrato: contractData.numero_contrato,
        contrato_html: document.getElementById('contractPreview').innerHTML
    };
    
    // Convertir a JSON para almacenamiento
    const contractJSON = JSON.stringify(contractToSave, null, 2);
    
    // Crear un archivo para descarga
    const blob = new Blob([contractJSON], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `contrato_mandato_${contractData.numero_contrato}_${contractData.nombre_completo.replace(/\s+/g, '_')}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    // También podrías enviar al servidor aquí
    console.log('Contrato guardado:', contractToSave);
    
    // Mostrar mensaje de éxito
    alert('Contrato guardado exitosamente');
    
    // Cerrar modal
    closeModal();
    
    // Opcionalmente, limpiar el formulario
    if (confirm('¿Desea limpiar el formulario para crear un nuevo contrato?')) {
        document.getElementById('mandatoForm').reset();
        clearCanvas('mandanteCanvas');
        clearCanvas('mandatarioCanvas');
        
        // Limpiar información mostrada
        document.getElementById('mandante_nombre').textContent = '_________________';
        document.getElementById('mandante_id').textContent = '_________________';
        document.getElementById('mandante_direccion').textContent = '_________________';
        document.getElementById('mandante_celular').textContent = '_________________';
        document.getElementById('representante_legal').textContent = '_________________';
    }
}

// Cerrar modal al hacer clic fuera de él
window.onclick = function(event) {
    const modal = document.getElementById('contractModal');
    if (event.target === modal) {
        closeModal();
    }
};
