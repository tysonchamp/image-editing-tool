import { CanvasManager } from './canvas-manager.js';
import { LayerManager } from './layer-manager.js';
import { ToolManager } from './tool-manager.js';

class App {
    constructor() {
        this.canvasManager = new CanvasManager();
        this.layerManager = new LayerManager(this.canvasManager);
        this.toolManager = new ToolManager(this.canvasManager, this.layerManager);

        this.init();
    }

    init() {
        console.log('ProEdit Initialized');

        // Initialize components
        this.canvasManager.init();
        this.layerManager.init();
        this.toolManager.init();

        // Add initial layer
        this.layerManager.addLayer('Background');

        // Setup Export Buttons
        document.getElementById('export-png').addEventListener('click', () => this.exportImage('png'));
        document.getElementById('export-jpg').addEventListener('click', () => this.exportImage('jpeg'));
        document.getElementById('export-webp').addEventListener('click', () => this.exportImage('webp'));

        // Setup Import Button
        const fileInput = document.getElementById('file-input');
        document.getElementById('import-btn').addEventListener('click', () => fileInput.click());
        fileInput.addEventListener('change', (e) => this.handleImageImport(e));

        // Setup New Project Modal
        this.setupModal();
    }

    setupModal() {
        const modal = document.getElementById('new-project-modal');
        const newBtn = document.getElementById('new-project-btn');
        const cancelBtn = document.getElementById('cancel-new-project');
        const createBtn = document.getElementById('create-new-project');

        newBtn.addEventListener('click', () => {
            modal.style.display = 'flex';
        });

        cancelBtn.addEventListener('click', () => {
            modal.style.display = 'none';
        });

        createBtn.addEventListener('click', () => {
            const width = parseInt(document.getElementById('new-width').value);
            const height = parseInt(document.getElementById('new-height').value);

            if (width > 0 && height > 0) {
                this.createNewProject(width, height);
                modal.style.display = 'none';
            } else {
                alert('Invalid dimensions');
            }
        });
    }

    createNewProject(width, height) {
        this.canvasManager.resizeCanvas(width, height);
        this.layerManager.reset();
        this.layerManager.addLayer('Background');
    }

    exportImage(format) {
        const link = document.createElement('a');
        link.download = `image.${format === 'jpeg' ? 'jpg' : format}`;
        link.href = this.canvasManager.canvas.toDataURL(`image/${format}`);
        link.click();
    }

    handleImageImport(e) {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const img = new Image();
            img.onload = () => {
                this.layerManager.addLayer('Image', img);
            };
            img.src = event.target.result;
        };
        reader.readAsDataURL(file);
    }
}

// Start the app
window.addEventListener('DOMContentLoaded', () => {
    window.app = new App();
});
