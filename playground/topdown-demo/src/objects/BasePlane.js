import { createPlane }              from '../../../../vanilla_3d/objects/plane/plane.js';
import { cubes, CUBE_SIZE, CUBE_GAP } from '../data/cubes.js';

export { createBasePlane };

/** @type { number } */
const PADDING = 1.5;

/**
 * Creates the ground plane sized to fit all cubes with padding on every side.
 * @return { Object } PlaneType
 * @example
 *     const base = createBasePlane();
 *     scene.addObject(base);
 */
function createBasePlane() {
  const totalWidth = cubes.length * CUBE_SIZE + (cubes.length - 1) * CUBE_GAP + PADDING * 2;
  const totalDepth = CUBE_SIZE + PADDING * 2;

  const plane = createPlane({
    position:   { x: 0, y: 0, z: 0 },
    dimensions: { width: totalWidth, depth: totalDepth },
  });

  plane.element.style.setProperty('--base-color',          '#1e2a3a');
  plane.element.style.setProperty('--base-transparency',   '0%');
  plane.element.style.setProperty('--border-color',        '#3a5a7a');
  plane.element.style.setProperty('--border-transparency', '0%');
  plane.element.style.setProperty('--border-width',        '2px');

  return plane;
}
