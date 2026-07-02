/**
 * @module controllers/ViewModeController
 * Switches between dependency and grade view modes.
 */

import {
    FRONTAL_PITCH,
    GROUND_Z,
    HIDDEN_CLASS,
    INTERACTIVE_CLASS,
    VIEW_TRANSITION_CLASS,
    VIEW_TRANSITION_MS
} from "../config.js";
import { gradeToZ }      from "../grading/gradeHeights.js";
import { TOP_DOWN_VIEW } from "../scene/SceneManager.js";

export { createViewModeController };

/**
 * @typedef { "dependency" | "grade" } ViewModeType
 */

/**
 * @typedef {Object} ViewModeControllerType
 * @property { function(!ViewModeType): void } setMode   - switches the active height strategy. Mandatory.
 * @property { function(): ViewModeType }      getMode   - returns the currently active mode. Mandatory.
 * @property { function(): void }              resetView - animates the camera back to the active mode's starting rotation. Mandatory.
 */

/**
 * Controls switching between dependency mode and grade mode.
 * @impure
 * @param  {{ cubeMap: !Map<number, CubeEntryType>, dependencyController: !DependencyControllerType, gradeScaleController: !GradeScaleControllerType, gradeZoneElements: !Array<!BoxType|!PlaneType>, scene3d: !Scene3DType, sceneEl: !HTMLElement }} config - controller dependencies. Mandatory.
 * @return { ViewModeControllerType }
 */
function createViewModeController({ cubeMap, dependencyController, gradeScaleController, gradeZoneElements, scene3d, sceneEl }) {

    /** @type { ViewModeType } */
    let mode = "dependency";

    /**
     * Animates the camera to the given rotation.
     * @impure
     * @param  { !Vec3 } rotation - target rotation in degrees. Mandatory.
     * @return { void }
     */
    function animateRotationTo(rotation) {
        sceneEl.classList.add(VIEW_TRANSITION_CLASS);
        scene3d.setRotation(rotation);

        window.setTimeout(function() {
            sceneEl.classList.remove(VIEW_TRANSITION_CLASS);
        }, VIEW_TRANSITION_MS);
    }

    /**
     * Animates the camera pitch while keeping the current yaw.
     * @impure
     * @param  { !number } pitch - target x rotation in degrees. Mandatory.
     * @return { void }
     */
    function tiltTo(pitch) {
        const current = scene3d.getRotation();
        animateRotationTo({ x: pitch, y: current.y, z: current.z });
    }

    /**
     * Resets the camera rotation for the active view mode.
     * @impure
     * @return { void }
     */
    function resetView() {
        const pitch = mode === "dependency" ? TOP_DOWN_VIEW.rotation.x : FRONTAL_PITCH;
        animateRotationTo({ x: pitch, y: 0, z: 0 });
    }

    /**
     * Applies dependency mode cube positions and visibility.
     * @impure
     * @return { void }
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
     * Applies grade mode cube positions and visibility.
     * @impure
     * @return { void }
     */
    function applyGradeMode() {
        cubeMap.forEach(function(entry) {
            const hasGrade = entry.data.grade !== null && entry.data.grade !== undefined;
            entry.box.setPosition({ z: gradeToZ(entry.data.grade) });
            entry.box.element.classList.toggle(INTERACTIVE_CLASS, hasGrade);
        });

        gradeZoneElements.forEach(function(el) {
            el.element.classList.remove(HIDDEN_CLASS);
        });

        tiltTo(FRONTAL_PITCH);
    }

    /**
     * Switches to the given view mode.
     * @impure
     * @param  { !ViewModeType } nextMode - target mode. Mandatory.
     * @return { void }
     */
    function setMode(nextMode) {
        if (nextMode === mode) return;

        dependencyController.reset();
        gradeScaleController.hide();

        mode = nextMode;
        if (mode === "dependency") applyDependencyMode();
        else                       applyGradeMode();
    }

    /**
     * Returns the currently active view mode.
     * @pure
     * @return { ViewModeType }
     */
    function getMode() {
        return mode;
    }

    applyDependencyMode();

    return {
        setMode:   setMode,
        getMode:   getMode,
        resetView: resetView
    };
}
