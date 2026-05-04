import {radToDeg, degToRad, eulerFromNormalDeg} from "./euler-from-normal-deg.js";
import {buildRotationMatrix, applyDirection} from "./transf-mat.js";
import {vecApprox} from "./approx.js";
import {TestSuite} from "../../kolibri-dist-0.9.10/kolibri/util/test.js";

const suite = TestSuite("utils/euler-from-normal-deg");

const norm = v => {
    const l = Math.hypot(v.x, v.y, v.z) || 1;
    return {x: v.x / l, y: v.y / l, z: v.z / l};
};

suite.add("degToRad and radToDeg are inverses (basic values)", assert => {
    assert.is(degToRad(180), Math.PI);
    assert.is(radToDeg(Math.PI), 180);
    assert.is(degToRad(0), 0);
    assert.is(radToDeg(0), 0);
});

suite.add("eulerFromNormalDeg(+Z) keeps +Z direction", assert => {
    const e = eulerFromNormalDeg(0, 0, 1);
    const R = buildRotationMatrix(e);

    const z = applyDirection(R, {x: 0, y: 0, z: 1});
    assert.isTrue(vecApprox(norm(z), {x: 0, y: 0, z: 1}));
});

suite.add("eulerFromNormalDeg(-Z) maps +Z to -Z direction", assert => {
    const e = eulerFromNormalDeg(0, 0, -1);
    const R = buildRotationMatrix(e);

    const z = applyDirection(R, {x: 0, y: 0, z: 1});
    assert.isTrue(vecApprox(norm(z), {x: 0, y: 0, z: -1}));
});

suite.add("eulerFromNormalDeg(+X) maps +Z to +X", assert => {
    const e = eulerFromNormalDeg(1, 0, 0);
    const R = buildRotationMatrix(e);

    const z = applyDirection(R, {x: 0, y: 0, z: 1});
    assert.isTrue(vecApprox(norm(z), {x: 1, y: 0, z: 0}));
});

suite.add("eulerFromNormalDeg(+Y) maps +Z to +Y", assert => {
    const e = eulerFromNormalDeg(0, 1, 0);
    const R = buildRotationMatrix(e);

    const z = applyDirection(R, {x: 0, y: 0, z: 1});
    assert.isTrue(vecApprox(norm(z), {x: 0, y: 1, z: 0}));
});

suite.add("eulerFromNormalDeg(diagonal normal) maps +Z to that normal (normalized)", assert => {
    const target = norm({x: 1, y: 2, z: 3});

    const e = eulerFromNormalDeg(target.x, target.y, target.z);
    const R = buildRotationMatrix(e);

    const z = applyDirection(R, {x: 0, y: 0, z: 1});
    assert.isTrue(vecApprox(norm(z), target));
});

suite.run();