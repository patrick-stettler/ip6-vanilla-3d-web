/**
 * @module controllers/GradeScaleController
 * Controls the grade scale shown for a selected module.
 */

import { NOTE_MAX, NOTE_MIN, gradeToZ }                  from "../grading/gradeHeights.js";
import { createGradeScale }                              from "../objects/Scale.js";
import { DIMMED_CLASS, HIGHLIGHTED_CLASS, setCubeClass } from "../utils/cubeHighlight.js";

export { createGradeScaleController };

/**
 * @typedef {Object} GradeScaleControllerType
 * @property { function(!number): void } handleClick - shows the scale through the given module. Mandatory.
 * @property { function(): void }        hide        - removes the scale, if one is currently shown. Mandatory.
 */

/**
 * Formats a module grade for display on cube faces.
 * @pure
 * @private
 * @param  { number | null | undefined } grade - grade on the 1-6 scale, or null if ungraded.
 * @return { string }
 */
function formatGrade(grade) {
    return (grade === null || grade === undefined) ? "-" : grade.toFixed(1);
}

/**
 * Controls grade scale visibility and cube highlighting.
 * @impure
 * @param  {{ cubeMap: !Map<number, CubeEntryType>, scene3d: !Scene3DType }} config - controller dependencies. Mandatory.
 * @return { GradeScaleControllerType }
 */
function createGradeScaleController({ cubeMap, scene3d }) {

    /** @type { number | null } */
    let activeId = null;

    /** @type { PlaneType | null } */
    let scale = null;

    /**
     * Removes the currently shown scale, if any.
     * @impure
     * @return { void }
     */
    function hide() {
        if (scale) scene3d.removeObject(scale);
        scale = null;

        const previousEntry = activeId ? cubeMap.get(activeId) : null;
        if (previousEntry) previousEntry.box.setLabel(previousEntry.data.title);

        activeId = null;

        cubeMap.forEach(function(entry) {
            setCubeClass(entry.box, DIMMED_CLASS, false);
            setCubeClass(entry.box, HIGHLIGHTED_CLASS, false);
        });
    }

    /**
     * Shows the grade scale for the given module.
     * @impure
     * @param  { !number } moduleId - module id. Mandatory.
     * @return { void }
     */
    function show(moduleId) {
        hide();

        const entry = cubeMap.get(moduleId);
        if (!entry) return;

        const pos = entry.box.getPosition();

        scale = createGradeScale({
            x:       pos.x,
            y:       pos.y,
            minNote: NOTE_MIN,
            maxNote: NOTE_MAX,
            noteToZ: gradeToZ
        });

        scene3d.addObject(scale);
        activeId = moduleId;
        entry.box.setLabel(formatGrade(entry.data.grade));

        cubeMap.forEach(function(otherEntry, id) {
            const isActive = id === moduleId;
            setCubeClass(otherEntry.box, HIGHLIGHTED_CLASS, isActive);
            setCubeClass(otherEntry.box, DIMMED_CLASS, !isActive);
        });
    }

    /**
     * Toggles the grade scale for the given module.
     * @impure
     * @param  { !number } moduleId - module id. Mandatory.
     * @return { void }
     */
    function handleClick(moduleId) {
        const entry = cubeMap.get(moduleId);
        if (!entry || entry.data.grade === null || entry.data.grade === undefined) return;

        if (moduleId === activeId) hide();
        else                       show(moduleId);
    }

    return {
        handleClick: handleClick,
        hide:        hide
    };
}
