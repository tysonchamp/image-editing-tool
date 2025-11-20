export class SelectionManager {
    constructor(canvasManager) {
        this.canvasManager = canvasManager;
        this.selectionPath = null; // Path2D object
        this.isSelecting = false;
        this.selectionPoints = [];
    }

    startSelection(x, y) {
        this.isSelecting = true;
        this.selectionPoints = [{ x, y }];
    }

    addPoint(x, y) {
        if (this.isSelecting) {
            this.selectionPoints.push({ x, y });
        }
    }

    endSelection() {
        this.isSelecting = false;
        if (this.selectionPoints.length > 2) {
            this.selectionPath = new Path2D();
            this.selectionPath.moveTo(this.selectionPoints[0].x, this.selectionPoints[0].y);
            for (let i = 1; i < this.selectionPoints.length; i++) {
                this.selectionPath.lineTo(this.selectionPoints[i].x, this.selectionPoints[i].y);
            }
            this.selectionPath.closePath();
        } else {
            this.selectionPath = null;
        }
        this.selectionPoints = [];
        this.canvasManager.render(); // Re-render to show/hide selection
    }

    clearSelection() {
        this.selectionPath = null;
        this.canvasManager.render();
    }

    hasSelection() {
        return this.selectionPath !== null;
    }

    clip(ctx) {
        if (this.selectionPath) {
            ctx.clip(this.selectionPath);
        }
    }

    render(ctx) {
        // Draw selection overlay
        if (this.selectionPath) {
            ctx.save();
            ctx.strokeStyle = 'white';
            ctx.lineWidth = 1;
            ctx.setLineDash([5, 5]);
            ctx.stroke(this.selectionPath);
            ctx.strokeStyle = 'black';
            ctx.lineDashOffset = 5;
            ctx.stroke(this.selectionPath);
            ctx.restore();
        }

        // Draw active selection line while dragging
        if (this.isSelecting && this.selectionPoints.length > 0) {
            ctx.save();
            ctx.beginPath();
            ctx.moveTo(this.selectionPoints[0].x, this.selectionPoints[0].y);
            for (let i = 1; i < this.selectionPoints.length; i++) {
                ctx.lineTo(this.selectionPoints[i].x, this.selectionPoints[i].y);
            }
            ctx.strokeStyle = 'white';
            ctx.lineWidth = 1;
            ctx.setLineDash([5, 5]);
            ctx.stroke();
            ctx.restore();
        }
    }
}
