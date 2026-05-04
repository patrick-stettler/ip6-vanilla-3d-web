import {TestSuite} from "../../../kolibri-dist-0.9.10/kolibri/util/test.js";
import {CUSTOM_INTERACTIVE_CLASSES, isInteractive} from "./is-interactive.js";

const suite = TestSuite("scene/is-interactive");

const withComputedStyle = (styleObj, fn) => {
    const orig = globalThis.getComputedStyle;
    globalThis.getComputedStyle = () => styleObj;
    try {
        fn();
    } finally {
        globalThis.getComputedStyle = orig;
    }
};

suite.add("returns false for non-Elements", assert => {
    assert.is(isInteractive(null), false);
    assert.is(isInteractive({}), false);
});

suite.add("custom interactive classes force true", assert => {
    const root = document.createElement("div");
    root.className = CUSTOM_INTERACTIVE_CLASSES.stopRotation;

    const child = document.createElement("span");
    root.appendChild(child);
    document.body.appendChild(root);

    withComputedStyle({pointerEvents: "auto", visibility: "visible", display: "block"}, () =>
        assert.isTrue(isInteractive(child))
    );

    root.remove();
});

suite.add("native button enabled is interactive; disabled is not", assert => {
    const btn = document.createElement("button");
    btn.textContent = "ok";
    document.body.appendChild(btn);

    withComputedStyle({pointerEvents: "auto", visibility: "visible", display: "block"}, () =>
        assert.isTrue(isInteractive(btn))
    );

    btn.setAttribute("disabled", "");
    withComputedStyle({pointerEvents: "auto", visibility: "visible", display: "block"}, () =>
        assert.is(isInteractive(btn), false)
    );

    btn.remove();
});

suite.add("a[href] is interactive; a without href is not", assert => {
    const a1 = document.createElement("a");
    a1.href = "https://example.ch";
    const a2 = document.createElement("a");

    document.body.appendChild(a1);
    document.body.appendChild(a2);

    withComputedStyle({pointerEvents: "auto", visibility: "visible", display: "block"}, () => {
        assert.isTrue(isInteractive(a1));
        assert.is(isInteractive(a2), false);
    });

    a1.remove();
    a2.remove();
});

suite.add("aria role interactive requires focusable (tabindex not -1)", assert => {
    const el = document.createElement("div");
    el.setAttribute("role", "button");
    document.body.appendChild(el);

    withComputedStyle({pointerEvents: "auto", visibility: "visible", display: "block"}, () =>
        assert.isTrue(isInteractive(el))
    );

    el.setAttribute("tabindex", "-1");
    withComputedStyle({pointerEvents: "auto", visibility: "visible", display: "block"}, () =>
        assert.is(isInteractive(el), false)
    );

    el.remove();
});

suite.add("aria-hidden subtree disables interactivity", assert => {
    const wrap = document.createElement("div");
    wrap.setAttribute("aria-hidden", "true");

    const btn = document.createElement("button");
    wrap.appendChild(btn);
    document.body.appendChild(wrap);

    withComputedStyle({pointerEvents: "auto", visibility: "visible", display: "block"}, () =>
        assert.is(isInteractive(btn), false)
    );

    wrap.remove();
});

suite.add("pointer-events none disables interactivity even for native elements", assert => {
    const btn = document.createElement("button");
    document.body.appendChild(btn);

    withComputedStyle({pointerEvents: "none", visibility: "visible", display: "block"}, () =>
        assert.is(isInteractive(btn), false)
    );

    btn.remove();
});

suite.add("linked image is interactive", assert => {
    const a = document.createElement("a");
    a.href = "https://example.ch";

    const img = document.createElement("img");
    a.appendChild(img);
    document.body.appendChild(a);

    withComputedStyle({pointerEvents: "auto", visibility: "visible", display: "block"}, () =>
        assert.isTrue(isInteractive(img))
    );

    a.remove();
});

suite.run();