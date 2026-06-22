import { createPlane } from '../../../../vanilla_3d/objects/plane/plane.js';

export { createBasePlane };

/**
 * @typedef {Object} BasePlaneConfigType
 * @property {!number} width - total width of the ground plane. Mandatory.
 * @property {!number} depth - total depth of the ground plane. Mandatory.
 */

/**
 * Creates the single ground plane that covers the entire scene layout.
 * @param  {!BasePlaneConfigType} config - dimensions of the base plane. Mandatory.
 * @return {PlaneType}
 * @example
 *     const base = createBasePlane({ width: 42, depth: 14 });
 *     scene.add(base);
 */
function createBasePlane({ width, depth }) {
  const plane = createPlane({
    position:   { x: 0, y: 0, z: 0 },
    dimensions: { width, depth },
  });

  plane.element.style.setProperty('--base-color',          '#1e2a3a');
  plane.element.style.setProperty('--base-transparency',   '0%');
  plane.element.style.setProperty('--border-color',        '#3a5a7a');
  plane.element.style.setProperty('--border-transparency', '0%');
  plane.element.style.setProperty('--border-width',        '2px');

  return plane;
}
