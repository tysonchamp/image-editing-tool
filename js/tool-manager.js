import { BrushTool } from './tools/brush-tool.js';
import { EraserTool } from './tools/eraser-tool.js';
import { TextTool } from './tools/text-tool.js';
import { CropTool } from './tools/crop-tool.js';
import { MoveTool } from './tools/move-tool.js';

export class ToolManager {
    constructor(canvasManager, layerManager) {
        this.canvasManager = canvasManager;
        this.layerManager = layerManager;
        this.activeTool = null;
        this.tools = {};

        // UI Elements
        this.toolBtns = document.querySelectorAll('.tool-btn[data-tool]');
        this.propertiesContainer = document.getElementById('tool-properties');

        // Property Groups
        this.propText = document.getElementById('prop-text');
        this.propScale = document.getElementById('prop-scale');
    }

    init() {
        // Initialize tools
        this.tools = {
            brush: new BrushTool(this.canvasManager, this.layerManager),
            eraser: new EraserTool(this.canvasManager, this.layerManager),
            text: new TextTool(this.canvasManager, this.layerManager),
            crop: new CropTool(this.canvasManager, this.layerManager),
            move: new MoveTool(this.canvasManager, this.layerManager)
        };

        // Bind tool buttons
        this.toolBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const toolName = btn.dataset.tool;
                this.selectTool(toolName);
            });
        });

        // Bind Canvas Events
        const canvas = this.canvasManager.canvas;
        canvas.addEventListener('mousedown', (e) => this.handleEvent('mousedown', e));
        canvas.addEventListener('mousemove', (e) => this.handleEvent('mousemove', e));
        canvas.addEventListener('mouseup', (e) => this.handleEvent('mouseup', e));
        canvas.addEventListener('mouseleave', (e) => this.handleEvent('mouseleave', e));

        // Select default tool
        this.selectTool('brush');
    }

    selectTool(toolName) {
        if (this.activeTool) {
            this.activeTool.deactivate();
        }

        this.activeTool = this.tools[toolName];
        if (this.activeTool) {
            this.activeTool.activate();
        }

        // Update UI
        this.toolBtns.forEach(btn => {
            if (btn.dataset.tool === toolName) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });

        // Toggle Properties
        if (toolName === 'text') {
            this.propText.style.display = 'block';
        } else {
            this.propText.style.display = 'none';
        }
    }

    handleEvent(eventName, event) {
        if (this.activeTool) {
            const coords = this.canvasManager.getRelativeCoordinates(event);
            this.activeTool[eventName](coords, event);
        }
    }
}
