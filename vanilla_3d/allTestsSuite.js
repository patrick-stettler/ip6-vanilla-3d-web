// noinspection ES6TopLevelAwaitExpression

import {setupTestEnv} from "./setup-test-env.js";
import {failed} from "../kolibri-dist-0.9.10/kolibri/util/test.js";

await setupTestEnv();

// objects
await import ('./objects/object-3d/object-3d.test.js');
await import ('./objects/plane/plane.test.js');
await import ('./objects/box/box.test.js');
await import ('./objects/axis-helper/axis-helper.test.js');
await import ('./objects/cylinder/cylinder.test.js');
await import ('./objects/pyramid/pyramid.test.js');
await import ('./objects/sphere/sphere.test.js');
await import ('./objects/tetrahedron/tetrahedron.test.js');

// scene
await import ('./scene/functions/is-interactive.test.js');
await import ('./scene/functions/bind-controls.test.js');

// utils
await import ('./textures/texture.test.js');
await import ('./utils/euler-from-normal-deg.test.js');
await import ('./utils/load-css.test.js');
await import ('./utils/clamp.test.js');
await import ('./utils/transf-mat.test.js');
await import ('./utils/mat4.test.js');
await import ('./utils/vector.test.js');


const isNode = typeof process !== "undefined" && !!process.versions?.node;

if (isNode) {
    process.exit(failed.getValue() ? 1 : 0);
}