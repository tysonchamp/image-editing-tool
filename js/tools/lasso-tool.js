export class LassoTool {
    constructor(canvasManager, selectionManager) {
        this.canvasManager = canvasManager;
        this.selectionManager = selectionManager;
        this.isDrawing = false;
    }

    activate() {
        this.canvasManager.canvas.style.cursor = 'crosshair';
    }

    deactivate() {
        this.canvasManager.canvas.style.cursor = 'default';
    }

    mousedown(coords) {
        this.isDrawing = true;
        // Clear previous selection if starting a new one?
        // Usually yes, unless Shift is held (add) or Alt (subtract).
        // For now, simple replacement.
        this.selectionManager.clearSelection();
        this.selectionManager.startSelection(coords.x, coords.y);
        this.canvasManager.render();
    }

    mousemove(coords) {
        if (!this.isDrawing) return;
        this.selectionManager.addPoint(coords.x, coords.y);
        this.canvasManager.render();
    }

    mouseup(coords) {
        if (this.isDrawing) {
            this.isDrawing = false;
            this.selectionManager.endSelection();
        }
    }

    mouseleave(coords) {
        this.mouseup(coords);
    }
}
