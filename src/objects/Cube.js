/**
 * @module objects/Cube
 * Provides the labelled module cube object.
 */

import { createBox }  from "../../../vanilla_3d/objects/box/box.js";
import { CUBE_SIZE }  from "../config.js";

export { createCube };

/**
 * @typedef {Object} CubeConfigType
 * @property { !string } name   - display label shown on cube faces. Mandatory.
 * @property { !string } status - module state used by CSS for visual styling. Mandatory.
 * @property { !number } x      - world x position. Mandatory.
 * @property { !number } y      - world y position. Mandatory.
 */

/**
 * Creates a styled span element used as a cube face label.
 * @impure
 * @private
 * @param  { !string } name - text to display. Mandatory.
 * @return { HTMLSpanElement }
 */
function createLabel(name) {
    const span = document.createElement("span");
    span.classList.add("cube-label", "label");
    span.textContent = name;
    return span;
}

/**
 * Creates a glass-effect 3D cube with a label on its front face.
 * @impure
 * @param  { !CubeConfigType } config - position and appearance of the cube. Mandatory.
 * @return { BoxType }
 * @example
 *     const cube = createCube({ name: "Prog 1", status: "passed", x: 0, y: 0 });
 *     scene.add(cube);
 */
function createCube({ name, status, x, y }) {
    const size = CUBE_SIZE;
    const box  = createBox({
        position:   { x, y, z: size / 2 },
        dimensions: { width: size, depth: size, height: size }
    });

    box.element.classList.add("cube");
    box.element.dataset.status = status;

    /** @type { HTMLSpanElement[] } */
    const labels = ["front"].map(function(face) {
        const label = createLabel(name);
        box.faces[face].element.appendChild(label);
        return label;
    });

    /**
     * Replaces the text shown on every labeled face.
     * @impure
     * @param  { !string } text - the text to display. Mandatory.
     * @return { void }
     */
    box.setLabel = function(text) {
        labels.forEach(function(label) {
            label.textContent = text;
        });
    };

    return box;
}
