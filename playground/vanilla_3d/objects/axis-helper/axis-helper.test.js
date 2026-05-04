import {testObject3dContract} from "../object-3d/object-3d.test.js";
import {TestSuite} from "../../../kolibri-dist-0.9.10/kolibri/util/test.js";
import {createObject3d} from "../object-3d/object-3d.js";
import {createAxisHelper} from "./axis-helper.js";

const suite = TestSuite("objects/axis-helper");

// axis-helper needs an owner, so we wrap it for the shared base tests
const make = config => createAxisHelper(createObject3d(), config);
testObject3dContract(suite, make);

suite.add("type is axisHelper and element has class axis-helper", assert => {
    const h = make();
    assert.is(h.type, "axisHelper");
    assert.isTrue(h.element.classList.contains("axis-helper"));
});

suite.add("showPlanes defaults to false (no helper-plane elements)", assert => {
    const h = make();
    const planes = h.element.querySelectorAll(".helper-plane");
    assert.is(planes.length, 0);
});

suite.add("showPlanes true adds exactly 3 helper-plane elements", assert => {
    const h = make({ showPlanes: true });
    const planes = h.element.querySelectorAll(".helper-plane");
    assert.is(planes.length, 3);

    // with planes enabled: 12 base children + 3 planes
    assert.is(h.element.children.length, 15);
});

suite.run();