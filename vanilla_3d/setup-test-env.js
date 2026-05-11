// noinspection NpmUsedModulesInstalled

export const setupTestEnv = async () => {
    const isBrowser = typeof window !== "undefined" && typeof document !== "undefined";

    if (isBrowser) {
        ensureOutElement();
        return;
    }

    const {JSDOM} = await import("jsdom");

    const dom = new JSDOM(`<!doctype html><html><head></head><body></body></html>`, {
        url: "http://localhost",
    });

    globalThis.window = dom.window;
    globalThis.document = dom.window.document;

    globalThis.HTMLElement = dom.window.HTMLElement;
    globalThis.Element = dom.window.Element;
    globalThis.NodeList = dom.window.NodeList;
    globalThis.HTMLCollection = dom.window.HTMLCollection;

    globalThis.MouseEvent = dom.window.MouseEvent;
    globalThis.WheelEvent = dom.window.WheelEvent;

    globalThis.getComputedStyle = dom.window.getComputedStyle;

    ensureOutElement();
};

const ensureOutElement = () => {
    if (!document.getElementById("out")) {
        const out = document.createElement("div");
        out.id = "out";
        document.body.appendChild(out);
    }
};
