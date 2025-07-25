/**
 * Simple Pattern Lock - Patrón de desbloqueo reutilizable
 * Sin dependencias externas, JavaScript puro
 */
class SimplePatternLock {
    constructor(container, options = {}) {
        this.container = container;
        this.options = {
            size: options.size || 3,
            nodeSize: options.nodeSize || 30,
            nodeColor: options.nodeColor || '#444',
            activeColor: options.activeColor || '#fff',
            lineColor: options.lineColor || '#222',
            lineWidth: options.lineWidth || 4,
            onDraw: options.onDraw || null,
            margin: options.margin || 20
        };
        
        this.nodes = [];
        this.pattern = [];
        this.isDrawing = false;
        this.currentPath = [];
        
        this.init();
    }
    
    init() {
        // Configurar el contenedor
        this.container.style.position = 'relative';
        this.container.style.width = (this.options.size * (this.options.nodeSize + this.options.margin) + this.options.margin) + 'px';
        this.container.style.height = (this.options.size * (this.options.nodeSize + this.options.margin) + this.options.margin) + 'px';
        
        // Crear el canvas para las líneas
        this.canvas = document.createElement('canvas');
        this.canvas.width = this.container.style.width;
        this.canvas.height = this.container.style.height;
        this.canvas.style.position = 'absolute';
        this.canvas.style.top = '0';
        this.canvas.style.left = '0';
        this.canvas.style.zIndex = '1';
        this.container.appendChild(this.canvas);
        
        this.ctx = this.canvas.getContext('2d');
        
        // Crear los nodos
        for (let row = 0; row < this.options.size; row++) {
            for (let col = 0; col < this.options.size; col++) {
                this.createNode(row, col);
            }
        }
        
        // Agregar event listeners
        this.addEventListeners();
    }
    
    createNode(row, col) {
        const node = document.createElement('div');
        const index = row * this.options.size + col;
        
        node.style.position = 'absolute';
        node.style.width = this.options.nodeSize + 'px';
        node.style.height = this.options.nodeSize + 'px';
        node.style.borderRadius = '50%';
        node.style.backgroundColor = this.options.nodeColor;
        node.style.border = '3px solid #fff';
        node.style.boxShadow = '0 2px 8px rgba(0,0,0,0.2)';
        node.style.cursor = 'pointer';
        node.style.transition = 'all 0.2s ease';
        
        const x = col * (this.options.nodeSize + this.options.margin) + this.options.margin;
        const y = row * (this.options.nodeSize + this.options.margin) + this.options.margin;
        
        node.style.left = x + 'px';
        node.style.top = y + 'px';
        
        node.dataset.index = index;
        node.dataset.x = x + this.options.nodeSize / 2;
        node.dataset.y = y + this.options.nodeSize / 2;
        
        this.container.appendChild(node);
        this.nodes.push(node);
    }
    
