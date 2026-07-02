import { createGradeScale }              from './objects/GradeScale.js';
import { NOTE_MIN, NOTE_MAX, gradeToZ }  from './grading/gradeHeights.js';
import { DIMMED_CLASS, HIGHLIGHTED_CLASS, setCubeClass } from './cubeHighlight.js';

export { createGradeScaleController };

/**
 * @typedef {Object} GradeScaleControllerType
 * @property {function(!string): void} handleClick - shows the scale through the given module, or hides it if that module's scale is already shown.
 * @property {function(): void}        hide        - removes the scale, if one is currently shown.
 */

/**
 * Formats a module's grade for display on its cube faces.
 * @param  { number | null | undefined } note - grade on the 1-6 scale, or null if ungraded.
 * @return {string}
 */
function formatNote(note) {
  return (note === null || note === undefined) ? '–' : note.toFixed(1);
}

/**
 * Shows a vertical grade ruler running straight through the clicked cube's
 * center, while in grade mode. Only one scale is shown at a time.
 * @param  {{ cubeMap: !Map<string, CubeEntryType>, scene3d: !Scene3DType }} config
 * @return {GradeScaleControllerType}
 */
function createGradeScaleController({ cubeMap, scene3d }) {

  /** @type {string|null} */
  let activeId = null;

  /** @type {PlaneType|null} */
  let scale = null;

  /**
   * Removes the currently shown scale, if any, and un-dims every cube —
   * the same highlight/dim mechanism used by the DependencyController.
   */
  function hide() {
    if (scale) scene3d.removeObject(scale);
    scale = null;

    const previousEntry = activeId ? cubeMap.get(activeId) : null;
    if (previousEntry) previousEntry.box.setLabel(previousEntry.data.name);

    activeId = null;

    cubeMap.forEach(function(entry) {
      setCubeClass(entry.box, DIMMED_CLASS, false);
      setCubeClass(entry.box, HIGHLIGHTED_CLASS, false);
    });
  }

  /**
   * @param {!string} moduleId
   */
  function show(moduleId) {
    hide();

    const entry = cubeMap.get(moduleId);
    if (!entry) return;

    const pos = entry.box.getPosition();

    scale = createGradeScale({
      x:       pos.x
    , y:       pos.y
    , minNote: NOTE_MIN
    , maxNote: NOTE_MAX
    , noteToZ: gradeToZ
    });

    scene3d.addObject(scale);
    activeId = moduleId;
    entry.box.setLabel(formatNote(entry.data.note));

    // Same mechanism and values as the dependency view: highlight the
    // clicked cube, dim every other one.
    cubeMap.forEach(function(otherEntry, id) {
      const isActive = id === moduleId;
      setCubeClass(otherEntry.box, HIGHLIGHTED_CLASS, isActive);
      setCubeClass(otherEntry.box, DIMMED_CLASS, !isActive);
    });
  }

  /**
   * Ungraded modules (note is null) have nothing to show on a grade scale
   * and stay non-selectable.
   * @param {!string} moduleId
   */
  function handleClick(moduleId) {
    const entry = cubeMap.get(moduleId);
    if (!entry || entry.data.note === null || entry.data.note === undefined) return;

    if (moduleId === activeId) hide();
    else                       show(moduleId);
  }

  return {
    handleClick: handleClick
  , hide:        hide
  };
}
