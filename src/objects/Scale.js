/**
 * @module objects/Scale
 * Provides the vertical grade scale object.
 */

import { createPlane } from "../../../vanilla_3d/objects/plane/plane.js";
import { SCALE_STEP }  from "../config.js";

export { createGradeScale };

/**
 * @typedef {Object} GradeScaleConfigType
 * @property { !number }                   x       - world x position. Mandatory.
 * @property { !number }                   y       - world y position. Mandatory.
 * @property { !number }                   minNote - lowest grade tick to render. Mandatory.
 * @property { !number }                   maxNote - highest grade tick to render. Mandatory.
 * @property { !function(number): number } noteToZ - maps a grade to its world z height. Mandatory.
 */

/**
 * Creates a vertical grade ruler with tick labels.
 * @impure
 * @param  { !GradeScaleConfigType } config - position, range and height mapping. Mandatory.
 * @return { PlaneType }
 * @example
 *     const scale = createGradeScale({ x: 5, y: 0, minNote: 1, maxNote: 6, noteToZ: gradeToZ });
 */
function createGradeScale({ x, y, minNote, maxNote, noteToZ }) {
    const bottomZ   = noteToZ(minNote);
    const topZ      = noteToZ(maxNote);
    const tickCount = Math.round((maxNote - minNote) / SCALE_STEP);

    const plane = createPlane({
        position:   { x, y, z: (bottomZ + topZ) / 2 },
        rotation:   { x: -90, y: 0, z: 0 },
        dimensions: { width: 0.02, depth: topZ - bottomZ }
    });

    plane.element.classList.add("grade-scale");

    for (let tickIndex = 0; tickIndex <= tickCount; tickIndex++) {
        const note = minNote + tickIndex * SCALE_STEP;
        const tick = document.createElement("span");

        tick.classList.add("grade-scale__tick", `grade-scale__tick--${tickIndex}`);
        tick.textContent = note.toFixed(1);
        plane.element.appendChild(tick);
    }

    return plane;
}
