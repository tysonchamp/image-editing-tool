export class CropTool {
    constructor(canvasManager, layerManager) {
        this.canvasManager = canvasManager;
        this.layerManager = layerManager;
        this.isDragging = false;
        this.startX = 0;
        this.startY = 0;
        this.currentX = 0;
        this.currentY = 0;
    }

    activate() {
        this.canvasManager.canvas.style.cursor = 'crosshair';
    }

    deactivate() {
        this.canvasManager.canvas.style.cursor = 'default';
        this.canvasManager.render(this.layerManager.layers); // Clear any selection overlay
    }

    mousedown(coords) {
        this.isDragging = true;
        this.startX = coords.x;
        this.startY = coords.y;
        this.currentX = coords.x;
        this.currentY = coords.y;
    }

    mousemove(coords) {
        if (!this.isDragging) return;
        this.currentX = coords.x;
        this.currentY = coords.y;

        // Render with selection overlay
        this.canvasManager.render(this.layerManager.layers);
        this.drawSelection();
    }

    mouseup(coords) {
        if (this.isDragging) {
            this.isDragging = false;

            const width = Math.abs(this.currentX - this.startX);
            const height = Math.abs(this.currentY - this.startY);
            const x = Math.min(this.startX, this.currentX);
            const y = Math.min(this.startY, this.currentY);

            if (width > 10 && height > 10) {
                if (confirm('Crop image to selection?')) {
                    this.crop(x, y, width, height);
                } else {
                    this.canvasManager.render(this.layerManager.layers);
                }
            }
        }
    }

    mouseleave(coords) {
        this.isDragging = false;
        this.canvasManager.render(this.layerManager.layers);
    }

    drawSelection() {
        const ctx = this.canvasManager.ctx;
        const width = this.currentX - this.startX;
        const height = this.currentY - this.startY;

        ctx.save();
        ctx.strokeStyle = '#007acc';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.strokeRect(this.startX, this.startY, width, height);

        ctx.fillStyle = 'rgba(0, 122, 204, 0.1)';
        ctx.fillRect(this.startX, this.startY, width, height);
        ctx.restore();
    }

    crop(x, y, width, height) {
        // Crop all layers
        this.layerManager.layers.forEach(layer => {
            // Transform crop rect to layer coordinates
            const layerX = (x - layer.x) / layer.scale;
            const layerY = (y - layer.y) / layer.scale;
            const layerWidth = width / layer.scale;
            const layerHeight = height / layer.scale;

            // Get image data from the layer
            // Note: getImageData requires integer coordinates, but we might have floats.
            // We might need to draw to a temp canvas to crop accurately with scaling.

            // Simpler approach: Create a new canvas of the crop size, draw the layer onto it with correct transform.
            const newCanvas = document.createElement('canvas');
            newCanvas.width = width;
            newCanvas.height = height;
            const newCtx = newCanvas.getContext('2d');

            // Draw the layer such that the cropped area fills the new canvas
            // We want the point (x,y) in Canvas Space to be at (0,0) in New Canvas.
            // Layer is currently drawn at (layer.x, layer.y) with scale (layer.scale) in Canvas Space.
            // So in New Canvas, we translate by (-x, -y) relative to the Canvas Space representation of the layer.

            newCtx.save();
            newCtx.translate(-x, -y); // Move crop origin to 0,0
            newCtx.translate(layer.x, layer.y); // Move layer to its position
            newCtx.scale(layer.scale, layer.scale); // Apply layer scale
            newCtx.drawImage(layer.canvas, 0, 0);
            newCtx.restore();

            // Update layer
            layer.canvas = newCanvas;
            layer.ctx = newCtx;
            layer.x = 0; // Reset position relative to new canvas size? 
            // Wait, if we crop the whole canvas, the new canvas represents the new viewport.
            // So the layer's new position relative to the new viewport (0,0) is what we just drew.
            // So layer.x and layer.y should be reset to 0 because we baked the position into the new canvas?
            // Yes, effectively we "flattened" the view of this layer into the new crop rect.
            // But this loses the ability to move the full layer content if it was outside the crop?
            // Usually "Crop" implies discarding everything outside.

            layer.x = 0;
            layer.y = 0;
            layer.scale = 1; // We baked the scale too?
            // Yes, if we drew it scaled onto the new canvas, the new canvas pixels are 1:1 with the main canvas pixels.
        });

        // Resize main canvas
        this.canvasManager.resizeCanvas(width, height);
        this.canvasManager.render(this.layerManager.layers);
    }
}
