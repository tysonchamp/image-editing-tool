import { BrushTool } from './tools/brush-tool.js';
import { EraserTool } from './tools/eraser-tool.js';
import { TextTool } from './tools/text-tool.js';
import { CropTool } from './tools/crop-tool.js';
import { MoveTool } from './tools/move-tool.js';
import { LassoTool } from './tools/lasso-tool.js';
import { BlurTool } from './tools/blur-tool.js';
import { SelectionManager } from './selection-manager.js';

export class ToolManager {
    constructor(canvasManager, layerManager) {
        this.canvasManager = canvasManager;
        this.layerManager = layerManager;
        this.selectionManager = new SelectionManager(canvasManager);
        this.canvasManager.setSelectionManager(this.selectionManager);

        this.tools = {
            'move': new MoveTool(canvasManager, layerManager),
            'brush': new BrushTool(canvasManager, layerManager, this.selectionManager),
            'eraser': new EraserTool(canvasManager, layerManager, this.selectionManager),
            'text': new TextTool(canvasManager, layerManager),
            'crop': new CropTool(canvasManager, layerManager),
            'lasso': new LassoTool(canvasManager, this.selectionManager),
            'blur': new BlurTool(canvasManager, layerManager, this.selectionManager)
        };

        this.activeToolId = 'brush';
        this.activeTool = this.tools['brush'];
    }

    init() {
        this.initToolButtons();
    }

    initToolButtons() {
        const buttons = document.querySelectorAll('.tool-btn');
        buttons.forEach(btn => {
            btn.addEventListener('click', () => {
                const toolId = btn.dataset.tool;
                this.selectTool(toolId);
            });
        });

        // Set initial active state
        this.selectTool('brush');
    }

    selectTool(toolId) {
        if (this.activeTool) {
            this.activeTool.deactivate();
        }

        this.activeToolId = toolId;
        this.activeTool = this.tools[toolId];

        // Update UI
        document.querySelectorAll('.tool-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.tool === toolId) {
                btn.classList.add('active');
            }
        });

        // Show/Hide Text Properties
        const textProps = document.getElementById('text-properties');
        if (textProps) {
            textProps.style.display = toolId === 'text' ? 'block' : 'none';
        }

        if (this.activeTool) {
            this.activeTool.activate();
        }
    }

    // ... event handlers ...
    handleEvent(eventType, event) {
        if (!this.activeTool) return;

        const rect = this.canvasManager.canvas.getBoundingClientRect();
        const scaleX = this.canvasManager.canvas.width / rect.width;
        const scaleY = this.canvasManager.canvas.height / rect.height;

        // Calculate coordinates relative to the canvas (taking zoom/pan into account)
        // The tools expect coordinates in "Canvas Space" (0,0 is top-left of the virtual canvas)
        // But the mouse event is in "Screen Space".
        // CanvasManager renders with transform(offsetX, offsetY) and scale(scale).

        // Mouse relative to DOM element
        const mouseX = (event.clientX - rect.left);
        const mouseY = (event.clientY - rect.top);

        // Transform to Canvas Space
        const canvasX = (mouseX - this.canvasManager.offsetX) / this.canvasManager.scale;
        const canvasY = (mouseY - this.canvasManager.offsetY) / this.canvasManager.scale;

        const coords = { x: canvasX, y: canvasY };

        switch (eventType) {
            case 'mousedown':
                if (this.activeTool.mousedown) this.activeTool.mousedown(coords, event);
                break;
            case 'mousemove':
                if (this.activeTool.mousemove) this.activeTool.mousemove(coords, event);
                break;
            case 'mouseup':
                if (this.activeTool.mouseup) this.activeTool.mouseup(coords, event);
                break;
            case 'mouseleave':
                if (this.activeTool.mouseleave) this.activeTool.mouseleave(coords, event);
                break;
        }
    }
}
