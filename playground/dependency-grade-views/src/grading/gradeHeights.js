import { GROUND_Z, CUBE_SIZE, PADDING } from '../data/modules.js';

export { NOTE_MIN, NOTE_PASS, NOTE_MAX, gradeToZ };

/** @type {number} */
const NOTE_MIN = 1;

/** @type {number} */
const NOTE_PASS = 4;

/** @type {number} */
const NOTE_MAX = 6;

/** @type {number} */
const BELOW_GROUND_DEPTH = 6;

/** @type {number} */
const ABOVE_GROUND_HEIGHT = 12;

/**
 * Minimum visual gap that separates a graded cube from the ground layer,
 * on either side — one module's height plus the same padding used around
 * the groups.
 * @type {number}
 */
const GAP = CUBE_SIZE + PADDING;

/**
 * Maps a module's grade to a world-space z height for the grade view.
 * Grades below NOTE_PASS (ungenügend) sink below the ground layer, with at
 * least one cube's height plus padding of clearance at the threshold
 * (NOTE_MIN -> -BELOW_GROUND_DEPTH, just below NOTE_PASS -> -GAP). Grades
 * from NOTE_PASS to NOTE_MAX rise above the ground layer with the same
 * minimum clearance (NOTE_PASS -> GROUND_Z + GAP, NOTE_MAX -> GROUND_Z +
 * ABOVE_GROUND_HEIGHT).
 * @param  { number | null | undefined } note - grade on the 1-6 scale, or null if ungraded.
 * @return { number }
 * @example
 *     gradeToZ(6);   // GROUND_Z + ABOVE_GROUND_HEIGHT
 *     gradeToZ(4);   // GROUND_Z + GAP (minimum clearance above ground)
 *     gradeToZ(1);   // -BELOW_GROUND_DEPTH
 *     gradeToZ(null) // GROUND_Z (fallback: stays on the ground layer)
 */
function gradeToZ(note) {
  if (note === null || note === undefined) return GROUND_Z;

  if (note < NOTE_PASS) {
    const t = (note - NOTE_MIN) / (NOTE_PASS - NOTE_MIN);
    return -BELOW_GROUND_DEPTH + (BELOW_GROUND_DEPTH - GAP) * t;
  }

  const t = (note - NOTE_PASS) / (NOTE_MAX - NOTE_PASS);
  return GROUND_Z + GAP + (ABOVE_GROUND_HEIGHT - GAP) * t;
}
