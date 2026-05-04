import {TestSuite} from "../../../kolibri-dist-0.9.10/kolibri/util/test.js";
import {testObject3dContract} from "../object-3d/object-3d.test.js";
import {applyDirection, buildRotationMatrix} from "../../utils/transf-mat.js";
import {approx, vecApprox} from "../../utils/approx.js";
import {createBox} from "./box.js";

const suite = TestSuite("objects/box");

const keys = ["front", "back", "left", "right", "top", "bottom"];

testObject3dContract(suite, createBox);

suite.add("dimensions defaults to 1", assert => {
    const b = createBox();

    const d = b.getDimensions();
    assert.is(d.width, 1);
    assert.is(d.height, 1);
    assert.is(d.depth, 1);

    assert.is(b.element.style.getPropertyValue("--width"), "1");
    assert.is(b.element.style.getPropertyValue("--height"), "1");
    assert.is(b.element.style.getPropertyValue("--depth"), "1");
});

suite.add("setDimensions updates state and css vars", assert => {
    const b = createBox();

    b.setDimensions({width: 2, height: 3, depth: 4});

    const d = b.getDimensions();
    assert.is(d.width, 2);
    assert.is(d.height, 3);
    assert.is(d.depth, 4);

    assert.is(b.element.style.getPropertyValue("--width"), "2");
    assert.is(b.element.style.getPropertyValue("--height"), "3");
    assert.is(b.element.style.getPropertyValue("--depth"), "4");
});

suite.add("creates all 6 faces", assert => {
    const b = createBox({dimensions: {width: 2, height: 3, depth: 4}});

    const f = b.faces;
    assert.isTrue(f !== null);

    keys.forEach(k => {
        assert.isTrue(!!f[k]);
        assert.isTrue(f[k].element instanceof HTMLElement);
        assert.isTrue(f[k].element.classList.contains(k));
    });
});

suite.add("faces are appended to box element", assert => {
    const b = createBox();

    const f = b.faces;
    const children = Array.from(b.element.children);

    keys.forEach(k =>
        assert.isTrue(children.includes(f[k].element))
    );
});

suite.add("face positions match specs for given dimensions", assert => {
    const W = 2, H = 3, D = 4;
    const hx = W / 2;
    const hy = D / 2;
    const hz = H / 2;

    const b = createBox({ dimensions: { width: W, height: H, depth: D } });
    const f = b.faces;

    const pos = p => p.getPosition();

    // FRONT
    const pFront = pos(f.front);
    assert.isTrue(approx(pFront.x, 0));
    assert.isTrue(approx(pFront.y, hy));
    assert.isTrue(approx(pFront.z, 0));

    // BACK
    const pBack = pos(f.back);
    assert.isTrue(approx(pBack.x, 0));
    assert.isTrue(approx(pBack.y, -hy));
    assert.isTrue(approx(pBack.z, 0));

    // LEFT
    const pLeft = pos(f.left);
    assert.isTrue(approx(pLeft.x, -hx));
    assert.isTrue(approx(pLeft.y, 0));
    assert.isTrue(approx(pLeft.z, 0));

    // RIGHT
    const pRight = pos(f.right);
    assert.isTrue(approx(pRight.x, hx));
    assert.isTrue(approx(pRight.y, 0));
    assert.isTrue(approx(pRight.z, 0));

    // TOP
    const pTop = pos(f.top);
    assert.isTrue(approx(pTop.x, 0));
    assert.isTrue(approx(pTop.y, 0));
    assert.isTrue(approx(pTop.z, hz));

    // BOTTOM
    const pBottom = pos(f.bottom);
    assert.isTrue(approx(pBottom.x, 0));
    assert.isTrue(approx(pBottom.y, 0));
    assert.isTrue(approx(pBottom.z, -hz));
});


suite.add("face rotations match expected normals", assert => {
    const b = createBox({ dimensions: { width: 2, height: 3, depth: 4 } });
    const f = b.faces;

    // assume plane local normal is +Z
    const n0 = { x: 0, y: 0, z: 1 };

    const normalOf = plane => {
        const R = buildRotationMatrix(plane.getRotation());
        const n = applyDirection(R, n0);

        // normalize for safety
        const l = Math.hypot(n.x, n.y, n.z) || 1;
        return { x: n.x / l, y: n.y / l, z: n.z / l };
    };

    // expected world normals for each face
    const exp = {
        front:  { x: 0, y: 1, z: 0 },
        back:   { x: 0, y: -1, z: 0 },
        left:   { x: -1, y: 0, z: 0 },
        right:  { x: 1, y: 0, z: 0 },
        top:    { x: 0, y: 0, z: 1 },
        bottom: { x: 0, y: 0, z: -1 },
    };

    Object.entries(exp).forEach(([k, expected]) => {
        const n = normalOf(f[k]);
        assert.isTrue(vecApprox(n, expected));
    });
});

suite.add("setDimensions updates faces too", assert => {
    const b = createBox();

    // start small
    b.setDimensions({width: 2, height: 2, depth: 2});
    const f1 = b.faces;
    const p1 = f1.front.getPosition();
    assert.isTrue(approx(p1.y, 1)); // hy = depth/2

    // change depth, front/back should move
    b.setDimensions({depth: 10});
    const f2 = b.faces;
    const p2 = f2.front.getPosition();
    assert.isTrue(approx(p2.y, 5));
});

suite.run();