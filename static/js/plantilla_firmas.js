/**
 * Funcionalidad para la visualización de la plantilla de firmas
 */
document.addEventListener('DOMContentLoaded', function() {
    // Inicializar la visualización del patrón si existe
    initPatronDisplay();
    
    // Botón de impresión
    const printButton = document.querySelector('.print-button');
    if (printButton) {
        printButton.addEventListener('click', function() {
            window.print();
        });
    }
    
    /**
     * Inicializa la visualización del patrón de desbloqueo
     */
    function initPatronDisplay() {
        const patronContainer = document.getElementById('patron_container');
        if (!patronContainer) return;
        
        const patronData = patronContainer.dataset.patron;
        if (!patronData || patronData.trim() === '') return;
        
        try {
            // Convertir el patrón de string a array
            const patronArray = patronData.split(',').map(p => parseInt(p.trim()));
            if (patronArray.length === 0) return;
            
            // Crear el canvas para mostrar el patrón
            const patronDisplay = document.getElementById('patron_display');
            if (!patronDisplay) return;
            
            const canvas = document.createElement('canvas');
            canvas.width = 150;
            canvas.height = 150;
            patronDisplay.appendChild(canvas);
            
            // Dibujar el patrón
            const ctx = canvas.getContext('2d');
            const gridSize = 3; // Tamaño estándar de la cuadrícula
            const nodeSize = 15;
            const margin = 20;
            const spacing = (canvas.width - 2 * margin) / (gridSize - 1);
            
            // Fondo del canvas
            ctx.fillStyle = '#f9fafb';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            // Dibujar los nodos
            ctx.fillStyle = '#3b82f6';
            for (let y = 0; y < gridSize; y++) {
                for (let x = 0; x < gridSize; x++) {
                    const centerX = margin + x * spacing;
                    const centerY = margin + y * spacing;
                    
                    ctx.beginPath();
                    ctx.arc(centerX, centerY, nodeSize / 2, 0, 2 * Math.PI);
                    ctx.fill();
                }
            }
            
            // Dibujar las líneas del patrón
            if (patronArray.length > 1) {
                ctx.strokeStyle = '#3b82f6';
                ctx.lineWidth = 4;
                ctx.beginPath();
                
                for (let i = 0; i < patronArray.length; i++) {
                    const nodeIndex = patronArray[i];
                    const x = nodeIndex % gridSize;
                    const y = Math.floor(nodeIndex / gridSize);
                    const centerX = margin + x * spacing;
                    const centerY = margin + y * spacing;
                    
                    if (i === 0) {
                        ctx.moveTo(centerX, centerY);
                    } else {
                        ctx.lineTo(centerX, centerY);
                    }
                }
                
                ctx.stroke();
            }
        } catch (error) {
            console.error('Error al renderizar el patrón:', error);
        }
    }
}); 