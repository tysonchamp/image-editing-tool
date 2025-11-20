export class BrushTool {
    constructor(canvasManager, layerManager, selectionManager) {
        this.canvasManager = canvasManager;
        this.layerManager = layerManager;
        this.selectionManager = selectionManager;
        this.isDrawing = false;
        this.lastX = 0;
        this.lastY = 0;

        // Properties
        this.size = 10;
        this.color = '#000000';
        this.opacity = 1;
        this.smoothness = 0; // Repurposed for Edge Softness (Blur)

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
        const smoothnessInput = document.getElementById('brush-smoothness');
        const smoothnessVal = document.getElementById('brush-smoothness-val');

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
                this.updateCursorSize();
            });
        }

        if (opacityInput) {
            opacityInput.addEventListener('input', (e) => {
                this.opacity = parseInt(e.target.value) / 100;
                opacityVal.textContent = `${e.target.value}%`;
            });
        }

        if (smoothnessInput) {
            smoothnessInput.addEventListener('input', (e) => {
                this.smoothness = parseInt(e.target.value) / 100; // 0 to 0.9
                smoothnessVal.textContent = `${e.target.value}%`;
                this.updateCursorSize(); // Softness might affect visual cursor style?
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

            // Set border color to selected color
            this.cursor.style.borderColor = this.color;

            // Visual feedback for softness + Contrast shadow
            const blur = (this.smoothness * this.size * zoom) / 2;
            // Add a black shadow for contrast so it's visible on light backgrounds even if color is light
            this.cursor.style.boxShadow = `0 0 2px rgba(0,0,0,0.8), inset 0 0 ${blur}px ${this.color}`;
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

        layer.ctx.save(); // Save state before clipping

        // Apply Selection Clip
        if (this.selectionManager && this.selectionManager.hasSelection()) {
            // The selection path is in Canvas Space.
            // The layer context is in Layer Space (0,0 is layer top-left).
            // We need to transform the selection path to Layer Space?
            // Or transform the context to Canvas Space, clip, then transform back?

            // Transforming path is hard.
            // Transforming context is easier.

            // Actually, we are drawing on the layer context.
            // layer.ctx has no transform applied by default (it's 1:1 with layer pixels).
            // But the selection is defined in Canvas coordinates.
            // Layer is at layer.x, layer.y with layer.scale.

            // To clip correctly:
            // 1. Translate/Scale context to match Canvas Space relative to Layer.
            //    Canvas(0,0) is at Layer(-layer.x/scale, -layer.y/scale) ?

            // Let's do inverse transform:
            // ctx.scale(1/layer.scale, 1/layer.scale);
            // ctx.translate(-layer.x, -layer.y);
            // ctx.clip(selectionPath);
            // ctx.translate(layer.x, layer.y);
            // ctx.scale(layer.scale, layer.scale);

            // Wait, if we change transform, our drawing coordinates (tCoords) which are already transformed
            // will be wrong if we don't reset transform.

            // So:
            layer.ctx.beginPath();
            // We need to transform the context to align with the selection path
            layer.ctx.save();
            layer.ctx.scale(1 / layer.scale, 1 / layer.scale);
            layer.ctx.translate(-layer.x, -layer.y);
            this.selectionManager.clip(layer.ctx);
            layer.ctx.restore();
            // Now we are back to Layer Space, but with clip applied?
            // No, restore() removes the clip if it was part of the state saved.
            // Clipping is part of the state.

            // So we cannot use save/restore to wrap the clip application if we want the clip to persist for drawing.
            // But we need to restore the transform.

            // Correct way:
            // 1. Apply transform.
            // 2. Create clip.
            // 3. Restore transform (inverse operation).

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
        layer.ctx.strokeStyle = this.color;
        layer.ctx.lineWidth = this.size / layer.scale;
        layer.ctx.globalAlpha = this.opacity;
        layer.ctx.globalCompositeOperation = 'source-over';

        // Softness (Shadow Blur)
        if (this.smoothness > 0) {
            layer.ctx.shadowBlur = (this.smoothness * this.size) / layer.scale;
            layer.ctx.shadowColor = this.color;
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
            this.updateCursorSize();
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
            if (layer) {
                layer.ctx.closePath();
                layer.ctx.shadowBlur = 0; // Reset
                layer.ctx.shadowColor = 'transparent';
                layer.ctx.restore(); // Restore from save() in mousedown
            }
        }
    }

    mouseleave(coords) {
        this.mouseup(coords);
        if (this.cursor) this.cursor.style.display = 'none';
    }
}
