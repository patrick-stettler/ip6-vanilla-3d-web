import {loadCss} from "./load-css.js";
import {CUSTOM_INTERACTIVE_CLASSES} from "../scene/functions/is-interactive.js";
import {cross, dot, mul, normalize, sub} from "./vector.js";
import {applyDirection} from "./transf-mat.js";
import {mat4Invert} from "./mat4.js";
import {createBox} from "../objects/box/box.js";
import {createPlane} from "../objects/plane/plane.js";

export {
    projectWorldToScreen,
    createPlaneDeltaMapper,
    buildPlaneRotation,
    handleDrag,
    handleRoll
}

loadCss('./handle-drag.css', 'drag-css', import.meta.url);

const getCoords = () => {
    const coords = document.querySelector('.coords');
    if (!coords) throw new Error('projectWorldToScreen: .coords not found');
    return coords;
};

const getOrCreateProbe = coords => {
    // If it already exists anywhere, reuse it
    let probe = document.getElementById('probe-point');

    // If it exists but is attached to a different coords, move it
    if (probe && probe.parentElement !== coords) {
        coords.appendChild(probe);
        return probe;
    }

    // Create once
    if (!probe) {
        probe = document.createElement('div');
        probe.id = 'probe-point';
        coords.appendChild(probe);
    }

    return probe;
};


/**
 * Project a world point into screen space using the DOM and CSS transforms.
 * The point is written into CSS custom properties on the probe element,
 * then we measure the resulting 2D position via getBoundingClientRect.
 *
 * @param {Vec3} p World position to project.
 * @returns {Vec2} Screen coordinates in pixels.
 */
const projectWorldToScreen = p => {
    const coords = getCoords();
    const probe = getOrCreateProbe(coords);

    probe.style.setProperty("--probe-x", String(p.x ?? 0));
    probe.style.setProperty("--probe-y", String(p.y ?? 0));
    probe.style.setProperty("--probe-z", String(p.z ?? 0));

    const rect = probe.getBoundingClientRect();
    return {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
    };
};

/**
 * Project a LOCAL point (in the container's coordinate space) to screen space.
 * This relies on CSS transforms, we just measure the resulting DOM position.
 *
 * @param {HTMLElement} container element that defines the local coordinate space
 * @param {Vec3} pLocal local coordinates
 * @returns {Vec2} screen coordinates in pixels
 */
const projectLocalToScreen = (container, pLocal) => {
    const probe = getOrCreateProbe(container);

    probe.style.setProperty('--probe-x', String(pLocal.x ?? 0));
    probe.style.setProperty('--probe-y', String(pLocal.y ?? 0));
    probe.style.setProperty('--probe-z', String(pLocal.z ?? 0));

    const r = probe.getBoundingClientRect();
    return {
        x: r.left + r.width / 2,
        y: r.top + r.height / 2
    };
};


/**
 * Creates a function that maps 2D screen-space mouse movement (dx, dy)
 * into a corresponding 3D displacement on a plane spanned by the vectors u and v.
 *
 * It does this by:
 * 1. Projecting origin, u, and v into screen space.
 * 2. Forming a 2x2 matrix that describes how u and v appear on-screen.
 * 3. Inverting that matrix to convert screen deltas back into coefficients (a, b).
 * 4. Constructing the world movement: a*u + b*v.
 *
 * @param {Vec3} u  First direction vector defining the plane.
 * @param {Vec3} v  Second direction vector defining the plane.
 * @returns {(dxScreen:Number, dyScreen:Number) => Vec3}
 *          A function that converts a screen delta into a 3D delta.
 */
const createPlaneDeltaMapper = (u, v) => {
    const p0 = projectWorldToScreen({x: 0, y: 0, z: 0});
    const pU = projectWorldToScreen(u);
    const pV = projectWorldToScreen(v);

    const ex = {x: pU.x - p0.x, y: pU.y - p0.y};
    const ey = {x: pV.x - p0.x, y: pV.y - p0.y};

    const det = ex.x * ey.y - ex.y * ey.x;
    if (Math.abs(det) < 1e-6) {
        return () => ({x: 0, y: 0, z: 0});
    }

    const invDet = 1 / det;

    return (dxScreen, dyScreen) => {
        const a = (ey.y * dxScreen - ey.x * dyScreen) * invDet;
        const b = (-ex.y * dxScreen + ex.x * dyScreen) * invDet;

        return {
            x: u.x * a + v.x * b,
            y: u.y * a + v.y * b,
            z: u.z * a + v.z * b,
        };
    };
};

