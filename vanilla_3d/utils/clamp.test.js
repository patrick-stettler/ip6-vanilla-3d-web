import {clamp} from "./clamp.js";
import {TestSuite} from "../../kolibri-dist-0.9.10/kolibri/util/test.js";

const suite = TestSuite("utils/clamp");

suite.add("returns value when inside range", assert => {
    assert.is(clamp(5, 0, 10), 5);
    assert.is(clamp(0, 0, 10), 0);
    assert.is(clamp(10, 0, 10), 10);
});

suite.add("clamps to lower bound when value is too small", assert => {
    assert.is(clamp(-1, 0, 10), 0);
    assert.is(clamp(-100, 0, 10), 0);
});

suite.add("clamps to upper bound when value is too large", assert => {
    assert.is(clamp(11, 0, 10), 10);
    assert.is(clamp(100, 0, 10), 10);
});

suite.add("works with negative ranges", assert => {
    assert.is(clamp(-5, -10, -1), -5);
    assert.is(clamp(-20, -10, -1), -10);
    assert.is(clamp(0, -10, -1), -1);
});

suite.add("works with floating point numbers", assert => {
    assert.is(clamp(0.5, 0, 1), 0.5);
    assert.is(clamp(-0.1, 0, 1), 0);
    assert.is(clamp(1.1, 0, 1), 1);
});

suite.run();