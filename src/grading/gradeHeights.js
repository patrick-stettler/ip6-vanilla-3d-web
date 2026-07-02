/**
 * @module grading/gradeHeights
 * Maps grades to vertical scene positions.
 */

import {
    ABOVE_GROUND_HEIGHT,
    BELOW_GROUND_DEPTH,
    GRADE_GAP,
    GROUND_Z,
    NOTE_MAX,
    NOTE_MIN,
    NOTE_PASS
} from "../config.js";

export { NOTE_MIN, NOTE_PASS, NOTE_MAX, gradeToZ };

/**
 * Maps a module grade to a world-space z height for the grade view.
 * @pure
 * @param  { number | null | undefined } note - grade on the 1-6 scale, or null if ungraded.
 * @return { number }
 * @complexity O(1)
 * @example
 *     gradeToZ(6);
 */
function gradeToZ(note) {
    if (note === null || note === undefined) return GROUND_Z;

    if (note < NOTE_PASS) {
        const t = (note - NOTE_MIN) / (NOTE_PASS - NOTE_MIN);
        return -BELOW_GROUND_DEPTH + (BELOW_GROUND_DEPTH - GRADE_GAP) * t;
    }

    const t = (note - NOTE_PASS) / (NOTE_MAX - NOTE_PASS);
    return GROUND_Z + GRADE_GAP + (ABOVE_GROUND_HEIGHT - GRADE_GAP) * t;
}
