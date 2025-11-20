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
            const data = layer.ctx.getImageData(x, y, width, height);
            layer.canvas.width = width;
            layer.canvas.height = height;
            layer.ctx.putImageData(data, 0, 0);
        });

        // Resize main canvas
        this.canvasManager.resizeCanvas(width, height);
        this.canvasManager.render(this.layerManager.layers);
    }
}
