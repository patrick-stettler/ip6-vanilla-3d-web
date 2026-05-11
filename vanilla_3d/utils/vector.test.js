import {TestSuite} from "../../kolibri-dist-0.9.10/kolibri/util/test.js";
import {normalize, cross, dot, sub, mul} from "./vector.js";
import {approx} from "./approx.js";

const suite = TestSuite("utils/vector");

const assertVecApprox = (assert, actual, expected) => {
    assert.isTrue(approx(actual.x, expected.x));
    assert.isTrue(approx(actual.y, expected.y));
    assert.isTrue(approx(actual.z, expected.z));
};

suite.add("dot basic cases", assert => {
    assert.is(dot({x: 1, y: 2, z: 3}, {x: 4, y: 5, z: 6}), 32); // 1*4+2*5+3*6
    assert.is(dot({x: 1, y: 0, z: 0}, {x: 0, y: 1, z: 0}), 0);
    assert.is(dot({x: 0, y: 0, z: 0}, {x: 9, y: 8, z: 7}), 0);
    assert.is(dot({x: -1, y: -2, z: -3}, {x: 1, y: 2, z: 3}), -14);
});

suite.add("dot is commutative", assert => {
    const a = {x: 2, y: -3, z: 4};
    const b = {x: -1, y: 5, z: 2};
    assert.is(dot(a, b), dot(b, a));
});

suite.add("dot is distributive over addition (via subtraction)", assert => {
    // dot(a, b - c) == dot(a, b) - dot(a, c)
    const a = {x: 2, y: -3, z: 4};
    const b = {x: -1, y: 5, z: 2};
    const c = {x: 3, y: 1, z: -2};

    const lhs = dot(a, sub(b, c));
    const rhs = dot(a, b) - dot(a, c);
    assert.isTrue(approx(lhs, rhs));
});

suite.add("cross basis vectors", assert => {
    assertVecApprox(assert, cross({x: 1, y: 0, z: 0}, {x: 0, y: 1, z: 0}), {x: 0, y: 0, z: 1});
    assertVecApprox(assert, cross({x: 0, y: 1, z: 0}, {x: 0, y: 0, z: 1}), {x: 1, y: 0, z: 0});
    assertVecApprox(assert, cross({x: 0, y: 0, z: 1}, {x: 1, y: 0, z: 0}), {x: 0, y: 1, z: 0});
});

suite.add("cross anti-commutative", assert => {
    const a = {x: 2, y: -3, z: 4};
    const b = {x: -1, y: 5, z: 2};

    const axb = cross(a, b);
    const bxa = cross(b, a);

    assertVecApprox(assert, bxa, {x: -axb.x, y: -axb.y, z: -axb.z});
});

suite.add("cross is orthogonal to both inputs", assert => {
    const a = {x: 2, y: -3, z: 4};
    const b = {x: -1, y: 5, z: 2};
    const c = cross(a, b);

    assert.isTrue(Math.abs(dot(c, a)) <= 1e-9);
    assert.isTrue(Math.abs(dot(c, b)) <= 1e-9);
});

suite.add("cross of parallel vectors is zero", assert => {
    const a = {x: 1, y: 2, z: 3};
    const b = {x: 2, y: 4, z: 6}; // parallel to a
    const c = cross(a, b);
    assertVecApprox(assert, c, {x: 0, y: 0, z: 0}, 1e-9);
});

suite.add("cross magnitude matches area (|a×b| = |a||b|sinθ) for perpendicular case", assert => {
    // pick perpendicular vectors: a=(3,0,0), b=(0,4,0) => |a×b| = 12
    const a = {x: 3, y: 0, z: 0};
    const b = {x: 0, y: 4, z: 0};
    const c = cross(a, b);
    const mag = Math.hypot(c.x, c.y, c.z);
    assert.isTrue(approx(mag, 12));
});

suite.add("normalize basic", assert => {
    const v = {x: 3, y: 0, z: 4};
    const n = normalize(v);

    assertVecApprox(assert, n, {x: 0.6, y: 0, z: 0.8}, 1e-12);
    assert.isTrue(approx(Math.hypot(n.x, n.y, n.z), 1));
});

suite.add("normalize keeps direction (n * |v| ≈ v)", assert => {
    const v = {x: 10, y: -20, z: 30};
    const n = normalize(v);

    const l = Math.hypot(v.x, v.y, v.z);
    assertVecApprox(assert, {x: n.x * l, y: n.y * l, z: n.z * l}, v, 1e-9);
});

suite.add("normalize is idempotent (normalize(normalize(v)) = normalize(v))", assert => {
    const v = {x: 10, y: -20, z: 30};
    const n1 = normalize(v);
    const n2 = normalize(n1);
    assertVecApprox(assert, n2, n1, 1e-12);
});

suite.add("normalize zero vector returns zero vector", assert => {
    const n = normalize({x: 0, y: 0, z: 0});
    assert.is(n.x, 0);
    assert.is(n.y, 0);
    assert.is(n.z, 0);
});

suite.add("normalize does not blow up on tiny vector", assert => {
    const v = {x: 1e-300, y: 0, z: 0};
    const n = normalize(v);

    // Note: this is mainly a sanity check, not IEEE-754 proof
    assert.isTrue(approx(n.x, 1));
    assert.isTrue(approx(n.y, 0));
    assert.isTrue(approx(n.z, 0));
});

suite.add("sub basic", assert =>
    assertVecApprox(assert,
        sub({x: 5, y: -2, z: 1}, {x: 1, y: 3, z: 4}),
        {x: 4, y: -5, z: -3}
    )
);

suite.add("mul basic", assert =>
    assertVecApprox(assert,
        mul({x: 1, y: -2, z: 3}, 2.5),
        {x: 2.5, y: -5, z: 7.5}
    )
);

suite.add("dot with normalized vector equals projection length", assert => {
    // projection length of a onto unit b is dot(a, bUnit)
    const a = {x: 3, y: 4, z: 0};
    const b = {x: 10, y: 0, z: 0};
    const bUnit = normalize(b);
    const projLen = dot(a, bUnit);
    assert.isTrue(approx(projLen, 3));
});

suite.run();
