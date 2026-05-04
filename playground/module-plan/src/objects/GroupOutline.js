import { createPlane } from '../../../vanilla_3d/objects/plane/plane.js';

export function createGroupOutline(rect, group) {
  const plane = createPlane({
    position:   { x: rect.x + rect.w / 2, y: rect.y + rect.d / 2, z: 0.02 },
    dimensions: { width: rect.w, depth: rect.d },
  });

  plane.element.style.setProperty('--base-transparency',   '100%');
  plane.element.style.setProperty('--border-color',        group.color ?? '#fff');
  plane.element.style.setProperty('--border-transparency', '0%');
  plane.element.style.setProperty('--border-width',        '2px');
  plane.element.innerHTML = `<span class="group-label" style="color:${group.color}">${group.name}</span>`;

  return plane;
}
