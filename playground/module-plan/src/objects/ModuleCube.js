import { createBox }     from '../../../vanilla_3d/objects/box/box.js';
import { CUBE_W, CUBE_D, statusToColor } from '../config.js';

const darken = (hex, f = 0.6) => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgb(${Math.round(r*f)},${Math.round(g*f)},${Math.round(b*f)})`;
};

export function createModuleCube({ module, x, y, z, height }) {
  const color = statusToColor(module.status, module.grade);
  const box   = createBox({ position: { x, y, z }, dimensions: { width: CUBE_W, depth: CUBE_D, height } });

  const faceColors = {
    front: color, back: darken(color, 0.75),
    left: darken(color, 0.85), right: darken(color, 0.85),
    top: darken(color, 0.9),   bottom: darken(color, 0.45),
  };

  for (const [key, c] of Object.entries(faceColors)) {
    const el = box.faces[key].element;
    el.style.setProperty('--base-color', c);
    el.style.setProperty('--base-transparency', '0%');
    el.style.setProperty('--border-color', darken(color, 0.4));
    el.style.setProperty('--border-transparency', '0%');
    el.style.setProperty('--border-width', '1px');
  }

  for (const side of ['front', 'back', 'left', 'right']) {
    box.faces[side].element.innerHTML =
      `<div class="face-content">
         <span class="cube-name">${module.name}</span>
         <span class="cube-ects">${module.ects} ECTS</span>
       </div>`;
  }

  if (module.grade != null) {
    box.faces.top.element.innerHTML = `<span class="cube-grade">${module.grade.toFixed(1)}</span>`;
  }

  return box;
}
