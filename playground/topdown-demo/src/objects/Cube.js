import { createBox } from '../../../../vanilla_3d/objects/box/box.js';
import { CUBE_SIZE }  from '../data/cubes.js';

export { createCube };

/**
 * @typedef  { Object } CubeConfig
 * @property { !string } name  - display label shown on cube faces. Mandatory.
 * @property { !string } color - base hex color, e.g. '#e05252'. Mandatory.
 * @property { !number } x     - world x position. Mandatory.
 * @property { !number } y     - world y position. Mandatory.
 */

/**
 * Converts a hex color string to a CSS rgb triplet string for use in rgba().
 * @param  { !string } hex - six-digit hex color, e.g. '#e05252'. Mandatory.
 * @return { string } comma-separated RGB values, e.g. '224, 82, 82'
 */
function hexToRgbTriplet(hex) {
  const r = Number('0x' + hex.slice(1, 3));
  const g = Number('0x' + hex.slice(3, 5));
  const b = Number('0x' + hex.slice(5, 7));
  return `${r}, ${g}, ${b}`;
}

/**
 * Creates a styled span element used as a cube face label.
 * @param  { !string } name - text to display. Mandatory.
 * @return { HTMLSpanElement }
 */
function createLabel(name) {
  const span = document.createElement('span');
  span.classList.add('cube-label');
  span.textContent = name;
  return span;
}

/**
 * Creates a glass-effect 3D cube with a label on each visible face.
 * The glass appearance is driven by the CSS variable --c (RGB triplet).
 * @param  { !CubeConfig } config - position and appearance of the cube. Mandatory.
 * @return { Object } BoxType
 * @example
 *     const cube = createCube({ name: 'Alpha', color: '#e05252', x: 0, y: 0 });
 *     scene.addObject(cube);
 */
function createCube({ name, color, x, y }) {
  const S   = CUBE_SIZE;
  const box = createBox({
    position:   { x, y, z: S / 2 },
    dimensions: { width: S, depth: S, height: S },
  });

  box.element.style.setProperty('--c', hexToRgbTriplet(color));

  for (const face of ['top', 'front', 'back', 'left', 'right']) {
    box.faces[face].element.appendChild(createLabel(name));
  }

  return box;
}
