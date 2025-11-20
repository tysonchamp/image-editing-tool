export class EraserTool {
    constructor(canvasManager, layerManager, selectionManager) {
        this.canvasManager = canvasManager;
        this.layerManager = layerManager;
        this.selectionManager = selectionManager;
        this.isErasing = false;
        this.lastX = 0;
        this.lastY = 0;
        this.size = 20;
        this.smoothness = 0;

        this.cursor = document.getElementById('brush-cursor');

        const smoothnessInput = document.getElementById('brush-smoothness');
        if (smoothnessInput) {
            smoothnessInput.addEventListener('input', (e) => {
                this.smoothness = parseInt(e.target.value) / 100;
                this.updateCursorSize();
            });
        }
    }

    activate() {
        this.canvasManager.canvas.style.cursor = 'none';
        const sizeInput = document.getElementById('brush-size');
        if (sizeInput) this.size = parseInt(sizeInput.value);

        const smoothnessInput = document.getElementById('brush-smoothness');
        if (smoothnessInput) this.smoothness = parseInt(smoothnessInput.value) / 100;

        if (this.cursor) {
            this.cursor.style.display = 'block';
            this.updateCursorSize();
        }
    }

    deactivate() {
        this.canvasManager.canvas.style.cursor = 'default';
        if (this.cursor) this.cursor.style.display = 'none';
    }

    updateCursorSize() {
        if (this.cursor) {
            const zoom = this.canvasManager.scale;
            const displaySize = this.size * zoom;
            this.cursor.style.width = `${displaySize}px`;
            this.cursor.style.height = `${displaySize}px`;

            this.cursor.style.borderColor = 'white'; // Eraser is always white border

            const blur = (this.smoothness * this.size * zoom) / 2;
            // Add black shadow for contrast on white backgrounds
            this.cursor.style.boxShadow = `0 0 2px rgba(0,0,0,0.8), inset 0 0 ${blur}px rgba(0,0,0,0.5)`;
        }
    }

    getTransformedCoords(coords, layer) {
        return {
            x: (coords.x - layer.x) / layer.scale,
            y: (coords.y - layer.y) / layer.scale
        };
    }

    mousedown(coords) {
        const layer = this.layerManager.getActiveLayer();
        if (!layer || !layer.visible) return;

        this.isErasing = true;
        const tCoords = this.getTransformedCoords(coords, layer);
        this.lastX = tCoords.x;
        this.lastY = tCoords.y;

        layer.ctx.save(); // Save state

        if (this.selectionManager && this.selectionManager.hasSelection()) {
            layer.ctx.scale(1 / layer.scale, 1 / layer.scale);
            layer.ctx.translate(-layer.x, -layer.y);
            this.selectionManager.clip(layer.ctx);
            layer.ctx.translate(layer.x, layer.y);
            layer.ctx.scale(layer.scale, layer.scale);
        }

        layer.ctx.beginPath();
        layer.ctx.moveTo(this.lastX, this.lastY);
        layer.ctx.lineCap = 'round';
        layer.ctx.lineJoin = 'round';
        layer.ctx.lineWidth = this.size / layer.scale;
        layer.ctx.globalCompositeOperation = 'destination-out';
        layer.ctx.globalAlpha = 1;

        if (this.smoothness > 0) {
            layer.ctx.shadowBlur = (this.smoothness * this.size) / layer.scale;
            // For eraser (destination-out), shadowColor must be opaque to erase?
            // Actually, destination-out removes pixels.
            // If we draw a shadow, the shadow also removes pixels.
            // So shadowColor should be 'black' (or any color).
            layer.ctx.shadowColor = 'black';
        } else {
            layer.ctx.shadowBlur = 0;
            layer.ctx.shadowColor = 'transparent';
        }
    }

    mousemove(coords, event) {
        if (this.cursor && event) {
            this.cursor.style.left = `${event.clientX}px`;
            this.cursor.style.top = `${event.clientY}px`;
            this.cursor.style.display = 'block';

            const sizeInput = document.getElementById('brush-size');
            if (sizeInput) {
                this.size = parseInt(sizeInput.value);
                this.updateCursorSize();
            }
        }

        if (!this.isErasing) return;

        const layer = this.layerManager.getActiveLayer();
        if (!layer) return;

        layer.ctx.lineWidth = this.size / layer.scale;

        const tCoords = this.getTransformedCoords(coords, layer);

        layer.ctx.lineTo(tCoords.x, tCoords.y);
        layer.ctx.stroke();

        this.lastX = tCoords.x;
        this.lastY = tCoords.y;

        this.canvasManager.render(this.layerManager.layers);
    }

    mouseup(coords) {
        if (this.isErasing) {
            this.isErasing = false;
            const layer = this.layerManager.getActiveLayer();
            if (layer) {
                layer.ctx.closePath();
                layer.ctx.globalCompositeOperation = 'source-over';
                layer.ctx.shadowBlur = 0;
                layer.ctx.shadowColor = 'transparent';
                layer.ctx.restore();
            }
        }
    }

    mouseleave(coords) {
        this.mouseup(coords);
        if (this.cursor) this.cursor.style.display = 'none';
    }
}
