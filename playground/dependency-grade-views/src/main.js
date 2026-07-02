import { createSceneManager }        from './scene/SceneManager.js';
import { createCube }                from './objects/Cube.js';
import { createGroupPlane }          from './objects/GroupPlane.js';
import { createBasePlane }           from './objects/BasePlane.js';
import { createGradeZoneBox }        from './objects/GradeZoneBox.js';
import { createDependencyController } from './DependencyController.js';
import { createGradeScaleController } from './GradeScaleController.js';
import { createViewModeController }  from './ViewModeController.js';
import { createDPad }                from './ui/DPad.js';
import { layoutGroups }              from './layout/computeLayout.js';
import { groups, CUBE_SIZE }         from './data/modules.js';
import { NOTE_MIN, NOTE_MAX, gradeToZ } from './grading/gradeHeights.js';

/** @type {HTMLElement} */
const sceneEl = document.getElementById('scene');

/** @type {SceneManagerType} */
const scene = createSceneManager(sceneEl);

/** @type {number} */
const ROTATE_STEP = 6;

document.body.appendChild(createDPad({
  label:     'Rotate'
, className: 'dpad--rotate'
, up:        function() { scene.scene.rotateByWorld({ x: -ROTATE_STEP }); }
, down:      function() { scene.scene.rotateByWorld({ x: ROTATE_STEP }); }
, left:      function() { scene.scene.rotateBy({ z: ROTATE_STEP }); }
, right:     function() { scene.scene.rotateBy({ z: -ROTATE_STEP }); }
// viewModeController is assigned further below; this only runs on click,
// by which time the module has finished its top-to-bottom initialization.
, reset:     function() { viewModeController.resetView(); }
}));

/** @type {SVGElement} */
const svgOverlay = document.getElementById('svg-overlay');

/** @type {number} */
const BASE_PADDING = 1.5;

/** @type {LayoutType} */
const layout = layoutGroups({ groups, basePadding: BASE_PADDING });

scene.add(createBasePlane(layout.baseSize));

// Tall enough that even the best/worst-graded cube (note 6 / note 1) stays
// fully inside its zone, including the half-cube it extends past its own
// center height.
/** @type {number} */
const aboveZoneHeight = gradeToZ(NOTE_MAX) + CUBE_SIZE / 2;

/** @type {number} */
const belowZoneHeight = Math.abs(gradeToZ(NOTE_MIN)) + CUBE_SIZE / 2;

const aboveZoneBox = createGradeZoneBox({
  width:     layout.baseSize.width
, depth:     layout.baseSize.depth
, height:    aboveZoneHeight
, direction: 'above'
});

const belowZoneBox = createGradeZoneBox({
  width:     layout.baseSize.width
, depth:     layout.baseSize.depth
, height:    belowZoneHeight
, direction: 'below'
});

scene.add(aboveZoneBox);
scene.add(belowZoneBox);

// Echo the module group outlines onto the red zone's floor, in red, so the
// layout stays legible even when the cubes have floated away from it.
/** @type {number} */
const RED_ZONE_FLOOR_OFFSET = 0.01;

/** @type {PlaneType[]} */
const redZoneGroupLines = layout.groupPlacements.map(function(placement) {
  const line = createGroupPlane({
    name:        placement.group.name
  , x:           placement.x
  , y:           placement.y
  , moduleCount: placement.group.modules.length
  , z:           -belowZoneHeight - RED_ZONE_FLOOR_OFFSET
  , color:       '#A91E1E'
  , showLabel:   false
  });
  line.element.style.pointerEvents = 'none';
  scene.add(line);
  return line;
});

// Build cubeMap while placing cubes so the DependencyController can look them up by id.
/** @type {Map<string, CubeEntryType>} */
const cubeMap = new Map();

layout.groupPlacements.forEach(function(placement) {
  scene.add(createGroupPlane({
    name:        placement.group.name
  , x:           placement.x
  , y:           placement.y
  , moduleCount: placement.group.modules.length
  }));

  placement.cubes.forEach(function(c) {
    const box = createCube({
      name:  c.module.name
    , color: c.module.color
    , x:     c.x
    , y:     c.y
    });
    scene.add(box);
    cubeMap.set(c.module.id, { box, data: c.module });
  });
});

/** @type {DependencyControllerType} */
const controller = createDependencyController({
  cubeMap
, svgOverlay
, scene3d: scene.scene
});

/** @type {GradeScaleControllerType} */
const gradeScaleController = createGradeScaleController({
  cubeMap
, scene3d: scene.scene
});

/** @type {ViewModeControllerType} */
const viewModeController = createViewModeController({
  cubeMap
, dependencyController: controller
, gradeScaleController
, gradeZoneElements: [aboveZoneBox, belowZoneBox, ...redZoneGroupLines]
, scene3d: scene.scene
, sceneEl
});

// Wire click handlers onto every cube after the controllers exist.
// Dependency mode lifts the dependency chain; grade mode shows the grade
// scale beside the clicked cube instead.
cubeMap.forEach(function(entry, id) {
  entry.box.element.addEventListener('click', function(e) {
    e.stopPropagation();
    if (viewModeController.getMode() === 'dependency') controller.handleClick(id);
    else                                                gradeScaleController.handleClick(id);
  });
});

// Click on the scene background resets the dependency view / hides the grade scale.
// Drag-releases also fire 'click', so we suppress those via pointer distance.
/** @type {{ x: number, y: number } | null} */
let pointerDownPos = null;

sceneEl.addEventListener('pointerdown', function(e) {
  pointerDownPos = { x: e.clientX, y: e.clientY };
});

sceneEl.addEventListener('click', function(e) {
  if (!pointerDownPos) return;
  const moved = Math.hypot(e.clientX - pointerDownPos.x, e.clientY - pointerDownPos.y);
  pointerDownPos = null;
  if (moved > 4) return;
  if (viewModeController.getMode() === 'dependency') controller.reset();
  else                                                gradeScaleController.hide();
});

// View-selector switch: unchecked = dependency view, checked = grade view.
const viewSwitch = document.getElementById('switch');

viewSwitch.addEventListener('change', function() {
  viewModeController.setMode(viewSwitch.checked ? 'grade' : 'dependency');
});
