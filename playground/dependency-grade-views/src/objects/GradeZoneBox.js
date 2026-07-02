import { createBox } from '../../../../vanilla_3d/objects/box/box.js';

export { createGradeZoneBox };

/**
 * @typedef {Object} GradeZoneBoxConfigType
 * @property {!number}            width     - footprint width, matching the base plane. Mandatory.
 * @property {!number}            depth     - footprint depth, matching the base plane. Mandatory.
 * @property {!number}            height    - vertical extent of the zone, from the base plane outward. Mandatory.
 * @property {!('above'|'below')} direction - whether the zone sits above (green) or below (red) the base plane. Mandatory.
 */

/**
 * Creates a translucent volume marking the "good" (above ground, green) or
 * "bad" (below ground, red) grade zone, spanning the full footprint of the
 * base plane. Purely decorative: its faces ignore pointer events so clicks
 * pass straight through to the cubes and the background underneath.
 * @param  {!GradeZoneBoxConfigType} config - dimensions and direction of the zone. Mandatory.
 * @return {BoxType}
 * @example
 *     scene.add(createGradeZoneBox({ width: 10, depth: 8, height: 12, direction: 'above' }));
 */
function createGradeZoneBox({ width, depth, height, direction }) {
  const z   = direction === 'above' ? height / 2 : -height / 2;
  const box = createBox({
    position:   { x: 0, y: 0, z },
    dimensions: { width, depth, height },
  });

  box.element.classList.add('grade-zone', `grade-zone--${direction}`);

  return box;
}
