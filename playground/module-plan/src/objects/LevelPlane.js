import { createPlane }  from '../../../vanilla_3d/objects/plane/plane.js';
import { levelZ, levelIndexToColor, LEVEL_LABELS, LEVEL_INDEX } from '../config.js';

export function createLevelPlane(levelIndex, extent) {
  const color = levelIndexToColor(levelIndex);
  const plane = createPlane({
    position:   { x: extent.cx, y: extent.cy, z: levelZ(levelIndex) },
    dimensions: { width: extent.w + 8, depth: extent.d + 8 },
  });

  plane.element.style.setProperty('--base-color',          color);
  plane.element.style.setProperty('--base-transparency',   levelIndex === LEVEL_INDEX.BASE ? '80%' : '88%');
  plane.element.style.setProperty('--border-color',        color);
  plane.element.style.setProperty('--border-transparency', '35%');
  plane.element.style.setProperty('--border-width',        '1px');
  plane.element.innerHTML = `<span class="level-label" style="color:${color}">${LEVEL_LABELS[levelIndex]}</span>`;

  return plane;
}
