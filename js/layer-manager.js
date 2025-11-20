export class LayerManager {
    constructor(canvasManager) {
        this.canvasManager = canvasManager;
        this.layers = [];
        this.activeLayerIndex = -1;
        this.layerIdCounter = 0;
        this.layersListElement = document.getElementById('layers-list');

        // Bind events
        document.getElementById('add-layer-btn').addEventListener('click', () => this.addLayer());
        document.getElementById('delete-layer-btn').addEventListener('click', () => this.deleteActiveLayer());

        // Bind Scale Input
        const scaleInput = document.getElementById('layer-scale');
        const scaleVal = document.getElementById('layer-scale-val');
        if (scaleInput) {
            scaleInput.addEventListener('input', (e) => {
                const scale = parseInt(e.target.value) / 100;
                scaleVal.textContent = `${e.target.value}%`;
                this.setLayerScale(scale);
            });
        }

        // Bind Opacity Input
        const opacityInput = document.getElementById('layer-opacity');
        const opacityVal = document.getElementById('layer-opacity-val');
        if (opacityInput) {
            opacityInput.addEventListener('input', (e) => {
                const opacity = parseInt(e.target.value) / 100;
                opacityVal.textContent = `${e.target.value}%`;
                this.setLayerOpacity(opacity);
            });
        }
    }

    init() {
        // Initial setup if needed
    }

    reset() {
        this.layers = [];
        this.activeLayerIndex = -1;
        this.layerIdCounter = 0;
        this.updateUI();
    }

    addLayer(name = null, image = null) {
        const layerCanvas = document.createElement('canvas');
        const ctx = layerCanvas.getContext('2d');

        let x = 0;
        let y = 0;

        if (image) {
            layerCanvas.width = image.width;
            layerCanvas.height = image.height;
            ctx.drawImage(image, 0, 0);

            // Center the image on the main canvas
            x = (this.canvasManager.width - image.width) / 2;
            y = (this.canvasManager.height - image.height) / 2;
        } else {
            layerCanvas.width = this.canvasManager.width;
            layerCanvas.height = this.canvasManager.height;
        }

        const layer = {
            id: this.layerIdCounter++,
            name: name || `Layer ${this.layerIdCounter}`,
            canvas: layerCanvas,
            ctx: ctx,
            visible: true,
            x: x,
            y: y,
            scale: 1.0,
            opacity: 1.0
        };

        this.layers.unshift(layer);
        this.setActiveLayer(0);
        this.updateUI();
        this.canvasManager.render(this.layers);
    }

    deleteActiveLayer() {
        if (this.activeLayerIndex === -1 || this.layers.length <= 1) return;

        this.layers.splice(this.activeLayerIndex, 1);

        // Update active index
        if (this.activeLayerIndex >= this.layers.length) {
            this.activeLayerIndex = this.layers.length - 1;
        }

        this.updateUI();
        this.canvasManager.render(this.layers);
    }

    setActiveLayer(index) {
        this.activeLayerIndex = index;
        this.updateUI();

        // Update scale slider to match active layer
        const layer = this.getActiveLayer();
        if (layer) {
            const scaleInput = document.getElementById('layer-scale');
            const scaleVal = document.getElementById('layer-scale-val');
            if (scaleInput) {
                scaleInput.value = layer.scale * 100;
                scaleVal.textContent = `${Math.round(layer.scale * 100)}%`;
            }

            const opacityInput = document.getElementById('layer-opacity');
            const opacityVal = document.getElementById('layer-opacity-val');
            if (opacityInput) {
                opacityInput.value = layer.opacity * 100;
                opacityVal.textContent = `${Math.round(layer.opacity * 100)}%`;
            }
        }
    }

    setLayerScale(scale) {
        const layer = this.getActiveLayer();
        if (layer) {
            layer.scale = scale;
            this.canvasManager.render(this.layers);
        }
    }

    setLayerOpacity(opacity) {
        const layer = this.getActiveLayer();
        if (layer) {
            layer.opacity = opacity;
            this.canvasManager.render(this.layers);
        }
    }

    toggleVisibility(index) {
        this.layers[index].visible = !this.layers[index].visible;
        this.updateUI();
        this.canvasManager.render(this.layers);
    }

    getActiveLayer() {
        if (this.activeLayerIndex === -1) return null;
        return this.layers[this.activeLayerIndex];
    }

    updateUI() {
        this.layersListElement.innerHTML = '';

        this.layers.forEach((layer, index) => {
            const item = document.createElement('div');
            item.className = `layer-item ${index === this.activeLayerIndex ? 'active' : ''}`;
            item.onclick = () => this.setActiveLayer(index);

            const visibility = document.createElement('span');
            visibility.className = 'layer-visibility';
            visibility.textContent = layer.visible ? '👁️' : '🚫';
            visibility.onclick = (e) => {
                e.stopPropagation();
                this.toggleVisibility(index);
            };

            const preview = document.createElement('div');
            preview.className = 'layer-preview';

            const name = document.createElement('span');
            name.className = 'layer-name';
            name.textContent = layer.name;

            item.appendChild(visibility);
            item.appendChild(preview);
            item.appendChild(name);

            this.layersListElement.appendChild(item);
        });
    }
}
