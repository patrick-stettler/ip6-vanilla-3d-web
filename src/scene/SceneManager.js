/**
 * @module scene/SceneManager
 * Creates and configures the 3D scene.
 */

import { createScene3D }                     from "../../../vanilla_3d/scene/scene-3d.js";
import { MAX_ZOOM, MIN_ZOOM, TOP_DOWN_VIEW } from "../config.js";

export { TOP_DOWN_VIEW, createSceneManager };

/**
 * @typedef {Object} SceneManagerType
 * @property { function(!Object): void } add   - adds a 3D object to the scene. Mandatory.
 * @property { !Object }                 scene - the underlying Scene3DType instance. Mandatory.
 */

/**
 * Creates and initialises the 3D scene with a top-down camera.
 * @impure
 * @param  { !HTMLElement } el - the container element for the scene. Mandatory.
 * @return { SceneManagerType }
 * @example
 *     const manager = createSceneManager(document.getElementById("scene"));
 */
function createSceneManager(el) {
    const scene = createScene3D(el, TOP_DOWN_VIEW);
    scene.addControls({ minZoom: MIN_ZOOM, maxZoom: MAX_ZOOM });

    return {
        add:   function(obj) { scene.addObject(obj); },
        scene: scene
    };
}
