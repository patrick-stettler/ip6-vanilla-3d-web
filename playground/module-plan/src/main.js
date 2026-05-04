import { SceneManager }               from './scene/SceneManager.js';
import { computeLayout, sceneExtent } from './layout/LayoutEngine.js';
import { createModuleCube }           from './objects/ModuleCube.js';
import { createGroupOutline }         from './objects/GroupOutline.js';
import { createLevelPlane }           from './objects/LevelPlane.js';
import { modules, groups }            from './data/modules.js';
import { LEVEL_INDEX, STATUS }        from './config.js';

const scene  = new SceneManager(document.getElementById('scene'));
const camera = scene.scene;

const layouts = computeLayout(modules, groups);
const extent  = sceneExtent(layouts);

for (const idx of Object.values(LEVEL_INDEX)) scene.add(createLevelPlane(idx, extent));

const cubeEntries = [];
for (const gl of layouts) {
  scene.add(createGroupOutline(gl.rect, gl.group));
  for (const pos of gl.modulePositions) {
    const box = createModuleCube(pos);
    cubeEntries.push({ box, module: pos.module });
    scene.add(box);
  }
}


