export class MoveTool {
    constructor(canvasManager, layerManager) {
        this.canvasManager = canvasManager;
        this.layerManager = layerManager;
        this.isDragging = false;
        this.lastX = 0;
        this.lastY = 0;
    }

    activate() {
        this.canvasManager.canvas.style.cursor = 'move';
    }

    deactivate() {
        this.canvasManager.canvas.style.cursor = 'default';
    }

    mousedown(coords) {
        const layer = this.layerManager.getActiveLayer();
        if (!layer || !layer.visible) return;

        this.isDragging = true;
        this.lastX = coords.x;
        this.lastY = coords.y;
    }

    mousemove(coords) {
        if (!this.isDragging) return;

        const layer = this.layerManager.getActiveLayer();
        if (!layer) return;

        const dx = coords.x - this.lastX;
        const dy = coords.y - this.lastY;

        layer.x += dx;
        layer.y += dy;

        this.lastX = coords.x;
        this.lastY = coords.y;

        this.canvasManager.render(this.layerManager.layers);
    }

    mouseup(coords) {
        this.isDragging = false;
    }

    mouseleave(coords) {
        this.isDragging = false;
    }
}
