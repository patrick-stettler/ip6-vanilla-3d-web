import {TestSuite} from "../../../kolibri-dist-0.9.10/kolibri/util/test.js";

import {vecApprox} from "../../utils/approx.js";
import {createObject3d} from "./object-3d.js";

const suite = TestSuite("objects/object-3d");

/**
 * Adds a set of shared Object3D tests to an existing test suite.
 *
 * These tests verify the common behavior expected from all 3D objects
 * that are based on the Object3D contract, such as position,
 * rotation, scaling and DOM integration.
 *
 * @param {TestSuiteType} suite
 *        The test suite to which the base object tests are added.
 *
 * @param {(config?: Object3DConfigType) => Object3DType} make
 *        Factory function used by the tests to create a new 3D object.
 *        The function must return an object that behaves like a Object3D.
 *        The optional config parameter allows the same tests to be reused
 *        for different object types and configurations.
 */
export const testObject3dContract = (suite, make) => {
    suite.add("creates element and default state", assert => {
        const o = make();

        assert.isTrue(o.element instanceof HTMLElement);

        const p = o.getPosition();
        assert.is(p.x, 0);
        assert.is(p.y, 0);
        assert.is(p.z, 0);

        const s = o.getScale();
        assert.is(s.x, 1);
        assert.is(s.y, 1);
        assert.is(s.z, 1);

        // check CSS vars exist
        assert.isTrue(o.element.style.getPropertyValue("--x").length > 0);
        assert.isTrue(o.element.style.getPropertyValue("--y").length > 0);
        assert.isTrue(o.element.style.getPropertyValue("--z").length > 0);

        assert.isTrue(o.element.style.getPropertyValue("--rot").length > 0);

        assert.isTrue(o.element.style.getPropertyValue("--sx").length > 0);
        assert.isTrue(o.element.style.getPropertyValue("--sy").length > 0);
        assert.isTrue(o.element.style.getPropertyValue("--sz").length > 0);
    });

    suite.add("setPosition updates state and CSS vars", assert => {
        const o = make();

        o.setPosition({x: 2, y: -3, z: 5});

        const p = o.getPosition();
        assert.is(p.x, 2);
        assert.is(p.y, -3);
        assert.is(p.z, 5);

        const sx = o.element.style.getPropertyValue("--x");
        const sy = o.element.style.getPropertyValue("--y");
        const sz = o.element.style.getPropertyValue("--z");

        assert.isTrue(sx.includes("2"));
        assert.isTrue(sy.includes("-3"));
        assert.isTrue(sz.includes("5"));
    });

    suite.add("setScale with 'Number' updates state and CSS vars", assert => {
        const o = make();

        o.setScale(2);

        const s = o.getScale();
        assert.is(s.x, 2);
        assert.is(s.y, 2);
        assert.is(s.z, 2);

        assert.is(o.element.style.getPropertyValue("--sx"), "2");
        assert.is(o.element.style.getPropertyValue("--sy"), "2");
        assert.is(o.element.style.getPropertyValue("--sz"), "2");
    });

    suite.add("setScale wit 'Vec3' updates state and CSS vars", assert => {
        const o = make();

        o.setScale({x: 2, y: 3, z: 4});

        const s = o.getScale();
        assert.is(s.x, 2);
        assert.is(s.y, 3);
        assert.is(s.z, 4);

        assert.is(o.element.style.getPropertyValue("--sx"), "2");
        assert.is(o.element.style.getPropertyValue("--sy"), "3");
        assert.is(o.element.style.getPropertyValue("--sz"), "4");
    });

    suite.add("translateBy uses rotationMat (local -> world)", assert => {
        const o = make({position: {x: 0, y: 0, z: 0}});

        o.setRotation({x: 0, y: 0, z: 90});
        o.translateBy({x: 1, y: 0, z: 0});

        assert.isTrue(
            vecApprox(o.getPosition(), {x: 0, y: 1, z: 0})
        );
    });

    suite.add("rotateBy vs rotateByWorld produce different results", assert => {
        const o1 = make();
        const o2 = make();

        // start with some initial rotation so order matters
        o1.setRotation({x: 0, y: 30, z: 0});
        o2.setRotation({x: 0, y: 30, z: 0});

        o1.rotateBy({x: 0, y: 0, z: 45});
        o2.rotateByWorld({x: 0, y: 0, z: 45});

        // The resulting Euler angles should differ (order of multiplication differs)
        const r1 = o1.getRotation();
        const r2 = o2.getRotation();

        assert.isTrue(!vecApprox(r1, r2));
    });

    suite.add("addObject appends child element", assert => {
        const parent = make();
        const child = make();

        parent.addObject(child);

        assert.isTrue(parent.element.children.length >= 1);
        assert.is(parent.element.lastElementChild, child.element);
    });
};

testObject3dContract(suite, createObject3d);

suite.run();
