// noinspection JSCheckFunctionSignatures

import {TestSuite} from "../../../kolibri-dist-0.9.10/kolibri/util/test.js";
import {CUSTOM_INTERACTIVE_CLASSES} from "./is-interactive.js";
import {bindControls} from "./bind-controls.js";

const suite = TestSuite("scene/bind-controls");

const mkScene = () => {
    const el = document.createElement("div");
    document.body.appendChild(el);

    return {
        element: el,
        getZoom: () => 1,
        rotateCalls: [],
        zoomCalls: [],
        panCalls: [],
        rotateByWorld(dr) { this.rotateCalls.push(dr); },
        setZoom(z, opt) { this.zoom = z; this.zoomCalls.push({z, opt}); },
        translateOriginBy(d) { this.panCalls.push(d); },
    };
};

const dispatchMouse = (el, type, props) => {
    const e = new MouseEvent(type, {bubbles: true, cancelable: true, ...props});
    el.dispatchEvent(e);
    return e;
};

const dispatchWheel = (el, props) => {
    const e = new WheelEvent("wheel", {bubbles: true, cancelable: true, ...props});
    el.dispatchEvent(e);
    return e;
};

suite.add("left-drag rotates scene via rotateByWorld", assert => {
    const scene = mkScene();
    const unbind = bindControls(scene);

    // start drag
    dispatchMouse(scene.element, "mousedown", {button: 0, clientX: 100, clientY: 100});
    dispatchMouse(scene.element, "mousemove", {clientX: 110, clientY: 120}); // dx=10, dy=20

    assert.is(scene.rotateCalls.length, 1);
    assert.is(scene.rotateCalls[0].x, -20);
    assert.is(scene.rotateCalls[0].z, -10);

    // stop drag
    dispatchMouse(scene.element, "mouseup", {});
    dispatchMouse(scene.element, "mousemove", {clientX: 200, clientY: 200});
    assert.is(scene.rotateCalls.length, 1); // no more

    unbind();
    scene.element.remove();
});

suite.add("mousedown on interactive element blocks rotation", assert => {
    const scene = mkScene();

    // make a child that is 'interactive'
    const child = document.createElement("div");
    child.classList.add(CUSTOM_INTERACTIVE_CLASSES.interactive);
    scene.element.appendChild(child);

    const unbind = bindControls(scene);

    dispatchMouse(child, "mousedown", {button: 0, clientX: 0, clientY: 0});
    dispatchMouse(scene.element, "mousemove", {clientX: 50, clientY: 50});

    assert.is(scene.rotateCalls.length, 0);

    unbind();
    scene.element.remove();
});

suite.add("wheel triggers cursor-anchored zoom", assert => {
    const scene = mkScene();
    const unbind = bindControls(scene, {zoomSpeed: 0.0015});

    dispatchWheel(scene.element, {deltaY: 100, clientX: 10, clientY: 20});

    assert.is(scene.zoomCalls.length, 1);
    const call = scene.zoomCalls[0];

    // anchor is forwarded
    assert.is(call.opt.anchor.x, 10);
    assert.is(call.opt.anchor.y, 20);

    // deltaY positive -> exp(-positive*speed) < 1, so zoom decreases
    assert.isTrue(call.z < 1);

    unbind();
    scene.element.remove();
});

suite.add("middle-mouse panning calls translateOriginBy with dx/dy and cleans up", assert => {
    const scene = mkScene();
    const unbind = bindControls(scene);

    // Spy window listeners by actually dispatching to window:
    dispatchMouse(scene.element, "mousedown", {button: 1, clientX: 100, clientY: 100});
    // window mousemove should be active now
    window.dispatchEvent(new MouseEvent("mousemove", {clientX: 110, clientY: 90}));
    window.dispatchEvent(new MouseEvent("mousemove", {clientX: 130, clientY: 95}));

    assert.isTrue(scene.element.classList.contains("is-panning"));
    assert.is(scene.panCalls.length, 2);
    assert.is(scene.panCalls[0].x, 10);
    assert.is(scene.panCalls[0].y, -10);

    // mouseup ends panning
    window.dispatchEvent(new MouseEvent("mouseup", {}));
    assert.isTrue(!scene.element.classList.contains("is-panning"));

    // after mouseup, further moves should not pan
    window.dispatchEvent(new MouseEvent("mousemove", {clientX: 200, clientY: 200}));
    assert.is(scene.panCalls.length, 2);

    unbind();
    scene.element.remove();
});

suite.add("unbind removes listeners (no calls after cleanup)", assert => {
    const scene = mkScene();
    const unbind = bindControls(scene);
    unbind();

    dispatchMouse(scene.element, "mousedown", {button: 0, clientX: 0, clientY: 0});
    dispatchMouse(scene.element, "mousemove", {clientX: 10, clientY: 10});
    dispatchWheel(scene.element, {deltaY: 100, clientX: 0, clientY: 0});

    assert.is(scene.rotateCalls.length, 0);
    assert.is(scene.zoomCalls.length, 0);

    scene.element.remove();
});

suite.run();