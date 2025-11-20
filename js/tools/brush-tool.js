export class BrushTool {
    constructor(canvasManager, layerManager) {
        this.canvasManager = canvasManager;
        this.layerManager = layerManager;
        this.isDrawing = false;
        this.lastX = 0;
        this.lastY = 0;

        // Properties
        this.size = 10;
        this.color = '#000000';
        this.opacity = 1;

        this.cursor = document.getElementById('brush-cursor');

        // Bind property inputs
        this.bindProperties();
    }

    bindProperties() {
        const sizeInput = document.getElementById('brush-size');
        const sizeVal = document.getElementById('brush-size-val');
        const colorInput = document.getElementById('brush-color');
        const opacityInput = document.getElementById('brush-opacity');
        const opacityVal = document.getElementById('brush-opacity-val');

        if (sizeInput) {
            sizeInput.addEventListener('input', (e) => {
                this.size = parseInt(e.target.value);
                sizeVal.textContent = `${this.size}px`;
                this.updateCursorSize();
            });
        }

        if (colorInput) {
            colorInput.addEventListener('input', (e) => {
                this.color = e.target.value;
            });
        }

        if (opacityInput) {
            opacityInput.addEventListener('input', (e) => {
                this.opacity = parseInt(e.target.value) / 100;
                opacityVal.textContent = `${e.target.value}%`;
            });
        }
    }

    activate() {
        this.canvasManager.canvas.style.cursor = 'none'; // Hide default cursor
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
            // Scale cursor visual based on canvas zoom?
            // The brush size is in canvas pixels.
            // If canvas is zoomed in (scale > 1), the brush circle should look bigger on screen.
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

        this.isDrawing = true;
        const tCoords = this.getTransformedCoords(coords, layer);
        this.lastX = tCoords.x;
        this.lastY = tCoords.y;

        layer.ctx.beginPath();
        layer.ctx.moveTo(this.lastX, this.lastY);
        layer.ctx.lineCap = 'round';
        layer.ctx.lineJoin = 'round';
        layer.ctx.strokeStyle = this.color;
        layer.ctx.lineWidth = this.size / layer.scale;
        layer.ctx.globalAlpha = this.opacity;
        layer.ctx.globalCompositeOperation = 'source-over';
    }

    mousemove(coords, event) {
        // Update cursor position
        if (this.cursor && event) {
            this.cursor.style.left = `${event.clientX}px`;
            this.cursor.style.top = `${event.clientY}px`;
            this.cursor.style.display = 'block';
            this.updateCursorSize(); // Update size in case zoom changed (though zoom usually requires wheel)
        }

        if (!this.isDrawing) return;

        const layer = this.layerManager.getActiveLayer();
        if (!layer) return;

        const tCoords = this.getTransformedCoords(coords, layer);

        layer.ctx.lineTo(tCoords.x, tCoords.y);
        layer.ctx.stroke();

        this.lastX = tCoords.x;
        this.lastY = tCoords.y;

        this.canvasManager.render(this.layerManager.layers);
    }

    mouseup(coords) {
        if (this.isDrawing) {
            this.isDrawing = false;
            const layer = this.layerManager.getActiveLayer();
            if (layer) layer.ctx.closePath();
        }
    }

    mouseleave(coords) {
        this.mouseup(coords);
        // Hide cursor when leaving canvas? 
        // ToolManager handles mouseleave from canvas.
        // But if we are just moving out, we might want to hide the custom cursor.
        if (this.cursor) this.cursor.style.display = 'none';
    }

    // We need a way to show cursor again when entering.
    // ToolManager doesn't have mouseenter. 
    // But mousemove will trigger.
    // Let's add a check in mousemove to ensure it's visible.
}
