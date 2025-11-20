export class TextTool {
    constructor(canvasManager, layerManager) {
        this.canvasManager = canvasManager;
        this.layerManager = layerManager;
        this.text = 'Text';
        this.fontSize = 40;
        this.fontFamily = 'Inter';
        this.color = '#000000';

        this.textInput = document.getElementById('text-content');
        if (this.textInput) {
            this.textInput.addEventListener('input', (e) => {
                this.text = e.target.value;
            });
        }
    }

    activate() {
        this.canvasManager.canvas.style.cursor = 'text';

        const colorInput = document.getElementById('brush-color');
        if (colorInput) this.color = colorInput.value;

        if (this.textInput) {
            this.textInput.value = this.text; // Reset to current
        }
    }

    deactivate() {
        this.canvasManager.canvas.style.cursor = 'default';
    }

    mousedown(coords) {
        const layer = this.layerManager.getActiveLayer();
        if (!layer || !layer.visible) return;

        // Correct coordinate for layer offset and scale
        const x = (coords.x - layer.x) / layer.scale;
        const y = (coords.y - layer.y) / layer.scale;

        // Use text from input if available, else prompt (fallback)
        let text = this.text;
        if (!this.textInput || this.textInput.value.trim() === '') {
            text = prompt('Enter text:', this.text);
            if (text) {
                this.text = text;
                if (this.textInput) this.textInput.value = text;
            }
        }

        if (text) {
            // Update color
            const colorInput = document.getElementById('brush-color');
            if (colorInput) this.color = colorInput.value;

            layer.ctx.font = `${this.fontSize}px ${this.fontFamily}`;
            layer.ctx.fillStyle = this.color;
            layer.ctx.textBaseline = 'top';
            layer.ctx.globalCompositeOperation = 'source-over';
            layer.ctx.globalAlpha = 1;
            layer.ctx.fillText(text, x, y);

            this.canvasManager.render(this.layerManager.layers);
        }
    }

    mousemove(coords) { }
    mouseup(coords) { }
    mouseleave(coords) { }
}
