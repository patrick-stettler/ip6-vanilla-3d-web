import { TestSuite } from "../../../kolibri-dist-0.9.10/kolibri/util/test.js";
import { testObject3dContract } from "../object-3d/object-3d.test.js";
import {createPlane} from "./plane.js";

const suite = TestSuite("objects/plane");

testObject3dContract(suite, createPlane);

suite.add("type is plane", assert => {
    const p = createPlane();
    assert.is(p.type, "plane");
});

suite.add("element has class plane", assert => {
    const p = createPlane();
    assert.isTrue(p.element.classList.contains("plane"));
});

suite.add("dimensions defaults to 1 (width/depth) and css vars set", assert => {
    const p = createPlane();

    const d = p.getDimensions();
    assert.is(d.width, 1);
    assert.is(d.depth, 1);

    assert.is(p.element.style.getPropertyValue("--width"), "1");
    assert.is(p.element.style.getPropertyValue("--depth"), "1");
});

suite.add("config.dimensions overrides defaults", assert => {
    const p = createPlane({ dimensions: { width: 2, depth: 3 } });

    const d = p.getDimensions();
    assert.is(d.width, 2);
    assert.is(d.depth, 3);

    assert.is(p.element.style.getPropertyValue("--width"), "2");
    assert.is(p.element.style.getPropertyValue("--depth"), "3");
});

suite.add("setDimensions updates state and css vars", assert => {
    const p = createPlane();

    p.setDimensions({ width: 5, depth: 6 });

    const d = p.getDimensions();
    assert.is(d.width, 5);
    assert.is(d.depth, 6);

    assert.is(p.element.style.getPropertyValue("--width"), "5");
    assert.is(p.element.style.getPropertyValue("--depth"), "6");
});

suite.add("setDimensions merges partial update (keeps other dimension)", assert => {
    const p = createPlane({ dimensions: { width: 2, depth: 3 } });

    p.setDimensions({ width: 10 });

    const d = p.getDimensions();
    assert.is(d.width, 10);
    assert.is(d.depth, 3);

    assert.is(p.element.style.getPropertyValue("--width"), "10");
    assert.is(p.element.style.getPropertyValue("--depth"), "3");
});

suite.add("dimensions getter returns a copy (mutation does not affect internal state)", assert => {
    const p = createPlane({ dimensions: { width: 2, depth: 3 } });

    const d1 = p.getDimensions();
    d1.width = 999;
    d1.depth = 999;

    const d2 = p.getDimensions();
    assert.is(d2.width, 2);
    assert.is(d2.depth, 3);
});

suite.run();