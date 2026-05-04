import { TestSuite } from "../../../kolibri-dist-0.9.10/kolibri/util/test.js";
import { testObject3dContract } from "../object-3d/object-3d.test.js";
import { approx } from "../../utils/approx.js";
import {createCylinder} from "./cylinder.js";

const suite = TestSuite("objects/cylinder");

testObject3dContract(suite, createCylinder);

suite.add("type is cylinder and element has class cylinder", assert => {
    const c = createCylinder();
    assert.is(c.type, "cylinder");
    assert.isTrue(c.element.classList.contains("cylinder"));
});

suite.add("dimensions default to radius=0.5 height=1 and css vars set", assert => {
    const c = createCylinder();

    const d = c.getDimensions();
    assert.isTrue(approx(d.radius, 0.5));
    assert.isTrue(approx(d.height, 1));

    assert.is(c.element.style.getPropertyValue("--radius"), "0.5");
    assert.is(c.element.style.getPropertyValue("--height"), "1");
});

suite.add("radialSegments defaults to 64 (creates 64 sides + 2 caps)", assert => {
    const c = createCylinder();

    // sides are planes, plus top+bottom cap planes
    assert.is(c.faces.sides.length, 64);
    assert.isTrue(!!c.faces.top);
    assert.isTrue(!!c.faces.bottom);

    // DOM children should contain all sides + caps
    assert.is(c.element.children.length, 64 + 2);

    const sideElems = c.element.querySelectorAll(".cylinder-side");
    const capElems = c.element.querySelectorAll(".cylinder-cap");
    assert.is(sideElems.length, 64);
    assert.is(capElems.length, 2);
});

suite.add("radialSegments is clamped to minimum 3", assert => {
    const c = createCylinder({ radialSegments: 1 });

    assert.is(c.faces.sides.length, 3);
    assert.is(c.element.querySelectorAll(".cylinder-side").length, 3);
    assert.is(c.element.querySelectorAll(".cylinder-cap").length, 2);
    assert.is(c.element.children.length, 3 + 2);
});

suite.add("setDimensions updates css vars and rebuilds faces", assert => {
    const c = createCylinder({ radialSegments: 8 });

    c.setDimensions({ radius: 2, height: 3 });

    const d = c.getDimensions();
    assert.isTrue(approx(d.radius, 2));
    assert.isTrue(approx(d.height, 3));

    assert.is(c.element.style.getPropertyValue("--radius"), "2");
    assert.is(c.element.style.getPropertyValue("--height"), "3");

    // still correct count
    assert.is(c.faces.sides.length, 8);
    assert.is(c.element.children.length, 8 + 2);
});

suite.add("top/bottom caps have expected positions based on height", assert => {
    const c = createCylinder({ dimensions: { radius: 1, height: 10 }, radialSegments: 12 });

    const top = c.faces.top;
    const bottom = c.faces.bottom;

    assert.isTrue(approx(top.getPosition().x, 0));
    assert.isTrue(approx(top.getPosition().y, 5));
    assert.isTrue(approx(top.getPosition().z, 0));

    assert.isTrue(approx(bottom.getPosition().x, 0));
    assert.isTrue(approx(bottom.getPosition().y, -5));
    assert.isTrue(approx(bottom.getPosition().z, 0));
});

suite.add("side strips are placed on circle with radius (x^2+z^2 ~= r^2)", assert => {
    const r = 2;
    const c = createCylinder({ dimensions: { radius: r, height: 1 }, radialSegments: 16 });

    c.faces.sides.forEach(p => {
        const x = p.getPosition().x;
        const z = p.getPosition().z;
        const rr = x * x + z * z;
        assert.isTrue(Math.abs(rr - r * r) < 1e-6);
    });
});

suite.add("dimensions getter returns a copy (external mutation does not affect state)", assert => {
    const c = createCylinder({ dimensions: { radius: 1, height: 2 } });

    const d1 = c.getDimensions();
    d1.radius = 999;
    d1.height = 999;

    const d2 = c.getDimensions();
    assert.isTrue(approx(d2.radius, 1));
    assert.isTrue(approx(d2.height, 2));
});

suite.run();