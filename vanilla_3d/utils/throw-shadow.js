import {add, dot, mul, sub} from "./vector.js";
import {loadCss} from "./load-css.js";
import {createPolygonFace} from "../objects/polygon-face/polygon-face.js";
import {axisFromMatCols, normalFromObject} from "./transf-mat.js";

export {
    throwShadow
}

/**
 * @typedef { Object3DType
 *  & IThrowShadow
 *  & Partial<IDimensionable>
 * } ShadowObjectType
 */


const projectPointToPlaneFromLight = (P, L, E0, N) => {
    const dir = sub(P, L);
    const denom = dot(N, dir);

    if (Math.abs(denom) < 1e-8) return null;

    const t = dot(N, sub(E0, L)) / denom;
    if (t <= 0) return null;

    return add(L, mul(dir, t));
};

/**
 * @param {Vec3} a
 * @param {Vec3} b
 * @param {Vec3} c
 * @returns {Number}
 */
const cross2XY = (a, b, c) => {
    const abx = b.x - a.x;
    const aby = b.y - a.y;
    const acx = c.x - a.x;
    const acy = c.y - a.y;
    return abx * acy - aby * acx;
};

/**
 * @param {Vec3[]} pts
 * @returns {Vec3[]}
 */
const convexHullXY = (pts) => {
    const points = pts
        .slice()
        .sort((p, q) => (p.x === q.x ? p.y - q.y : p.x - q.x));

    if (points.length <= 1) return points;

    const lower = [];
    for (const p of points) {
        while (lower.length >= 2 && cross2XY(lower[lower.length - 2], lower[lower.length - 1], p) <= 0) {
            lower.pop();
        }
        lower.push(p);
    }

    const upper = [];
    for (let i = points.length - 1; i >= 0; i--) {
        const p = points[i];
        while (upper.length >= 2 && cross2XY(upper[upper.length - 2], upper[upper.length - 1], p) <= 0) {
            upper.pop();
        }
        upper.push(p);
    }

    upper.pop();
    lower.pop();
    return lower.concat(upper);
};

/**
 * @param {Vec3} pLocal
 * @param {ShadowObjectType} object
 * @returns {Vec3}
 */
const transformPoint = (pLocal, object) => {
    const pos = object.getPosition();
    const {xAxis, yAxis, zAxis} = axisFromMatCols(object.getRotationMat());

    // optional, nur falls du scale hast
    const s = object.getScale ? object.getScale() : {x: 1, y: 1, z: 1};

    const px = pLocal.x * s.x;
    const py = pLocal.y * s.y;
    const pz = pLocal.z * s.z;

    return add(
        pos,
        add(
            add(mul(xAxis, px), mul(yAxis, py)),
            mul(zAxis, pz)
        )
    );
};

/**
 * @param {ShadowObjectType} object
 * @param {Vec3} lightPos
 * @param {PlaneType} plane
 */
const shadow = (object, lightPos, plane) => {
    const E0 = plane.getPosition();
    const N = normalFromObject(plane);

    const L = lightPos;

    const cornersLocal = object.getShadowCorners();
    const cornersWorld = cornersLocal.map(p => transformPoint(p, object));

    const projected = cornersWorld
        .map(P => projectPointToPlaneFromLight(P, L, E0, N))
        .filter(Boolean);

    if (projected.length < 3) return null;

    const hull = convexHullXY(projected);

    return hull;
};


/**
 * @param {Scene3DType} scene
 * @param {ShadowObjectType} object
 * @param {Vec3} lightPos
 * @param {PlaneType} plane
 * @returns {{ dispose: () => void }}
 */
const throwShadow = (scene, object, lightPos, plane) => {
    loadCss("./throw-shadow.css", "shadow-css", import.meta.url);

    /** @type {PolygonFaceType | null} */
    let shadowObj = null;

    const ensureShadow = (hull) => {
        if (!hull || hull.length < 3) {
            if (shadowObj) {
                shadowObj.element.remove();
                shadowObj = null;
            }
            return;
        }

        if (!shadowObj) {
            shadowObj = createPolygonFace({points: hull});
            shadowObj.element.classList.add("shadow");
            scene.addObject(shadowObj);
        } else {
            shadowObj.setPoints(hull);
        }
    };

    const rebuild = () => {
        const hull = shadow(object, lightPos, plane);
        ensureShadow(hull);
    };

    rebuild();

    const unsubs = [];

    if (object.onDimensionsChange) unsubs.push(object.onDimensionsChange(rebuild));
    if (object.onPositionChange) unsubs.push(object.onPositionChange(rebuild));
    if (object.onRotationChange) unsubs.push(object.onRotationChange(rebuild));
    if (object.onScaleChange) unsubs.push(object.onScaleChange(rebuild));

    return {
        dispose: () => {
            for (const u of unsubs) {
                if (typeof u === "function") u();
            }
            if (shadowObj) shadowObj.element.remove();
            shadowObj = null;
        }
    };
};