/**
 * Builds a rotation matrix for a plane primitive that lies in local XY,
 * with local +Z being the plane normal.
 *
 * Row-major, basis vectors stored as rows (matches your applyDirection setup).
 *
 * @param {Vec3} u World-space direction spanning the plane (local +X).
 * @param {Vec3} v World-space direction spanning the plane (local +Y, after orthogonalization).
 * @returns {Mat4} 4x4 rotation matrix
 */
const buildPlaneRotation = (u, v) => {
    const xAxis = normalize(u);

    // Gram-Schmidt: remove the component of v along xAxis, then normalize
    const vProj = mul(xAxis, dot(v, xAxis));
    const yAxis = normalize(sub(v, vProj));

    // Right-handed normal: zAxis = xAxis × yAxis
    const zAxis = normalize(cross(xAxis, yAxis));

    return [
        xAxis.x, xAxis.y, xAxis.z, 0,
        yAxis.x, yAxis.y, yAxis.z, 0,
        zAxis.x, zAxis.y, zAxis.z, 0,
        0, 0, 0, 1
    ];
};

/**
 * Attach a drag handler to a 3D axis or plane handle.
 *
 * This helper converts pointer movement in screen space (pixels)
 * into a world space delta constrained to a plane defined by the
 * direction vectors `u` and `v`.
 *
 * Conceptually, the drag interaction is split into two concerns:
 * - Mathematical mapping of pointer movement onto a world-space plane
 * - Optional visual feedback using helper geometries
 *
 * Typical usage:
 * - `u` and `v` define the drag plane in world space
 * - screen deltas are mapped into that plane via a plane delta mapper
 * - the resulting world-space delta is passed to a move strategy
 *
 * Visual helpers, if enabled, are attached to the handle and aligned
 * using local-space versions of `u` and `v` to ensure
 * correct orientation even when the handle itself is rotated.
 *
 * @param {Object3DType} handle
 * The 3D object acting as the interactive handle.
 * Its `element` property is used to receive pointer events,
 * while the object itself represents the handle in 3D space.
 *
 * @param {Vec3} u
 * First direction vector spanning the drag plane in world space.
 * Typically corresponds to a primary axis or constraint direction.
 *
 * @param {Vec3} v
 * Second direction vector spanning the drag plane in world space.
 * Together with `u`, this defines the drag plane orientation.
 *
 * @param {(dWorld: Vec3) => void} moveStrategy
 * Callback that receives the computed world-space delta and applies it,
 * for example by translating or rotating a target object.
 *
 * @param {IHandleDragOptions} [config]
 * Optional configuration controlling visual helpers and lifecycle hooks.
 *
 */
const handleDrag = (handle, u, v, moveStrategy, config = {}) => {

    const {
        showAxisDragHelper,
        showPlaneDragHelper,
        planeDragHelperSize,
        onDragStart,
        onDragEnd
    } = config;

    // Last pointer position in screen space (pixels)
    let lastX2 = 0;
    let lastY2 = 0;

    // CSS class used to temporarily disable scene rotation
    // while interacting with this handle
    const cls = CUSTOM_INTERACTIVE_CLASSES.stopRotation;

    // DOM element of the 3D handle
    const el = handle.element;

    el.style.cursor = 'grab';

    const box = createBox({
        dimensions: {width: 0.01, depth: 0.01, height: 100}
    });
    box.element.id = 'helper-box';

    const plane = createPlane({
        dimensions: {width: 5, depth: 5, ...planeDragHelperSize}
    });
    plane.element.id = 'helper-plane';

    const invHandleRot = mat4Invert(handle.getRotationMat());

    const uLocal = applyDirection(invHandleRot, u);
    const vLocal = applyDirection(invHandleRot, v);

    plane.setRotationMat(buildPlaneRotation(uLocal, vLocal));

    el.addEventListener('pointerdown', e => {
        e.preventDefault();

        // Prevent scene rotation or other interactions
        el.classList.add(cls);

        el.setPointerCapture(e.pointerId);
        el.style.cursor = 'grabbing';

        // Add a helper to visualize the drag
        if (showAxisDragHelper) {
            handle.addObject(box);
        }

        if (showPlaneDragHelper) {
            handle.addObject(plane);
        }

        onDragStart?.(e);

        // Initialize last pointer position
        lastX2 = e.clientX;
        lastY2 = e.clientY;

        /**
         * Pointer move handler.
         * Computes the screen space delta and maps it to a world space
         * delta using a plane delta mapper derived from u and v.
         */
        const move = ev => {
            // Screen space delta in pixels
            const dxScreen = ev.clientX - lastX2;
            const dyScreen = ev.clientY - lastY2;

            // Update last pointer position
            lastX2 = ev.clientX;
            lastY2 = ev.clientY;

            // Convert screen delta into world space delta
            const dWorld = createPlaneDeltaMapper(u, v)(dxScreen, dyScreen);

            // Apply the movement strategy
            moveStrategy(dWorld);
        };

        /**
         * Pointer up handler.
         * Cleans up listeners and restores normal scene interaction.
         */
        const up = () => {
            window.removeEventListener('pointermove', move);
            window.removeEventListener('pointerup', up);

            el.classList.remove(cls);
            el.releasePointerCapture(e.pointerId);
            el.style.cursor = 'grab';

            if (showAxisDragHelper) handle.removeObject(box);
            if (showPlaneDragHelper) handle.removeObject(plane);

            onDragEnd?.(e);
        };

        // Listen globally so dragging continues
        // even if the pointer leaves the handle element
        window.addEventListener('pointermove', move);
        window.addEventListener('pointerup', up);
    });
};

