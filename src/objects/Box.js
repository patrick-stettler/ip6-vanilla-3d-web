/**
 * @module objects/Box
 * Provides the translucent grade zone boxes.
 */

import { createBox } from "../../../vanilla_3d/objects/box/box.js";

export { createGradeZoneBox };

/**
 * @typedef {Object} GradeZoneBoxConfigType
 * @property { !number }            width     - footprint width. Mandatory.
 * @property { !number }            depth     - footprint depth. Mandatory.
 * @property { !number }            height    - vertical extent of the zone. Mandatory.
 * @property { !("above"|"below") } direction - whether the zone sits above or below the base plane. Mandatory.
 */

/**
 * Creates a translucent volume marking a grade zone.
 * @impure
 * @param  { !GradeZoneBoxConfigType } config - dimensions and direction. Mandatory.
 * @return { BoxType }
 * @example
 *     scene.add(createGradeZoneBox({ width: 10, depth: 8, height: 12, direction: "above" }));
 */
function createGradeZoneBox({ width, depth, height, direction }) {
    const z   = direction === "above" ? height / 2 : -height / 2;
    const box = createBox({
        position:   { x: 0, y: 0, z },
        dimensions: { width, depth, height }
    });

    box.element.classList.add("grade-zone", `grade-zone--${direction}`);

    return box;
}
