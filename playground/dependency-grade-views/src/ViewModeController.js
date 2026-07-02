import { GROUND_Z }    from './data/modules.js';
import { gradeToZ }    from './grading/gradeHeights.js';
import { TOP_DOWN_VIEW } from './scene/SceneManager.js';

export { createViewModeController };

/** @typedef {'dependency' | 'grade'} ViewModeType */

/**
 * @typedef {Object} ViewModeControllerType
 * @property {function(!ViewModeType): void} setMode    - switches the active height strategy.
 * @property {function(): ViewModeType}      getMode    - returns the currently active mode.
 * @property {function(): void}              resetView  - animates the camera back to the active mode's starting rotation.
 */

/** @type {string} */
const INTERACTIVE_CLASS = 'cube--interactive';

/** @type {string} */
const HIDDEN_CLASS = 'grade-zone--hidden';

/** @type {string} */
const VIEW_TRANSITION_CLASS = 'view-transitioning';

/**
 * Pitch used in grade mode: rotated all the way down from the top-down
 * angle (-90) to 0, so the camera looks at the stack frontally from the
 * side and the grade zones / floating cubes read as height instead of
 * collapsing into a top-down footprint. Matches the transition duration
 * set in style.css.
 * @type {number}
 */
const FRONTAL_PITCH = 0;

/** @type {number} */
const VIEW_TRANSITION_MS = 700;

/**
 * Switches every cube between two mutually exclusive height strategies:
 *  - 'dependency': all cubes rest on the ground layer; clicking a cube
 *    lifts its dependency chain via the DependencyController. The grade
 *    zone visuals (boxes and floor outlines) are hidden, since they only
 *    carry meaning relative to grade-based heights. The camera returns to
 *    the top-down pitch.
 *  - 'grade': every cube is permanently placed at a height derived from
 *    its grade (see gradeHeights.js); click-to-activate is disabled. The
 *    grade zone visuals become visible and the camera tilts down to a
 *    frontal, side-on pitch.
 * The camera tilt is animated; the user's own yaw (left/right rotation) is
 * preserved across the switch.
 * @param  {{ cubeMap: !Map<string, CubeEntryType>, dependencyController: !DependencyControllerType, gradeScaleController: !GradeScaleControllerType, gradeZoneElements: !Array<!BoxType|!PlaneType>, scene3d: !Scene3DType, sceneEl: !HTMLElement }} config
 * @return {ViewModeControllerType}
 */
function createViewModeController({ cubeMap, dependencyController, gradeScaleController, gradeZoneElements, scene3d, sceneEl }) {

  /** @type {ViewModeType} */
  let mode = 'dependency';

  /**
   * Animates the camera to the given rotation.
   * @param {!Vec3} rotation - target rotation in degrees. Mandatory.
   */
  function animateRotationTo(rotation) {
    sceneEl.classList.add(VIEW_TRANSITION_CLASS);
    scene3d.setRotation(rotation);

    window.setTimeout(function() {
      sceneEl.classList.remove(VIEW_TRANSITION_CLASS);
    }, VIEW_TRANSITION_MS);
  }

  /**
   * Animates the camera pitch to the given angle, keeping the user's
   * current yaw (z rotation) untouched.
   * @param {!number} pitch - target x rotation in degrees. Mandatory.
   */
  function tiltTo(pitch) {
    const current = scene3d.getRotation();
    animateRotationTo({ x: pitch, y: current.y, z: current.z });
  }

  /**
   * Animates the camera all the way back to the active mode's starting
   * rotation (top-down for dependency, frontal for grade), also clearing
   * any yaw the user dialed in with the D-Pad.
   */
  function resetView() {
    const pitch = mode === 'dependency' ? TOP_DOWN_VIEW.rotation.x : FRONTAL_PITCH;
    animateRotationTo({ x: pitch, y: 0, z: 0 });
  }

  /**
   * Resets every cube to ground level, re-enables click interaction,
   * hides the grade zone visuals and tilts the camera back to top-down.
   */
  function applyDependencyMode() {
    cubeMap.forEach(function(entry) {
      entry.box.setPosition({ z: GROUND_Z });
      entry.box.element.classList.add(INTERACTIVE_CLASS);
    });
    gradeZoneElements.forEach(function(el) {
      el.element.classList.add(HIDDEN_CLASS);
    });
    tiltTo(TOP_DOWN_VIEW.rotation.x);
  }

  /**
   * Places every cube at its grade height (clicking a graded cube now shows
   * the grade scale instead of lifting dependencies; ungraded cubes — no
   * note to display — stay non-interactive), reveals the grade zone
   * visuals and tilts the camera to a frontal pitch.
   */
  function applyGradeMode() {
    cubeMap.forEach(function(entry) {
      entry.box.setPosition({ z: gradeToZ(entry.data.note) });
      const hasNote = entry.data.note !== null && entry.data.note !== undefined;
      entry.box.element.classList.toggle(INTERACTIVE_CLASS, hasNote);
    });
    gradeZoneElements.forEach(function(el) {
      el.element.classList.remove(HIDDEN_CLASS);
    });
    tiltTo(FRONTAL_PITCH);
  }

  /**
   * @param {!ViewModeType} nextMode
   */
  function setMode(nextMode) {
    if (nextMode === mode) return;

    // Always start from a clean slate: clears lifted cubes, connector
    // lines, highlight/dim classes and any shown grade scale.
    dependencyController.reset();
    gradeScaleController.hide();

    mode = nextMode;
    if (mode === 'dependency') applyDependencyMode();
    else                       applyGradeMode();
  }

  /**
   * @return {ViewModeType}
   */
  function getMode() {
    return mode;
  }

  applyDependencyMode();

  return {
    setMode:   setMode
  , getMode:   getMode
  , resetView: resetView
  };
}