/**
 * Attach a roll handler that produces a signed angle delta (degrees).
 *
 * The trick is:
 * - use the handle element as the projection container
 * - derive two screen basis vectors from u and v by projecting small steps
 * - map pointer position into that basis and compute atan2
 *
 * @param {Object3DType} handle 3D object that receives pointer events
 * @param {Vec3} u local plane axis 1 (unit-ish)
 * @param {Vec3} v local plane axis 2 (unit-ish)
 * @param {(deltaAngleDeg: Number) => void} onRotate callback with incremental angle
 */
const handleRoll = (handle, u, v, onRotate) => {
    const cls = CUSTOM_INTERACTIVE_CLASSES.stopRotation;
    const el = handle.element;
    el.classList.add('rotate-cursor');

    // How far to step along u/v to build a stable screen basis
    const STEP = 0.1;

    /**
     * Solve 2x2 system:
     * [ ex.x ey.x ] [ a ] = [ px ]
     * [ ex.y ey.y ] [ b ]   [ py ]
     *
     * @param {Vec2} ex
     * @param {Vec2} ey
     * @param {Vec2} p
     * @returns {{a: Number, b: Number} | null}
     */
    const solveBasis = (ex, ey, p) => {
        const det = ex.x * ey.y - ex.y * ey.x;
        if (Math.abs(det) < 1e-8) return null;
        const invDet = 1 / det;
        const a = (ey.y * p.x - ey.x * p.y) * invDet;
        const b = (-ex.y * p.x + ex.x * p.y) * invDet;
        return {a, b};
    };

    el.addEventListener('pointerdown', e => {
        e.preventDefault();
        el.classList.add(cls);
        el.setPointerCapture(e.pointerId);

        // Use the handle element as the local coordinate space for projection
        // This makes it automatically respect parent transforms and scene rotation.
        const container = el;

        // Screen center of the rotation, use the element center
        const r0 = el.getBoundingClientRect();
        const c = {x: r0.left + r0.width / 2, y: r0.top + r0.height / 2};

        // Build screen basis vectors by projecting local steps along u and v
        const pU = projectLocalToScreen(container, {x: u.x * STEP, y: u.y * STEP, z: u.z * STEP});
        const pV = projectLocalToScreen(container, {x: v.x * STEP, y: v.y * STEP, z: v.z * STEP});

        const ex = {x: pU.x - c.x, y: pU.y - c.y};
        const ey = {x: pV.x - c.x, y: pV.y - c.y};

        // Initialize last angle from initial pointer position
        const init = solveBasis(ex, ey, {x: e.clientX - c.x, y: e.clientY - c.y});
        let lastAngle = init ? Math.atan2(init.b, init.a) : 0;

        const onMove = ev => {
            // Pointer vector around the center in screen space
            const p = {x: ev.clientX - c.x, y: ev.clientY - c.y};

            // Map to plane coordinates (a,b)
            const ab = solveBasis(ex, ey, p);
            if (!ab) return;

            const angle = Math.atan2(ab.b, ab.a);
            let delta = angle - lastAngle;

            // Normalize into [-pi, pi]
            if (delta > Math.PI) delta -= 2 * Math.PI;
            if (delta < -Math.PI) delta += 2 * Math.PI;

            lastAngle = angle;
            onRotate(delta * 180 / Math.PI);
        };

        const onUp = () => {
            window.removeEventListener('pointermove', onMove);
            window.removeEventListener('pointerup', onUp);

            el.classList.remove(cls);
            el.releasePointerCapture(e.pointerId);
        };

        window.addEventListener('pointermove', onMove);
        window.addEventListener('pointerup', onUp);
    });
};
