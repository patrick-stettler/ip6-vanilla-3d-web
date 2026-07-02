import { createPlane } from '../../../../vanilla_3d/objects/plane/plane.js';

export { createGradeScale };

/** @type {number} */
const SCALE_STEP = 0.5;

/**
 * @typedef {Object} GradeScaleConfigType
 * @property {!number}                    x       - world x position, offset beside the cube. Mandatory.
 * @property {!number}                    y       - world y position, matching the cube's depth. Mandatory.
 * @property {!number}                    minNote - lowest grade tick to render. Mandatory.
 * @property {!number}                    maxNote - highest grade tick to render. Mandatory.
 * @property {!function(number): number}  noteToZ - maps a grade to its world z height. Mandatory.
 */

/**
 * Creates a vertical grade ruler: a dashed line with a tick label every half
 * grade. Uses the same upright orientation as a box's front face, so it
 * faces the camera once grade mode tilts to its frontal pitch.
 * @param  {!GradeScaleConfigType} config - position, range and height mapping. Mandatory.
 * @return {PlaneType}
 * @example
 *     const scale = createGradeScale({ x: 5, y: 0, minNote: 1, maxNote: 6, noteToZ: gradeToZ });
 *     scene3d.addObject(scale);
 */
function createGradeScale({ x, y, minNote, maxNote, noteToZ }) {
  const bottomZ = noteToZ(minNote);
  const topZ    = noteToZ(maxNote);

  const plane = createPlane({
    position:   { x, y, z: (bottomZ + topZ) / 2 },
    rotation:   { x: -90, y: 0, z: 0 },
    dimensions: { width: 0.02, depth: topZ - bottomZ },
  });

  plane.element.classList.add('grade-scale');

  for (let note = minNote; note <= maxNote + 1e-9; note += SCALE_STEP) {
    const t = (noteToZ(note) - bottomZ) / (topZ - bottomZ);

    const tick = document.createElement('span');
    tick.classList.add('grade-scale__tick');
    tick.style.setProperty('--t', String(t));
    tick.textContent = note.toFixed(1);
    plane.element.appendChild(tick);
  }

  return plane;
}
