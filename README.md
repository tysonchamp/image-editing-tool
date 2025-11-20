# ProEdit - Advanced Image Editing Tool

ProEdit is a lightweight, browser-based image editing tool built with vanilla HTML, CSS, and JavaScript. It offers essential photo editing features similar to Photoshop, including layers, brushes, text, and export options.

## Features

-   **Layers System**: Create, delete, toggle visibility, move, and scale layers.
-   **Tools**:
    -   **Brush**: Freehand drawing with customizable size, color, opacity, and **smoothness**.
    -   **Eraser**: Remove content with adjustable size and smoothness.
    -   **Text**: Add text overlays with custom colors.
    -   **Crop**: Select and crop the canvas.
    -   **Move**: Drag and drop layers to position them.
-   **Canvas Control**: Zoom (Mouse Wheel) and Pan (Space + Drag) for precise editing.
-   **Import/Export**: Import local images and export projects as PNG, JPG, or WebP.
-   **Modern UI**: Dark theme with a responsive layout and custom cursors.

## Installation & Usage

1.  **Clone or Download** the repository.
2.  **Open `index.html`** in any modern web browser (Chrome, Firefox, Edge, Safari).
    -   No server is required for basic functionality.
    -   However, for module loading to work strictly without CORS issues in some environments, serving via a local server (e.g., `python3 -m http.server`) is recommended but not strictly necessary for this setup as it uses relative paths.

## Integration Guide

To integrate this tool into another web application:

1.  **Copy Files**: Copy the `css` and `js` folders to your project.
2.  **HTML Structure**: Copy the main structure from `index.html` (Toolbar, Workspace, Properties Panel).
3.  **Initialization**:
    Import the `App` class or individual managers in your script:

    ```javascript
    import { CanvasManager } from './js/canvas-manager.js';
    import { LayerManager } from './js/layer-manager.js';
    import { ToolManager } from './js/tool-manager.js';

    // Initialize
    const canvasManager = new CanvasManager();
    const layerManager = new LayerManager(canvasManager);
    const toolManager = new ToolManager(canvasManager, layerManager);
    
    canvasManager.init();
    layerManager.init();
    toolManager.init();
    ```

## Project Structure

-   `index.html`: Main entry point and UI layout.
-   `css/style.css`: All styling variables and rules.
-   `js/app.js`: Bootstraps the application.
-   `js/canvas-manager.js`: Handles the HTML5 Canvas, rendering, and zoom/pan logic.
-   `js/layer-manager.js`: Manages the stack of layers (creation, deletion, properties).
-   `js/tool-manager.js`: Orchestrates tool selection and event delegation.
-   `js/tools/`: Individual tool implementations (Brush, Eraser, Text, Crop, Move).

## Customization

-   **Theme**: Edit CSS variables in `css/style.css` (`:root`) to change colors.
-   **Tools**: Add new tools by creating a class in `js/tools/` and registering it in `js/tool-manager.js`.
