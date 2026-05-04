import {vecApprox} from "./approx.js";
import {
    applyDirection,
    buildRotationMatrix,
    mat4ToCssMatrix3d,
    mat4ToEulerDeg,
    buildLookRotation
} from "./transf-mat.js";
import {TestSuite} from "../../kolibri-dist-0.9.10/kolibri/util/test.js";

const suite = TestSuite("utils/transf-mat");

const len = v => Math.hypot(v.x, v.y, v.z);
const norm = v => {
    const l = len(v) || 1;
    return {x: v.x / l, y: v.y / l, z: v.z / l};
};

suite.add("applyDirection identity keeps vector", assert => {
    const I = [
        1,0,0,0,
        0,1,0,0,
        0,0,1,0,
        0,0,0,1
    ];
    const v = {x: 1, y: -2, z: 3};
    const r = applyDirection(I, v);
    assert.isTrue(vecApprox(r, v));
});

suite.add("buildRotationMatrix z=90 rotates local X to world Y", assert => {
    const m = buildRotationMatrix({x: 0, y: 0, z: 90});
    const r = applyDirection(m, {x: 1, y: 0, z: 0});
    assert.isTrue(Math.abs(r.x) < 1e-8);
    assert.isTrue(Math.abs(r.y - 1) < 1e-8);
    assert.isTrue(Math.abs(r.z) < 1e-8);
});

suite.add("mat4ToCssMatrix3d formats correctly", assert => {
    const m = buildRotationMatrix({x: 0, y: 0, z: 0});
    const s = mat4ToCssMatrix3d(m);
    assert.isTrue(s.startsWith("matrix3d("));
    assert.isTrue(s.endsWith(")"));
    assert.is(s.split(",").length, 16);
});

suite.add("mat4ToEulerDeg approximately inverts buildRotationMatrix (simple angles)", assert => {
    const inRot = {x: 10, y: 20, z: 30};
    const m = buildRotationMatrix(inRot);
    const out = mat4ToEulerDeg(m);

    assert.isTrue(Math.abs(out.x - inRot.x) < 1e-4);
    assert.isTrue(Math.abs(out.y - inRot.y) < 1e-4);
    assert.isTrue(Math.abs(out.z - inRot.z) < 1e-4);
});

suite.add("mat4ToEulerDeg handles gimbal lock without NaN", assert => {
    const m = buildRotationMatrix({x: 25, y: 90, z: 40});
    const out = mat4ToEulerDeg(m);

    assert.isTrue(Number.isFinite(out.x));
    assert.isTrue(Number.isFinite(out.y));
    assert.isTrue(Number.isFinite(out.z));
    assert.isTrue(Math.abs(out.z) < 1e-6);
});

suite.add("buildLookRotation aligns forward axis (default forward=y)", assert => {
    const dir = norm({x: 2, y: 3, z: 4});
    const M = buildLookRotation(dir);

    const fLocal = {x: 0, y: 1, z: 0};
    const fWorld = norm(applyDirection(M, fLocal));

    assert.isTrue(vecApprox(fWorld, dir, 1e-6));
});

suite.add("buildLookRotation aligns forward axis when forwardAxis='x'", assert => {
    const dir = norm({x: -1, y: 0.5, z: 0});
    const M = buildLookRotation(dir, {forwardAxis: "x"});

    const fLocal = {x: 1, y: 0, z: 0};
    const fWorld = norm(applyDirection(M, fLocal));

    assert.isTrue(vecApprox(fWorld, dir, 1e-6));
});

suite.add("buildLookRotation handles dir parallel to up (no NaN)", assert => {
    const dir = {x: 0, y: 0, z: 1};
    const M = buildLookRotation(dir);

    const fWorld = applyDirection(M, {x: 0, y: 1, z: 0});
    assert.isTrue(Number.isFinite(fWorld.x));
    assert.isTrue(Number.isFinite(fWorld.y));
    assert.isTrue(Number.isFinite(fWorld.z));
});

suite.run();