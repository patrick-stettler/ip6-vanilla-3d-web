// noinspection JSCheckFunctionSignatures

import {TestSuite} from "../../kolibri-dist-0.9.10/kolibri/util/test.js";
import {applyPictureTexture} from "./texture.js";


const suite = TestSuite("utils/apply-picture-texture");

const mkEl = () => {
    const el = document.createElement("div");
    document.body.appendChild(el);
    return el;
};

suite.add("applies default texture (wood) to single HTMLElement", assert => {
    const el = mkEl();

    applyPictureTexture(el);

    assert.isTrue(el.classList.contains("texture"));
    assert.isTrue(el.classList.contains("wood"));
});

suite.add("applies given texture and removes other texture classes", assert => {
    const el = mkEl();
    el.classList.add("stone", "brick");

    applyPictureTexture(el, "sky");

    assert.isTrue(el.classList.contains("texture"));
    assert.isTrue(el.classList.contains("sky"));
    assert.isTrue(!el.classList.contains("stone"));
    assert.isTrue(!el.classList.contains("brick"));
});

suite.add("works with Base3DObject-like objects", assert => {
    const el = mkEl();
    const obj = { element: el };

    applyPictureTexture(obj, "bark");

    assert.isTrue(el.classList.contains("texture"));
    assert.isTrue(el.classList.contains("bark"));
});

suite.add("works with arrays and NodeLists", assert => {
    const el1 = mkEl();
    const el2 = mkEl();

    applyPictureTexture([el1, el2], "stone");

    assert.isTrue(el1.classList.contains("stone"));
    assert.isTrue(el2.classList.contains("stone"));
});

suite.add("works with nested structures", assert => {
    const el1 = mkEl();
    const el2 = mkEl();

    const nested = {
        a: el1,
        b: [{ element: el2 }]
    };

    applyPictureTexture(nested, "brick");

    assert.isTrue(el1.classList.contains("brick"));
    assert.isTrue(el2.classList.contains("brick"));
});

suite.add("ignores null and undefined values", assert => {
    const el = mkEl();

    applyPictureTexture([null, undefined, el], "wood");

    assert.isTrue(el.classList.contains("wood"));
});

suite.add("does nothing for unknown texture", assert => {
    const el = mkEl();

    applyPictureTexture(el, "unknown");

    assert.isTrue(!el.classList.contains("texture"));
});

suite.run();