import { createSceneManager } from './scene/SceneManager.js';
import { createCube }         from './objects/Cube.js';
import { createBasePlane }    from './objects/BasePlane.js';
import { cubes, CUBE_SIZE, CUBE_GAP } from './data/cubes.js';

/** @type { Object } SceneManagerType */
const scene = createSceneManager(document.getElementById('scene'));

scene.add(createBasePlane());

/** @type { number } */
const step = CUBE_SIZE + CUBE_GAP;

/** @type { number } */
const startX = -((cubes.length - 1) * step) / 2;

for (let i = 0; i < cubes.length; i++) {
  const x = startX + i * step;
  scene.add(createCube({ ...cubes[i], x, y: 0 }));
}
