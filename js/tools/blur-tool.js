export class BlurTool {
    constructor(canvasManager, layerManager) {
        this.canvasManager = canvasManager;
        this.layerManager = layerManager;
        this.isDrawing = false;
        this.lastX = 0;
        this.lastY = 0;

        this.size = 30;
        this.intensity = 0.5; // Blur strength

        this.cursor = document.getElementById('brush-cursor');

        this.bindProperties();
    }

    bindProperties() {
        const sizeInput = document.getElementById('brush-size');
        const sizeVal = document.getElementById('brush-size-val');

        // Reuse smoothness slider for intensity? Or add new one?
        // Let's reuse smoothness for now as "Intensity"
        const intensityInput = document.getElementById('brush-smoothness');
        const intensityVal = document.getElementById('brush-smoothness-val');

        if (sizeInput) {
            sizeInput.addEventListener('input', (e) => {
                this.size = parseInt(e.target.value);
                sizeVal.textContent = `${this.size}px`;
                this.updateCursorSize();
            });
        }

        if (intensityInput) {
            intensityInput.addEventListener('input', (e) => {
                this.intensity = parseInt(e.target.value) / 100;
                intensityVal.textContent = `${e.target.value}%`;
            });
        }
    }

    activate() {
        this.canvasManager.canvas.style.cursor = 'none';
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
            this.cursor.style.borderColor = '#00ccff'; // Cyan for blur
            this.cursor.style.boxShadow = '0 0 2px rgba(0,0,0,0.8)';
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

        this.blur(layer, tCoords.x, tCoords.y);
    }

    mousemove(coords, event) {
        if (this.cursor && event) {
            this.cursor.style.left = `${event.clientX}px`;
            this.cursor.style.top = `${event.clientY}px`;
            this.cursor.style.display = 'block';
            this.updateCursorSize();
        }

        if (!this.isDrawing) return;

        const layer = this.layerManager.getActiveLayer();
        if (!layer) return;

        const tCoords = this.getTransformedCoords(coords, layer);

        // Interpolate for smoother strokes
        const dist = Math.hypot(tCoords.x - this.lastX, tCoords.y - this.lastY);
        const step = this.size / 4; // Overlap

        if (dist > step) {
            const angle = Math.atan2(tCoords.y - this.lastY, tCoords.x - this.lastX);
            for (let i = 0; i < dist; i += step) {
                const x = this.lastX + Math.cos(angle) * i;
                const y = this.lastY + Math.sin(angle) * i;
                this.blur(layer, x, y);
            }
        } else {
            this.blur(layer, tCoords.x, tCoords.y);
        }

        this.lastX = tCoords.x;
        this.lastY = tCoords.y;

        this.canvasManager.render(this.layerManager.layers);
    }

    blur(layer, x, y) {
        // To blur, we need to:
        // 1. Get image data from the area
        // 2. Apply blur (e.g. using a temporary canvas with filter)
        // 3. Put it back

        // Optimization: Use ctx.filter on a temp canvas
        const size = this.size / layer.scale;
        const r = size / 2;

        // Create temp canvas for the patch
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = size;
        tempCanvas.height = size;
        const tempCtx = tempCanvas.getContext('2d');

        // Draw the source area onto temp canvas
        // Source coordinates
        const sx = x - r;
        const sy = y - r;

        tempCtx.drawImage(layer.canvas, sx, sy, size, size, 0, 0, size, size);

        // Apply blur
        // We can't just draw it back with filter because it will blur the edges of the patch into transparency
        // We need to draw the patch, blur it, and then composite it?

        // Better approach:
        // 1. Draw the layer onto itself with a blur filter, but clipped to the brush circle?
        // No, that's expensive to do for the whole layer.

        // Approach 2:
        // 1. Extract patch.
        // 2. Blur patch.
        // 3. Draw patch back with a radial gradient alpha mask to blend edges?

        // Let's try simple filter approach on the layer context, but clipped.
        layer.ctx.save();
        layer.ctx.beginPath();
        layer.ctx.arc(x, y, r, 0, Math.PI * 2);
        layer.ctx.clip();
        layer.ctx.filter = `blur(${this.intensity * 10}px)`; // Scale intensity
        // Draw the image onto itself at the same position?
        // drawImage(image, dx, dy)
        // If we draw the canvas onto itself, it might work.
        layer.ctx.drawImage(layer.canvas, 0, 0);
        layer.ctx.restore();

        // Note: drawImage(canvas, 0, 0) draws the *current state* of the canvas.
        // If we are inside a clip, it only updates that area.
        // However, drawing the whole canvas is slow.
        // We should draw only the relevant part.

        /*
        layer.ctx.save();
        layer.ctx.beginPath();
        layer.ctx.arc(x, y, r, 0, Math.PI * 2);
        layer.ctx.clip();
        layer.ctx.filter = `blur(${this.intensity * 10}px)`;
        layer.ctx.drawImage(layer.canvas, sx, sy, size, size, sx, sy, size, size);
        layer.ctx.restore();
        */
    }

    mouseup(coords) {
        this.isDrawing = false;
    }

    mouseleave(coords) {
        this.mouseup(coords);
        if (this.cursor) this.cursor.style.display = 'none';
    }
}
