import { TestSuite } from "../../../kolibri-dist-0.9.10/kolibri/util/test.js";
import { testObject3dContract } from "../object-3d/object-3d.test.js";
import { approx } from "../../utils/approx.js";
import {createPyramid} from "./pyramid.js";

const suite = TestSuite("objects/pyramid");

testObject3dContract(suite, createPyramid);

suite.add("type is pyramid and element has class pyramid", assert => {
    const p = createPyramid();
    assert.is(p.type, "pyramid");
    assert.isTrue(p.element.classList.contains("pyramid"));
});

suite.add("dimensions default to 1 and css vars set", assert => {
    const p = createPyramid();

    const d = p.getDimensions();
    assert.is(d.width, 1);
    assert.is(d.height, 1);
    assert.is(d.depth, 1);

    assert.is(p.element.style.getPropertyValue("--width"), "1");
    assert.is(p.element.style.getPropertyValue("--height"), "1");
    assert.is(p.element.style.getPropertyValue("--depth"), "1");
});

suite.add("creates 5 faces (front/back/left/right/bottom)", assert => {
    const p = createPyramid({ dimensions: { width: 2, height: 3, depth: 4 } });

    const f = p.faces;
    assert.isTrue(f !== null);

    assert.isTrue(!!f.front);
    assert.isTrue(!!f.back);
    assert.isTrue(!!f.left);
    assert.isTrue(!!f.right);
    assert.isTrue(!!f.bottom);

    assert.isTrue(f.front.element instanceof HTMLElement);
    assert.isTrue(f.bottom.element instanceof HTMLElement);
});

suite.add("tri-face class is applied to 4 side faces only", assert => {
    const p = createPyramid();
    const f = p.faces;

    assert.isTrue(f.front.element.classList.contains("tri-face"));
    assert.isTrue(f.back.element.classList.contains("tri-face"));
    assert.isTrue(f.left.element.classList.contains("tri-face"));
    assert.isTrue(f.right.element.classList.contains("tri-face"));

    assert.isTrue(!f.bottom.element.classList.contains("tri-face"));
});

suite.add("faces are appended to pyramid element", assert => {
    const p = createPyramid();
    const f = p.faces;

    const children = Array.from(p.element.children);

    // ensureFaces() adds in order: front, back, left, right, bottom
    assert.is(children.length, 5);
    assert.is(children[0], f.front.element);
    assert.is(children[1], f.back.element);
    assert.is(children[2], f.left.element);
    assert.is(children[3], f.right.element);
    assert.is(children[4], f.bottom.element);
});

suite.add("bottom face position depends on height (z = -H/2)", assert => {
    const p = createPyramid({ dimensions: { width: 2, height: 10, depth: 4 } });
    const bottom = p.faces.bottom;

    assert.isTrue(approx(bottom.getPosition().x, 0));
    assert.isTrue(approx(bottom.getPosition().y, 0));
    assert.isTrue(approx(bottom.getPosition().z, -5));
});

suite.add("front/back/left/right face positions match specs for given dimensions", assert => {
    const W = 8, H = 6, D = 4;
    const p = createPyramid({ dimensions: { width: W, height: H, depth: D } });
    const f = p.faces;

    // front: y = D/4, back: y = -D/4
    assert.isTrue(approx(f.front.getPosition().y, D / 4));
    assert.isTrue(approx(f.back.getPosition().y, -D / 4));

    // left: x = -W/4, right: x = W/4
    assert.isTrue(approx(f.left.getPosition().x, -W / 4));
    assert.isTrue(approx(f.right.getPosition().x, W / 4));
});

suite.add("setDimensions updates state, css vars, and face geometry", assert => {
    const p = createPyramid({ dimensions: { width: 2, height: 2, depth: 2 } });
    const f = p.faces;

    const oldBottomZ = f.bottom.getPosition().z;
    assert.isTrue(approx(oldBottomZ, -1));

    p.setDimensions({ height: 10 });

    const d = p.getDimensions();
    assert.is(d.height, 10);
    assert.is(p.element.style.getPropertyValue("--height"), "10");

    // bottom should move: -H/2 => -5
    const newBottomZ = p.faces.bottom.getPosition().z;
    assert.isTrue(approx(newBottomZ, -5));
});

suite.add("dimensions getter returns a copy (external mutation does not affect state)", assert => {
    const p = createPyramid({ dimensions: { width: 2, height: 3, depth: 4 } });

    const d1 = p.getDimensions();
    d1.width = 999;
    d1.height = 999;
    d1.depth = 999;

    const d2 = p.getDimensions();
    assert.is(d2.width, 2);
    assert.is(d2.height, 3);
    assert.is(d2.depth, 4);
});

suite.run();