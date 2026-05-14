import { createScene3D } from '../../../../vanilla_3d/scene/scene-3d.js';

export { TOP_DOWN_VIEW, createSceneManager };

/**
 * @typedef  { Object } SceneManagerType
 * @property { function(!Object): void } add   - adds a 3D object to the scene. Mandatory.
 * @property { Object }                  scene - the underlying Scene3DType instance.
 */

/**
 * @typedef  { Object } ViewConfig
 * @property { { x: number, z: number } } rotation - initial rotation in degrees.
 * @property { number }                   zoom     - initial zoom level.
 */

/** @type { ViewConfig } */
const TOP_DOWN_VIEW = { rotation: { x: -90, z: 0 }, zoom: 0.45 };

/**
 * Creates and initialises the 3D scene with a top-down camera (x:90 = straight down, x:0 = side view).
 * @param  { !HTMLElement } el - the container element for the scene. Mandatory.
 * @return { SceneManagerType }
 * @example
 *     const manager = createSceneManager(document.getElementById('scene'));
 *     manager.add(createBox());
 */
function createSceneManager(el) {
  const scene = createScene3D(el, TOP_DOWN_VIEW);
  scene.addControls({ minZoom: 0.05, maxZoom: 12 });

  return {
    add:   function(obj) { scene.addObject(obj); },
    scene: scene,
  };
}