    addEventListeners() {
        let isMouseDown = false;
        
        this.container.addEventListener('mousedown', (e) => {
            isMouseDown = true;
            this.startPattern(e);
        });
        
        this.container.addEventListener('mousemove', (e) => {
            if (isMouseDown) {
                this.continuePattern(e);
            }
        });
        
        this.container.addEventListener('mouseup', () => {
            isMouseDown = false;
            this.endPattern();
        });
        
        // Touch events para móviles
        this.container.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.startPattern(e.touches[0]);
        });
        
        this.container.addEventListener('touchmove', (e) => {
            e.preventDefault();
            this.continuePattern(e.touches[0]);
        });
        
        this.container.addEventListener('touchend', (e) => {
            e.preventDefault();
            this.endPattern();
        });
    }
    
    startPattern(event) {
        this.resetPattern();
        
        const node = this.getNodeAtPosition(event.clientX, event.clientY);
        if (node) {
            this.isDrawing = true;
            this.addToPattern(node);
        }
    }
    
    continuePattern(event) {
        if (!this.isDrawing) return;
        
        const node = this.getNodeAtPosition(event.clientX, event.clientY);
        if (node && !this.pattern.includes(parseInt(node.dataset.index))) {
            this.addToPattern(node);
        }
        
        this.drawLines();
    }
    
    endPattern() {
        if (!this.isDrawing) return;
        
        this.isDrawing = false;
        
        if (this.pattern.length > 0) {
            this.drawFinalLines();
            if (this.options.onDraw) {
                this.options.onDraw(this.pattern);
            }
        }
    }
    
    addToPattern(node) {
        const index = parseInt(node.dataset.index);
        this.pattern.push(index);
        
        node.style.backgroundColor = this.options.activeColor;
        node.style.transform = 'scale(1.2)';
        
        this.currentPath.push({
            x: parseInt(node.dataset.x),
            y: parseInt(node.dataset.y)
        });
    }
    
    getNodeAtPosition(clientX, clientY) {
        const rect = this.container.getBoundingClientRect();
        const x = clientX - rect.left;
        const y = clientY - rect.top;
        
        for (const node of this.nodes) {
            const nodeX = parseInt(node.dataset.x);
            const nodeY = parseInt(node.dataset.y);
            const distance = Math.sqrt(Math.pow(nodeX - x, 2) + Math.pow(nodeY - y, 2));
            
            if (distance < this.options.nodeSize / 2) {
                return node;
            }
        }
        
        return null;
    }
    
    drawLines() {
        if (this.currentPath.length < 2) return;
        
        const rect = this.container.getBoundingClientRect();
        const mouseX = event.clientX - rect.left;
        const mouseY = event.clientY - rect.top;
        
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.strokeStyle = this.options.lineColor;
        this.ctx.lineWidth = this.options.lineWidth;
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';
        
        this.ctx.beginPath();
        this.ctx.moveTo(this.currentPath[0].x, this.currentPath[0].y);
        
        for (let i = 1; i < this.currentPath.length; i++) {
            this.ctx.lineTo(this.currentPath[i].x, this.currentPath[i].y);
        }
        
        if (this.isDrawing) {
            this.ctx.lineTo(mouseX, mouseY);
        }
        
        this.ctx.stroke();
    }
    
    drawFinalLines() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.strokeStyle = this.options.lineColor;
        this.ctx.lineWidth = this.options.lineWidth;
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';
        
        this.ctx.beginPath();
        this.ctx.moveTo(this.currentPath[0].x, this.currentPath[0].y);
        
        for (let i = 1; i < this.currentPath.length; i++) {
            this.ctx.lineTo(this.currentPath[i].x, this.currentPath[i].y);
        }
        
        this.ctx.stroke();
    }
    
    resetPattern() {
        this.pattern = [];
        this.currentPath = [];
        this.isDrawing = false;
        
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.nodes.forEach(node => {
            node.style.backgroundColor = this.options.nodeColor;
            node.style.transform = 'scale(1)';
        });
    }
    
    getPattern() {
        return this.pattern;
    }
}

// Modal reutilizable para Pattern Lock
window.initSimplePatternModal = function({
    openBtnId = 'openPatternModal',
    modalId = 'patternModal',
    containerId = 'patternContainer',
    inputId = 'patron',
    statusId = 'patternStatus',
    onPatternSet = null,
    minLength = 4,
    nodeSize = 40
} = {}) {
    const openBtn = document.getElementById(openBtnId);
    const modal = document.getElementById(modalId);
    const closeBtn = document.getElementById('closePatternModal');
    const patternInput = document.getElementById(inputId);
    const patternStatus = document.getElementById(statusId);
    const container = document.getElementById(containerId);
    
    let patternLock;
    
    function openModal() {
        modal.style.display = 'flex';
        setTimeout(() => {
            modal.classList.add('show');
        }, 10);
    }
    
    function closeModal() {
        modal.classList.remove('show');
        setTimeout(() => {
            modal.style.display = 'none';
        }, 300);
    }
    
    function validarPatron(pattern) {
        if (pattern.length < minLength) return false;
        for (let i = 1; i < pattern.length; i++) {
            if (pattern[i] === pattern[i-1]) return false;
        }
        return true;
    }
    
    openBtn.onclick = function() {
        openModal();
        
        patternLock = new SimplePatternLock(container, {
            size: 3,
            nodeSize: nodeSize,
            nodeColor: '#444',
            activeColor: '#fff',
            lineColor: '#222',
            lineWidth: 4,
            margin: 25,
            onDraw: function(pattern) {
                setTimeout(function() {
                    patternInput.value = pattern.join(',');
                    
                    if (pattern.length > 0) {
                        if (validarPatron(pattern)) {
                            patternStatus.style.display = 'inline';
                            patternStatus.style.color = '#10b981';
                            patternStatus.textContent = 'Patrón guardado ✓';
                            patternStatus.style.animation = 'fadeInUp 0.4s ease-out';
                            if (onPatternSet) onPatternSet(pattern);
                        } else {
                            patternStatus.style.display = 'inline';
                            patternStatus.style.color = '#ef4444';
                            patternStatus.textContent = 'Patrón muy simple, dibuja más puntos';
                            patternStatus.style.animation = 'fadeInUp 0.4s ease-out';
                            patternInput.value = '';
                            setTimeout(() => { patternStatus.style.display = 'none'; }, 3000);
                        }
                    } else {
                        patternStatus.style.display = 'none';
                    }
                    
                    closeModal();
                }, 1000);
            }
        });
    };
    
    closeBtn.onclick = function() { closeModal(); };
    window.onclick = function(event) {
        if (event.target == modal) closeModal();
    };
}; 