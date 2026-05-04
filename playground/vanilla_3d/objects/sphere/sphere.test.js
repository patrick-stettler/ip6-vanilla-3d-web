import { TestSuite } from "../../../kolibri-dist-0.9.10/kolibri/util/test.js";
import { approx } from "../../utils/approx.js";
import {testObject3dContract} from "../object-3d/object-3d.test.js";
import {createSphere} from "./sphere.js";

const suite = TestSuite("objects/sphere");

testObject3dContract(suite, createSphere);

suite.add("type is sphere and element has class sphere", assert => {
    const s = createSphere();
    assert.is(s.type, "sphere");
    assert.isTrue(s.element.classList.contains("sphere"));
});

suite.add("dimensions default to radius=0.5 and css var is set", assert => {
    const s = createSphere();

    const d = s.getDimensions();
    assert.isTrue(approx(d.radius, 0.5));
    assert.is(s.element.style.getPropertyValue("--radius"), "0.5");
});

suite.add("creates slices*stacks faces (defaults 20*10=200)", assert => {
    const s = createSphere();

    assert.is(s.faces.length, 200);

    const faceElems = s.element.querySelectorAll(".sphere-face");
    assert.is(faceElems.length, 200);
});

suite.add("custom slices/stacks create correct amount of faces", assert => {
    const slices = 8;
    const stacks = 6;
    const s = createSphere({ slices, stacks });

    assert.is(s.faces.length, slices * stacks);
    assert.is(s.element.querySelectorAll(".sphere-face").length, slices * stacks);
});

suite.add("faces array elements are HTMLElements and are in DOM", assert => {
    const s = createSphere({ slices: 4, stacks: 3 });

    assert.is(s.faces.length, 12);

    s.faces.forEach(el => {
        assert.isTrue(el instanceof HTMLElement);
        assert.isTrue(el.classList.contains("sphere-face"));
        assert.isTrue(s.element.contains(el));
    });
});

suite.add("each face has essential inline styles", assert => {
    const s = createSphere({ slices: 3, stacks: 2 });

    s.faces.forEach(el => {
        assert.isTrue(el.style.width.length > 0);
        assert.isTrue(el.style.height.length > 0);
        assert.isTrue(el.style.transform.includes("rotateY("));
        assert.isTrue(el.style.transform.includes("rotateX("));
        assert.isTrue(el.style.transform.includes("translateZ("));
        assert.isTrue(el.style.clipPath.includes("polygon("));
    });
});

suite.add("transform uses radius (translateZ contains radius value)", assert => {
    const s = createSphere({ dimensions: { radius: 2 }, slices: 3, stacks: 2 });

    const anyFace = s.faces[0];
    assert.isTrue(!!anyFace);

    assert.isTrue(anyFace.style.transform.includes("calc(2 * var(--display-unit))"));
});

suite.add("setDimensions updates radius css var and does not duplicate faces", assert => {
    const slices = 5;
    const stacks = 4;
    const s = createSphere({ slices, stacks, dimensions: { radius: 1 } });

    const before = [...s.faces];
    assert.is(before.length, slices * stacks);
    assert.is(s.element.querySelectorAll(".sphere-face").length, slices * stacks);

    s.setDimensions({ radius: 3 });

    assert.is(s.element.style.getPropertyValue("--radius"), "3");

    const after = [...s.faces];
    assert.is(after.length, slices * stacks);
    assert.is(s.element.querySelectorAll(".sphere-face").length, slices * stacks);

    assert.isTrue(after[0] !== before[0]);

    assert.isTrue(after[0].style.transform.includes("calc(3 * var(--display-unit))"));
});

suite.add("dimensions getter returns a copy (external mutation does not affect state)", assert => {
    const s = createSphere({ dimensions: { radius: 1 } });

    const d1 = s.getDimensions();
    d1.radius = 999;

    const d2 = s.getDimensions();
    assert.isTrue(approx(d2.radius, 1));
});

suite.run();