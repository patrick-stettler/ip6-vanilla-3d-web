import {TestSuite} from "../../../kolibri-dist-0.9.10/kolibri/util/test.js";
import {approx} from "../../utils/approx.js";
import {createTetrahedron} from "./tetrahedron.js";
import {testObject3dContract} from "../object-3d/object-3d.test.js";

const suite = TestSuite("objects/tetrahedron");

testObject3dContract(suite, createTetrahedron);

suite.add("creates tetrahedron with correct type and defaults", assert => {
    const t = createTetrahedron();

    assert.is(t.type, "tetrahedron");

    const d = t.getDimensions();
    assert.isTrue(approx(d.a, 1));
});

suite.add("faces getter creates exactly 4 faces and caches them", assert => {
    const t = createTetrahedron({dimensions: {a: 2}});

    const f1 = t.faces;
    assert.isTrue(!!f1.s1);
    assert.isTrue(!!f1.s2);
    assert.isTrue(!!f1.s3);
    assert.isTrue(!!f1.bottom);

    const f2 = t.faces;
    assert.is(f2.s1, f1.s1);
    assert.is(f2.bottom, f1.bottom);
});

suite.add("faces are appended to tetrahedron element and have class", assert => {
    const t = createTetrahedron();

    const f = t.faces;
    const children = Array.from(t.element.children);

    ["s1","s2","s3","bottom"].forEach(k => {
        assert.isTrue(children.includes(f[k].element));
        assert.isTrue(f[k].element.classList.contains("tetra-face"));
        assert.isTrue(f[k].element instanceof HTMLElement);
    });
});

suite.add("setDimensions updates a and css var --a", assert => {
    const t = createTetrahedron({dimensions: {a: 1}});

    t.setDimensions({a: 3});

    assert.isTrue(approx(t.getDimensions().a, 3));
    assert.is(t.element.style.getPropertyValue("--a"), "3");
});

suite.add("setDimensions updates face sizes (width=a, depth scales with a)", assert => {
    const t = createTetrahedron({dimensions: {a: 1}});
    const f = t.faces;
    
    const w1 = f.s1.getDimensions().width;
    const d1 = f.s1.getDimensions().depth;

    t.setDimensions({a: 2});
    const w2 = f.s1.getDimensions().width;
    const d2 = f.s1.getDimensions().depth;
    
    assert.isTrue(approx(w1, 1));
    assert.isTrue(approx(w2, 2));
    
    assert.isTrue(Math.abs(d2 / d1 - 2) < 1e-6);
});

suite.add("setDimensions updates face positions (z scales with a)", assert => {
    const t = createTetrahedron({dimensions: {a: 1}});
    const f = t.faces;

    const z1 = f.s1.getPosition().z;

    t.setDimensions({a: 4});
    const z4 = f.s1.getPosition().z;

    assert.isTrue(Math.abs(z4 / z1 - 4) < 1e-6);
});

suite.run();