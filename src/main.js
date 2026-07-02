/**
 * @module main
 * Wires data, layout, scene objects and interaction controllers together.
 */

import {
    BASE_PADDING,
    CUBE_SIZE,
    RED_ZONE_FLOOR_OFFSET,
    ROTATE_STEP
} from "./config.js";
import { createDependencyController }          from "./controllers/DependencyController.js";
import { createGradeScaleController }          from "./controllers/GradeScaleController.js";
import { createViewModeController }            from "./controllers/ViewModeController.js";
import { MODULE_GROUPS }                       from "./data/groups.js";
import { MODULES }                             from "./data/modules.js";
import { NOTE_MAX, NOTE_MIN, gradeToZ }        from "./grading/gradeHeights.js";
import { layoutGroups }                        from "./layout/computeLayout.js";
import { createBasePlane }                     from "./objects/Plane.js";
import { createCube }                          from "./objects/Cube.js";
import { createGradeZoneBox }                  from "./objects/Box.js";
import { createGroupPlane }                    from "./objects/Group.js";
import { createSceneManager }                  from "./scene/SceneManager.js";
import { createDPad }                          from "./ui/DPad.js";

/**
 * Combines flat group and module data into the layout shape expected by the
 * scene builder.
 * @pure
 * @param  { !ModuleGroupDataType[] } moduleGroups - available groups. Mandatory.
 * @param  { !ModuleDataType[] }      modules      - available modules. Mandatory.
 * @return { !LayoutGroupType[] }
 */
function createLayoutGroups(moduleGroups, modules) {
    return moduleGroups.map(function(group) {
        return {
            id:      group.id,
            name:    group.name,
            modules: modules.filter(function(module) {
                return module.group === group.id;
            })
        };
    });
}

/** @type { HTMLElement } */
const sceneEl = document.getElementById("scene");

/** @type { SceneManagerType } */
const scene = createSceneManager(sceneEl);

document.body.appendChild(createDPad({
    label:     "Rotate",
    className: "dpad--rotate",
    up:        function() { scene.scene.rotateByWorld({ x: -ROTATE_STEP }); },
    down:      function() { scene.scene.rotateByWorld({ x: ROTATE_STEP }); },
    left:      function() { scene.scene.rotateBy({ z: ROTATE_STEP }); },
    right:     function() { scene.scene.rotateBy({ z: -ROTATE_STEP }); },
    reset:     function() { viewModeController.resetView(); }
}));

/** @type { SVGElement } */
const svgOverlay = document.getElementById("svg-overlay");

/** @type { !LayoutGroupType[] } */
const groups = createLayoutGroups(MODULE_GROUPS, MODULES);

/** @type { LayoutType } */
const layout = layoutGroups({ groups, basePadding: BASE_PADDING });

scene.add(createBasePlane(layout.baseSize));

/** @type { number } */
const aboveZoneHeight = gradeToZ(NOTE_MAX) + CUBE_SIZE / 2;

/** @type { number } */
const belowZoneHeight = Math.abs(gradeToZ(NOTE_MIN)) + CUBE_SIZE / 2;

const aboveZoneBox = createGradeZoneBox({
    width:     layout.baseSize.width,
    depth:     layout.baseSize.depth,
    height:    aboveZoneHeight,
    direction: "above"
});

const belowZoneBox = createGradeZoneBox({
    width:     layout.baseSize.width,
    depth:     layout.baseSize.depth,
    height:    belowZoneHeight,
    direction: "below"
});

scene.add(aboveZoneBox);
scene.add(belowZoneBox);

/** @type { PlaneType[] } */
const redZoneGroupLines = layout.groupPlacements.map(function(placement) {
    const line = createGroupPlane({
        name:      placement.group.name,
        x:         placement.x,
        y:         placement.y,
        width:     placement.width,
        depth:     placement.depth,
        z:         -belowZoneHeight - RED_ZONE_FLOOR_OFFSET,
        variant:   "red-zone",
        showLabel: false
    });

    line.element.classList.add("group-plane--passive");
    scene.add(line);
    return line;
});

/** @type { Map<number, CubeEntryType> } */
const cubeMap = new Map();

layout.groupPlacements.forEach(function(placement) {
    scene.add(createGroupPlane({
        name:  placement.group.name,
        x:     placement.x,
        y:     placement.y,
        width: placement.width,
        depth: placement.depth
    }));

    placement.cubes.forEach(function(cubePlacement) {
        const box = createCube({
            name:   cubePlacement.module.title,
            status: cubePlacement.module.status,
            x:      cubePlacement.x,
            y:      cubePlacement.y
        });

        scene.add(box);
        cubeMap.set(cubePlacement.module.id, { box, data: cubePlacement.module });
    });
});

/** @type { DependencyControllerType } */
const controller = createDependencyController({
    cubeMap:    cubeMap,
    svgOverlay: svgOverlay,
    scene3d:    scene.scene
});

/** @type { GradeScaleControllerType } */
const gradeScaleController = createGradeScaleController({
    cubeMap: cubeMap,
    scene3d: scene.scene
});

/** @type { ViewModeControllerType } */
const viewModeController = createViewModeController({
    cubeMap:              cubeMap,
    dependencyController: controller,
    gradeScaleController: gradeScaleController,
    gradeZoneElements:    [aboveZoneBox, belowZoneBox, ...redZoneGroupLines],
    scene3d:              scene.scene,
    sceneEl:              sceneEl
});

cubeMap.forEach(function(entry, id) {
    entry.box.element.addEventListener("click", function(e) {
        e.stopPropagation();
        if (viewModeController.getMode() === "dependency") controller.handleClick(id);
        else                                                gradeScaleController.handleClick(id);
    });
});

/** @type {{ x: number, y: number } | null} */
let pointerDownPos = null;

sceneEl.addEventListener("pointerdown", function(e) {
    pointerDownPos = { x: e.clientX, y: e.clientY };
});

sceneEl.addEventListener("click", function(e) {
    if (!pointerDownPos) return;

    const moved = Math.hypot(e.clientX - pointerDownPos.x, e.clientY - pointerDownPos.y);
    pointerDownPos = null;

    if (moved > 4) return;
    if (viewModeController.getMode() === "dependency") controller.reset();
    else                                                gradeScaleController.hide();
});

/** @type { HTMLInputElement } */
const viewSwitch = document.getElementById("switch");

viewSwitch.addEventListener("change", function() {
    viewModeController.setMode(viewSwitch.checked ? "grade" : "dependency");
});
