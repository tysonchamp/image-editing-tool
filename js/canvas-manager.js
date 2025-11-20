export class CanvasManager {
    constructor() {
        this.canvas = document.getElementById('main-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.container = document.querySelector('.canvas-container');
        this.workspace = document.querySelector('.workspace');
        this.width = 800;
        this.height = 600;

        // Zoom & Pan State
        this.scale = 1;
        this.panning = false;
        this.startX = 0;
        this.startY = 0;
        this.offsetX = 0;
        this.offsetY = 0;
    }

    init() {
        this.resizeCanvas(this.width, this.height);
        this.centerCanvas();

        // Zoom Event
        this.workspace.addEventListener('wheel', (e) => this.handleWheel(e), { passive: false });

        // Pan Events (Space + Drag or Middle Mouse)
        window.addEventListener('keydown', (e) => {
            if (e.code === 'Space') {
                this.workspace.style.cursor = 'grab';
            }
        });

        window.addEventListener('keyup', (e) => {
            if (e.code === 'Space') {
                this.workspace.style.cursor = 'default';
                this.panning = false;
            }
        });

        this.workspace.addEventListener('mousedown', (e) => this.startPan(e));
        window.addEventListener('mousemove', (e) => this.pan(e));
        window.addEventListener('mouseup', () => this.endPan());
    }

    resizeCanvas(width, height) {
        this.width = width;
        this.height = height;
        this.canvas.width = width;
        this.canvas.height = height;

        // Reset zoom/pan on resize/new project
        this.scale = 1;
        this.offsetX = 0;
        this.offsetY = 0;
        this.updateTransform();

        this.clear();
    }

    centerCanvas() { }

    handleWheel(e) {
        if (e.ctrlKey || e.metaKey || true) {
            e.preventDefault();
            const zoomIntensity = 0.1;
            const delta = e.deltaY > 0 ? -zoomIntensity : zoomIntensity;
            const newScale = this.scale + delta;

            if (newScale >= 0.1 && newScale <= 5) {
                this.scale = newScale;
                this.updateTransform();
            }
        }
    }

    startPan(e) {
        if (e.button === 1 || (e.button === 0 && e.shiftKey) || (e.button === 0 && document.activeElement !== this.canvas && e.target === this.workspace)) {
            this.panning = true;
            this.startX = e.clientX - this.offsetX;
            this.startY = e.clientY - this.offsetY;
            this.workspace.style.cursor = 'grabbing';
        }
    }

    pan(e) {
        if (!this.panning) return;
        e.preventDefault();
        this.offsetX = e.clientX - this.startX;
        this.offsetY = e.clientY - this.startY;
        this.updateTransform();
    }

    endPan() {
        this.panning = false;
        this.workspace.style.cursor = 'default';
    }

    updateTransform() {
        this.container.style.transform = `translate(${this.offsetX}px, ${this.offsetY}px) scale(${this.scale})`;
    }

    clear() {
        this.ctx.clearRect(0, 0, this.width, this.height);
        this.ctx.fillStyle = '#ffffff';
        this.ctx.fillRect(0, 0, this.width, this.height);
    }

    render(layers) {
        this.clear();
        for (let i = layers.length - 1; i >= 0; i--) {
            const layer = layers[i];
            if (layer.visible) {
                this.ctx.save();
                this.ctx.translate(layer.x, layer.y);
                this.ctx.scale(layer.scale, layer.scale);
                this.ctx.drawImage(layer.canvas, 0, 0);
                this.ctx.restore();
            }
        }
    }

    getRelativeCoordinates(event) {
        const rect = this.canvas.getBoundingClientRect();

        // Calculate mouse position relative to the canvas element
        const mouseX = event.clientX - rect.left;
        const mouseY = event.clientY - rect.top;

        // Adjust for canvas resolution scaling (if CSS size != attribute size)
        const scaleX = this.canvas.width / rect.width;
        const scaleY = this.canvas.height / rect.height;

        // Apply Zoom and Pan transformations to get "Canvas Space" coordinates
        // Canvas Space = (Screen Space - Offset) / Scale
        const x = (mouseX * scaleX - this.offsetX) / this.scale;
        const y = (mouseY * scaleY - this.offsetY) / this.scale;

        return { x, y };
    }
}
