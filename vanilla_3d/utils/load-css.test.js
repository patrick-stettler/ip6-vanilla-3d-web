import {TestSuite} from "../../kolibri-dist-0.9.10/kolibri/util/test.js";
import {loadCss} from "./load-css.js";

const suite = TestSuite("utils/load-css");

const countLinks = () =>
    document.querySelectorAll('link[rel="stylesheet"]').length;

suite.add("adds a stylesheet link when not present", assert => {
    const link = document.getElementById("plane-css");
    assert.isTrue(!!link);
    assert.is(link.rel, "stylesheet");
    assert.isTrue(link.href.endsWith("plane.css"));
});

suite.add("does not add stylesheet twice with same id", assert => {
    loadCss("./box.css", "box-css", import.meta.url);
    const before = countLinks();

    loadCss("./cylinder.css", "box-css", import.meta.url);
    const after = countLinks();

    assert.is(after, before);
});

suite.add("does not add stylesheet twice with same href but different id", assert => {
    loadCss("./handle-drag.css", "a-css", import.meta.url);
    const before = countLinks();

    loadCss("./handle-drag.css", "b-css", import.meta.url);
    const after = countLinks();

    assert.is(after, before);
});

suite.run();