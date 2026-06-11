import { createScene3D } from '/../vanilla_3d/scene/scene-3d.js';
import { createBox } from '/../vanilla_3d/objects/box/box.js';
import { createPlane } from '/../vanilla_3d/objects/plane/plane.js';

// Konstante
const CUBE_SIZE = 2;
const CUBE_GAP = 0.4;
const PADDING = 1.5;

// Daten
const data = [
  { id: 0,  name: 'Grau',       grade: null,    status: 'not_started' },
  { id: 1,  name: 'Blau',       grade: 3.0,     status: 'ongoing' },
  { id: 2,  name: 'Orange',     grade: 3.5,     status: 'failed_one' },
  { id: 3,  name: 'Rot',        grade: null,    status: 'failed_twice' },
  { id: 4,  name: 'Grün',       grade: 5.0,     status: 'passed' },
];

// Szene
const container = document.getElementById('scene');
const scene3D = createScene3D(container, { rotation: { x: -35, z: 45 }, zoom: 0.45 });
scene3D.addControls({ minZoom: 0.05, maxZoom: 12 });

// Bodenplatte
const totalWidth = data.length * CUBE_SIZE + (data.length - 1) * CUBE_GAP + PADDING * 2;
const totalDepth = CUBE_SIZE + PADDING * 2;
const basePlane = createPlane({
  position: { x: 0, y: 0, z: 0 },
  dimensions: { width: totalWidth, depth: totalDepth },
});
basePlane.element.classList.add('ground-floor');
scene3D.addObject(basePlane);

// Würfel
const step = CUBE_SIZE + CUBE_GAP;
const startX = -((data.length - 1) * step) / 2;
data.forEach((item, i) => {
  const box = createBox({
    position: { x: startX + i * step, y: 0, z: CUBE_SIZE / 2 },
    dimensions: { width: CUBE_SIZE, depth: CUBE_SIZE, height: CUBE_SIZE },
  });
  const boxEl = box.element;

  boxEl.dataset.status = item.status;

  ['front'].forEach(face => {
    const span = document.createElement('span');
    span.classList.add('cube-label');
    span.textContent = item.name;
    box.faces[face].element.appendChild(span);
  });

  // Events
  boxEl.addEventListener('click', (e) => {
    e.stopPropagation();
    const isAlreadyFocused = boxEl.classList.contains('is-focused');
    document.querySelectorAll('.box.is-focused').forEach(el => el.classList.remove('is-focused'));
    if (isAlreadyFocused) {
      container.classList.remove('has-selection');
    } 
    else {
      container.classList.add('has-selection');
      boxEl.classList.add('is-focused');
    }
  });

  scene3D.addObject(box);
});

container.addEventListener('click', () => {
  container.classList.remove('has-selection');
  document.querySelectorAll('.box.is-focused').forEach(el => el.classList.remove('is-focused'));
});