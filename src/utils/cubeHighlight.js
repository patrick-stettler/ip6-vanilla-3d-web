/**
 * @module utils/cubeHighlight
 * Provides shared cube highlighting helpers.
 */

import { DIMMED_CLASS, HIGHLIGHTED_CLASS } from "../config.js";

export { DIMMED_CLASS, HIGHLIGHTED_CLASS, setCubeClass };

/**
 * Toggles a CSS class on every face of a cube.
 * @impure
 * @param  { !BoxType } box       - the cube to style. Mandatory.
 * @param  { !string }  className - the CSS class to toggle. Mandatory.
 * @param  { !boolean } enabled   - whether the class should be present. Mandatory.
 * @return { void }
 */
function setCubeClass(box, className, enabled) {
    Object.values(box.faces).forEach(function(face) {
        face.element.classList.toggle(className, enabled);
    });
}
