/**
 * @module objects/Group
 * Provides group outline planes and their labels.
 */

import { createPlane } from "../../../vanilla_3d/objects/plane/plane.js";

export { createGroupPlane };

/**
 * @typedef {Object} GroupPlaneConfigType
 * @property { !string }  name        - group display name. Mandatory.
 * @property { !number }  x           - world x center position. Mandatory.
 * @property { !number }  y           - world y center position. Mandatory.
 * @property { !number }  width       - group plane width. Mandatory.
 * @property { !number }  depth       - group plane depth. Mandatory.
 * @property { number }   [z=0.01]    - world z position. Optional.
 * @property { string }   [variant]   - visual variant controlled by CSS. Optional.
 * @property { boolean }  [showLabel] - whether to render the name label. Optional.
 */

/**
 * Creates a group outline plane.
 * @impure
 * @param  { !GroupPlaneConfigType } config - position and label config. Mandatory.
 * @return { PlaneType }
 * @example
 *     const plane = createGroupPlane({ name: "Informatik", x: 0, y: 0, width: 8, depth: 6 });
 */
function createGroupPlane({ name, x, y, width, depth, z = 0.01, variant = "default", showLabel = true }) {
    const plane = createPlane({
        position:   { x, y, z },
        dimensions: { width, depth }
    });

    plane.element.classList.add("group-plane", `group-plane--${variant}`);

    if (showLabel) {
        const label = document.createElement("span");
        label.classList.add("group-label", "label");
        label.textContent = name;
        plane.element.appendChild(label);
    }

    return plane;
}
