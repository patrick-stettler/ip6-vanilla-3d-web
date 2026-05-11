import {isInteractive} from "./is-interactive.js";

export {
    bindControls
}

/**
 * @param { Scene3DType } scene
 * @param { IControlsOptions } [config]
 * @returns {() => void} unbind
 */
const bindControls = (scene, config = {}) => {
    const el = scene.element;

    const {
        zoomSpeed = 0.0015
    } = config;

    const listeners = [];

    /**
     * @param { keyof HTMLElementEventMap } t
     * @param { (this:HTMLElement, ev: HTMLElementEventMap[keyof HTMLElementEventMap]) => any } fn
     * @param { boolean | AddEventListenerOptions } [opt]
     */
    const on = (t, fn, opt) => {
        el.addEventListener(t, fn, opt);
        listeners.push([t, fn, opt]);
    };

    // Rotate (Drag / 1-Finger)
    let dragging = false, lastX = 0, lastY = 0;
    const getXY = e => e.type.startsWith("touch")
        ? {x: e.targetTouches[0]?.clientX ?? 0, y: e.targetTouches[0]?.clientY ?? 0}
        : {x: e.clientX, y: e.clientY};

    const move = e => {
        if (!dragging) return;
        const {x, y} = getXY(e);
        const dx = x - lastX, dy = y - lastY;
        lastX = x;
        lastY = y;
        scene.rotateByWorld({x: -dy, z: -dx});
    };


    on('mousedown', e => {
        const target = e.composedPath?.()[0] ?? e.target;
        if (isInteractive(target)) return;

        if (e.button !== 0) return;
        e.preventDefault();
        dragging = true;
        lastX = e.clientX;
        lastY = e.clientY;
    });
    on('mousemove', move);
    on('mouseup', () => {
        dragging = false;
    });

    on('touchstart', e => {
        if (e.touches.length === 1) {
            dragging = true;
            lastX = e.touches[0].clientX;
            lastY = e.touches[0].clientY;
        }
    }, {passive: false});
    on('touchmove', e => {
        if (e.touches.length === 1) {
            e.preventDefault();
            move(e);
        }
    }, {passive: false});
    on('touchend', () => {
        dragging = false;
    });

    // Wheel zoom (cursor-anchored)
    on('wheel', e => {
        e.preventDefault();
        const nextScale = scene.getZoom() * Math.exp(-e.deltaY * zoomSpeed);
        scene.setZoom(nextScale, {anchor: {x: e.clientX, y: e.clientY}});
    }, {passive: false});

    // Pinch zoom
    let pinching = false, lastDist = 0;
    const dist = (a, b) => Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
    const center = (a, b) => ({x: (a.clientX + b.clientX) / 2, y: (a.clientY + b.clientY) / 2});

    on('touchstart', e => {
        if (e.touches.length === 2) {
            pinching = true;
            lastDist = dist(e.touches[0], e.touches[1]);
        }
    }, {passive: false});

    on('touchmove', e => {
        if (pinching && e.touches.length === 2) {
            e.preventDefault();
            const d = dist(e.touches[0], e.touches[1]);
            if (lastDist > 0) {
                const factor = d / lastDist;
                const c = center(e.touches[0], e.touches[1]);
                scene.setZoom(scene.getZoom() * factor, {anchor: c});
            }
            lastDist = d;
        }
    }, {passive: false});

    on('touchend', () => {
        pinching = false;
        lastDist = 0;
    });

    const mmDown = e => {
        if (e.button !== 1) return;
        e.preventDefault();
        let px = e.clientX, py = e.clientY;
        const mmMove = ev => {
            el.classList.add('is-panning');
            const dx = ev.clientX - px, dy = ev.clientY - py;
            px = ev.clientX;
            py = ev.clientY;
            scene.translateOriginBy({x: dx, y: dy});
        };
        const mmUp = () => {
            el.classList.remove('is-panning');
            window.removeEventListener("mousemove", mmMove);
            window.removeEventListener("mouseup", mmUp);
        };
        window.addEventListener("mousemove", mmMove);
        window.addEventListener("mouseup", mmUp);
    };
    el.addEventListener("mousedown", mmDown);
    listeners.push(["mousedown", mmDown, undefined]);

    // cleanup
    return () => {
        for (const [t, fn, opt] of listeners) el.removeEventListener(t, fn, opt);
    };
};
