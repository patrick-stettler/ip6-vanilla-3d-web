import { createScene3D } from '../../../vanilla_3d/scene/scene-3d.js';

export const DEFAULT_VIEW = { rotation: { x: 30, z: 0 }, zoom: 0.22 };

export class SceneManager {
  constructor(el) {
    this._scene = createScene3D(el, DEFAULT_VIEW);
    this._scene.addControls({ minZoom: 0.05, maxZoom: 12 });
  }
  add(obj)    { this._scene.addObject(obj); }
  get scene() { return this._scene; }
}
