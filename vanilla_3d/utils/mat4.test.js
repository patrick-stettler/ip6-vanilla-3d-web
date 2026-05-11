import {TestSuite} from "../../kolibri-dist-0.9.10/kolibri/util/test.js";
import {
    mat4Identity,
    mat4Mul,
    mat4Translate,
    mat4Scale,
    mat4RotateX,
    mat4RotateY,
    mat4RotateZ,
    mat4Invert,
    applyMat4
} from "./mat4.js";
import {approx} from "./approx.js";

const suite = TestSuite("utils/mat4");

const assertMatApprox = (assert, a, b) => {
    for (let i = 0; i < 16; i++) {
        assert.isTrue(approx(a[i], b[i]));
    }
};

suite.add("identity * identity = identity", assert => {
    const I = mat4Identity();
    assertMatApprox(assert, mat4Mul(I, I), I);
});

suite.add("identity does not change vector", assert => {
    const v = { x: 1, y: 2, z: 3 };
    const r = applyMat4(mat4Identity(), v);

    assert.isTrue(approx(r.x, 1));
    assert.isTrue(approx(r.y, 2));
    assert.isTrue(approx(r.z, 3));
});

suite.add("translation moves vector", assert => {
    const m = mat4Translate(5, -2, 3);
    const r = applyMat4(m, { x: 1, y: 1, z: 1 });

    assert.isTrue(approx(r.x, 6));
    assert.isTrue(approx(r.y, -1));
    assert.isTrue(approx(r.z, 4));
});

suite.add("scaling scales vector", assert => {
    const m = mat4Scale(2, 3, 4);
    const r = applyMat4(m, { x: 1, y: 1, z: 1 });

    assert.isTrue(approx(r.x, 2));
    assert.isTrue(approx(r.y, 3));
    assert.isTrue(approx(r.z, 4));
});

suite.add("rotation X 90deg", assert => {
    const m = mat4RotateX(Math.PI / 2);

    // (0,1,0) -> (0,0,1)
    const r1 = applyMat4(m, { x: 0, y: 1, z: 0 });
    assert.isTrue(approx(r1.x, 0));
    assert.isTrue(approx(r1.y, 0));
    assert.isTrue(approx(r1.z, 1));

    // (0,0,1) -> (0,-1,0)
    const r2 = applyMat4(m, { x: 0, y: 0, z: 1 });
    assert.isTrue(approx(r2.x, 0));
    assert.isTrue(approx(r2.y, -1));
    assert.isTrue(approx(r2.z, 0));
});

suite.add("rotation Y 90deg", assert => {
    const m = mat4RotateY(Math.PI / 2);

    // (1,0,0) -> (0,0,-1)
    const r1 = applyMat4(m, { x: 1, y: 0, z: 0 });
    assert.isTrue(approx(r1.x, 0));
    assert.isTrue(approx(r1.y, 0));
    assert.isTrue(approx(r1.z, -1));

    // (0,0,1) -> (1,0,0)
    const r2 = applyMat4(m, { x: 0, y: 0, z: 1 });
    assert.isTrue(approx(r2.x, 1));
    assert.isTrue(approx(r2.y, 0));
    assert.isTrue(approx(r2.z, 0));
});

suite.add("rotation Z 90deg", assert => {
    const m = mat4RotateZ(Math.PI / 2);
    const r = applyMat4(m, { x: 1, y: 0, z: 0 });

    assert.isTrue(approx(r.x, 0));
    assert.isTrue(approx(r.y, 1));
    assert.isTrue(approx(r.z, 0));
});

suite.add("matrix inversion", assert => {
    const m = mat4Mul(
        mat4Translate(3, 4, 5),
        mat4RotateY(0.5)
    );

    const inv = mat4Invert(m);
    assert.isTrue(inv !== null);

    const I = mat4Mul(m, inv);
    assertMatApprox(assert, I, mat4Identity());
});

suite.add("invert singular matrix returns null", assert => {
    const m = mat4Scale(0, 1, 1);
    assert.is(mat4Invert(m), null);
});

suite.run();
