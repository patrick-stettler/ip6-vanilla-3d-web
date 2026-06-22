import { createPlane }             from '../../../../vanilla_3d/objects/plane/plane.js';
import { groupWidth, GROUP_DEPTH } from '../data/modules.js';

export { createGroupPlane };

/**
 * @typedef {Object} GroupPlaneConfigType
 * @property {!string} name        - group display name shown as top-left label. Mandatory.
 * @property {!number} x           - world x center position. Mandatory.
 * @property {!number} y           - world y center position. Mandatory.
 * @property {!number} moduleCount - number of modules (determines plane width). Mandatory.
 */

/**
 * Creates a group outline plane: transparent fill, white border, top-left label.
 * Sits slightly above the base plane (z=0.01) to avoid z-fighting.
 * @param  {!GroupPlaneConfigType} config - position and label. Mandatory.
 * @return {PlaneType}
 * @example
 *     const gp = createGroupPlane({ name: 'Informatik', x: 0, y: 0, moduleCount: 5 });
 *     scene.add(gp);
 */
function createGroupPlane({ name, x, y, moduleCount }) {
  const plane = createPlane({
    position:   { x, y, z: 0.01 },
    dimensions: { width: groupWidth(moduleCount), depth: GROUP_DEPTH },
  });

  plane.element.classList.add('group-plane');

  plane.element.style.setProperty('--base-color',          '#ffffff');
  plane.element.style.setProperty('--base-transparency',   '100%');
  plane.element.style.setProperty('--border-color',        '#ffffff');
  plane.element.style.setProperty('--border-transparency', '55%');
  plane.element.style.setProperty('--border-width',        '2px');

  const label = document.createElement('span');
  label.classList.add('group-label');
  label.textContent = name;
  plane.element.appendChild(label);

  return plane;
}
