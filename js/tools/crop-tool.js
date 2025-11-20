export class CropTool {
    constructor(canvasManager, layerManager) {
        this.canvasManager = canvasManager;
        this.layerManager = layerManager;
        this.isDragging = false;
        this.startX = 0;
        this.startY = 0;
        this.currentX = 0;
        this.currentY = 0;

        // Modal elements
        this.modal = document.getElementById('crop-modal');
        this.confirmBtn = document.getElementById('confirm-crop');
        this.cancelBtn = document.getElementById('cancel-crop');

        this.pendingCrop = null;

        this.initModal();
    }

    initModal() {
        if (this.confirmBtn) {
            this.confirmBtn.addEventListener('click', () => {
                if (this.pendingCrop) {
                    this.crop(this.pendingCrop.x, this.pendingCrop.y, this.pendingCrop.width, this.pendingCrop.height);
                    this.pendingCrop = null;
                }
                this.modal.style.display = 'none';
            });
        }

        if (this.cancelBtn) {
            this.cancelBtn.addEventListener('click', () => {
                this.pendingCrop = null;
                this.modal.style.display = 'none';
                this.canvasManager.render(this.layerManager.layers); // Clear selection
            });
        }
    }

    activate() {
        this.canvasManager.canvas.style.cursor = 'crosshair';
    }

    deactivate() {
        this.canvasManager.canvas.style.cursor = 'default';
        this.canvasManager.render(this.layerManager.layers);
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
                this.pendingCrop = { x, y, width, height };
                this.modal.style.display = 'flex';
            } else {
                this.canvasManager.render(this.layerManager.layers);
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
        console.log('Executing crop...', { x, y, width, height });

        this.layerManager.layers.forEach(layer => {
            const newCanvas = document.createElement('canvas');
            newCanvas.width = width;
            newCanvas.height = height;
            const newCtx = newCanvas.getContext('2d');

            newCtx.save();
            newCtx.translate(-x, -y);
            newCtx.translate(layer.x, layer.y);
            newCtx.scale(layer.scale, layer.scale);
            newCtx.drawImage(layer.canvas, 0, 0);
            newCtx.restore();

            layer.canvas = newCanvas;
            layer.ctx = newCtx;
            layer.x = 0;
            layer.y = 0;
            layer.scale = 1;
        });

        this.canvasManager.resizeCanvas(width, height);
        this.canvasManager.render(this.layerManager.layers);
    }
}
