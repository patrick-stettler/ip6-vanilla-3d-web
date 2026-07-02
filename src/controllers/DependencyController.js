/**
 * @module controllers/DependencyController
 * Controls dependency highlighting, lifting and connector lines.
 */

import { GROUND_Z, LEVEL_HEIGHT }                       from "../config.js";
import { DIMMED_CLASS, HIGHLIGHTED_CLASS, setCubeClass } from "../utils/cubeHighlight.js";

export { createDependencyController };

/**
 * @typedef {Object} CubeEntryType
 * @property { !BoxType }        box  - the 3D box object. Mandatory.
 * @property { !ModuleDataType } data - the associated module data. Mandatory.
 */

/**
 * @typedef {Object} DependencyControllerType
 * @property { function(!number): void } handleClick - activates or deactivates a module by id. Mandatory.
 * @property { function(): void }        reset       - lowers all cubes and removes all lines. Mandatory.
 */

/**
 * Manages the dependency visualisation.
 * @impure
 * @param  {{ cubeMap: !Map<number, CubeEntryType>, svgOverlay: !SVGElement, scene3d: !Scene3DType }} config - controller dependencies. Mandatory.
 * @return { DependencyControllerType }
 */
function createDependencyController({ cubeMap, svgOverlay, scene3d }) {

    /** @type { number | null } */
    let activeId = null;

    /** @type { SVGPathElement[] } */
    let activePaths = [];

    /** @type { Array<{ fromId: number, toId: number }> } */
    let activeEdges = [];

    /** @type { boolean } */
    let rafPending = false;

    /**
     * Recursively computes dependency levels reachable from the start module.
     * @pure
     * @param  { !number } startId - module id to start from. Mandatory.
     * @return { Map<number, number> }
     */
    function computeLevels(startId) {
        /** @type { Map<number, number> } */
        const memo = new Map();

        /** @type { Set<number> } */
        const visiting = new Set();

        /**
         * Computes the dependency level for one module.
         * @pure
         * @private
         * @param  { !number } id - module id. Mandatory.
         * @return { number }
         */
        function getLevel(id) {
            if (memo.has(id))     return memo.get(id);
            if (visiting.has(id)) return 0;

            const entry = cubeMap.get(id);
            if (!entry || entry.data.prerequisites.length === 0) {
                memo.set(id, 0);
                return 0;
            }

            visiting.add(id);

            const maxPrereqLevel = entry.data.prerequisites.reduce(function(max, prerequisiteId) {
                return Math.max(max, getLevel(prerequisiteId));
            }, -1);

            visiting.delete(id);

            const level = maxPrereqLevel + 1;
            memo.set(id, level);
            return level;
        }

        getLevel(startId);
        return memo;
    }

    /**
     * Returns the screen-space center of a DOM element.
     * @impure
     * @param  { !Element } el - element to inspect. Mandatory.
     * @return {{ x: number, y: number }}
     */
    function screenCenter(el) {
        const rect = el.getBoundingClientRect();
        return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
    }

    /**
     * Updates all active connector paths in-place.
     * @impure
     * @return { void }
     */
    function redrawLines() {
        if (activeEdges.length === 0) return;

        /** @type { Array<{ a: { x: number, y: number }, b: { x: number, y: number } }> } */
        const positions = activeEdges.map(function(edge) {
            return {
                a: screenCenter(cubeMap.get(edge.fromId).box.element),
                b: screenCenter(cubeMap.get(edge.toId).box.element)
            };
        });

        for (let i = 0; i < positions.length; i++) {
            const a  = positions[i].a;
            const b  = positions[i].b;
            const dx = (b.x - a.x) * 0.5;

            activePaths[i].setAttribute(
                "d",
                `M ${a.x} ${a.y} C ${a.x + dx} ${a.y}, ${b.x - dx} ${b.y}, ${b.x} ${b.y}`
            );
        }
    }

    /**
     * Schedules one connector redraw for the next animation frame.
     * @impure
     * @return { void }
     */
    function scheduleRedraw() {
        if (rafPending || activeEdges.length === 0) return;

        rafPending = true;
        requestAnimationFrame(function() {
            rafPending = false;
            redrawLines();
        });
    }

    /**
     * Lowers all cubes and removes all connector lines.
     * @impure
     * @return { void }
     */
    function reset() {
        cubeMap.forEach(function(entry) {
            entry.box.setPosition({ z: GROUND_Z });
            setCubeClass(entry.box, DIMMED_CLASS, false);
            setCubeClass(entry.box, HIGHLIGHTED_CLASS, false);
        });

        activePaths.forEach(function(path) {
            svgOverlay.removeChild(path);
        });

        activePaths = [];
        activeEdges = [];
        activeId    = null;
        rafPending  = false;
    }

    /**
     * Activates the dependency view for one module.
     * @impure
     * @param  { !number } moduleId - module id. Mandatory.
     * @return { void }
     */
    function activate(moduleId) {
        reset();
        activeId = moduleId;

        const levels = computeLevels(moduleId);

        levels.forEach(function(level, id) {
            const entry = cubeMap.get(id);
            if (!entry) return;
            entry.box.setPosition({ z: GROUND_Z + (level + 1) * LEVEL_HEIGHT });
        });

        cubeMap.forEach(function(entry, id) {
            const isRelated = levels.has(id);
            setCubeClass(entry.box, HIGHLIGHTED_CLASS, isRelated);
            setCubeClass(entry.box, DIMMED_CLASS, !isRelated);
        });

        activeEdges = [];
        levels.forEach(function(_, id) {
            const entry = cubeMap.get(id);
            if (!entry) return;

            entry.data.prerequisites.forEach(function(prerequisiteId) {
                if (levels.has(prerequisiteId)) {
                    activeEdges.push({ fromId: prerequisiteId, toId: id });
                }
            });
        });

        activePaths = activeEdges.map(function() {
            const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
            path.classList.add("connector-path");
            svgOverlay.appendChild(path);
            return path;
        });

        const activeEntry = cubeMap.get(moduleId);
        if (activeEntry) {
            activeEntry.box.element.addEventListener("transitionend", function onLifted(e) {
                if (e.target !== activeEntry.box.element || e.propertyName !== "transform") return;

                activeEntry.box.element.removeEventListener("transitionend", onLifted);
                redrawLines();
                activePaths.forEach(function(path) {
                    path.classList.add("connector-path--visible");
                });
            });
        }
    }

    /**
     * Toggles dependency activation for the given module.
     * @impure
     * @param  { !number } moduleId - module id. Mandatory.
     * @return { void }
     */
    function handleClick(moduleId) {
        if (moduleId === activeId) reset();
        else                       activate(moduleId);
    }

    scene3d.onPositionChange(scheduleRedraw);
    scene3d.onZoomChange(scheduleRedraw);
    scene3d.onRotationChange(scheduleRedraw);

    return {
        handleClick: handleClick,
        reset:       reset
    };
}
