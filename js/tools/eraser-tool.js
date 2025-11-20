export class EraserTool {
    constructor(canvasManager, layerManager) {
        this.canvasManager = canvasManager;
        this.layerManager = layerManager;
        this.isErasing = false;
        this.lastX = 0;
        this.lastY = 0;
        this.size = 20;
        this.smoothness = 0;

        this.cursor = document.getElementById('brush-cursor');

        // Bind smoothness input (shared)
        const smoothnessInput = document.getElementById('brush-smoothness');
        if (smoothnessInput) {
            smoothnessInput.addEventListener('input', (e) => {
                this.smoothness = parseInt(e.target.value) / 100;
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

        layer.ctx.beginPath();
        layer.ctx.moveTo(this.lastX, this.lastY);
        layer.ctx.lineCap = 'round';
        layer.ctx.lineJoin = 'round';
        layer.ctx.lineWidth = this.size / layer.scale;
        layer.ctx.globalCompositeOperation = 'destination-out';
        layer.ctx.globalAlpha = 1;
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

        let tCoords = this.getTransformedCoords(coords, layer);

        // Smoothing Logic
        if (this.smoothness > 0) {
            const factor = 1 - this.smoothness;
            const nextX = this.lastX + (tCoords.x - this.lastX) * factor;
            const nextY = this.lastY + (tCoords.y - this.lastY) * factor;
            tCoords = { x: nextX, y: nextY };
        }

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
            }
        }
    }

    mouseleave(coords) {
        this.mouseup(coords);
        if (this.cursor) this.cursor.style.display = 'none';
    }
}
