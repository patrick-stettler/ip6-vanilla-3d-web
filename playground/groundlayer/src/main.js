import { createSceneManager }        from './scene/SceneManager.js';
import { createCube }                from './objects/Cube.js';
import { createGroupPlane }          from './objects/GroupPlane.js';
import { createBasePlane }           from './objects/BasePlane.js';
import { createDependencyController } from './DependencyController.js';
import { createDPad }                from './ui/DPad.js';
import { layoutGroups }              from './layout/computeLayout.js';
import { groups }                    from './data/modules.js';

/** @type {SceneManagerType} */
const scene = createSceneManager(document.getElementById('scene'));

/** @type {number} */
const ROTATE_STEP = 6;

document.body.appendChild(createDPad({
  label:     'Rotate'
, className: 'dpad--rotate'
, up:        function() { scene.scene.rotateByWorld({ x: -ROTATE_STEP }); }
, down:      function() { scene.scene.rotateByWorld({ x: ROTATE_STEP }); }
, left:      function() { scene.scene.rotateBy({ z: ROTATE_STEP }); }
, right:     function() { scene.scene.rotateBy({ z: -ROTATE_STEP }); }
}));

/** @type {SVGElement} */
const svgOverlay = document.getElementById('svg-overlay');

/** @type {number} */
const BASE_PADDING = 1.5;

/** @type {LayoutType} */
const layout = layoutGroups({ groups, basePadding: BASE_PADDING });

scene.add(createBasePlane(layout.baseSize));

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

// Wire click handlers onto every cube after the controller exists.
cubeMap.forEach(function(entry, id) {
  entry.box.element.classList.add('cube--interactive');
  entry.box.element.addEventListener('click', function(e) {
    e.stopPropagation();
    controller.handleClick(id);
  });
});

// Click on the scene background resets the dependency view.
// Drag-releases also fire 'click', so we suppress those via pointer distance.
/** @type {{ x: number, y: number } | null} */
let pointerDownPos = null;
const sceneEl = document.getElementById('scene');

sceneEl.addEventListener('pointerdown', function(e) {
  pointerDownPos = { x: e.clientX, y: e.clientY };
});

sceneEl.addEventListener('click', function(e) {
  if (!pointerDownPos) return;
  const moved = Math.hypot(e.clientX - pointerDownPos.x, e.clientY - pointerDownPos.y);
  pointerDownPos = null;
  if (moved > 4) return;
  controller.reset();
});
