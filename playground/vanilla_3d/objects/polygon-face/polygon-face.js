import {loadCss} from "../../utils/load-css.js";
import {cross, sub, add, centroidN, normalize, dot} from "../../utils/vector.js";
import {axisFromMatCols} from "../../utils/transf-mat.js";
import {createObject3d} from "../object-3d/object-3d.js";

export { createPolygonFace };

/**
 * @typedef {{
 *   points: Vec3[],
 * }} PolygonFaceConfigType
 */

/**
 * @typedef {Object3DType & {
 *   setPoints: (pts:Vec3[]) => void,
 * }} PolygonFaceType
 */

/**
 * @param {PolygonFaceConfigType} config
 * @returns {PolygonFaceType}
 */
const createPolygonFace = (config) => {
    const pts = config.points ?? [];
    if (pts.length < 3) throw new Error("createPolygonFace needs at least 3 points");

    const center = centroidOfPoints(pts);

    const base = createObject3d({
        position: center,
        baseElement: document.createElementNS("http://www.w3.org/2000/svg", "svg"),
    });

    const {element} = base;
    element.classList.add("polygon-face__svg");
    element.setAttribute("viewBox", "0 0 100 100");
    element.setAttribute("preserveAspectRatio", "none");
    element.setAttribute("aria-hidden", "true");

    const poly = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
    poly.classList.add("polygon-face__poly");
    element.appendChild(poly);

    base._poly = poly;

    loadCss("./polygon-face.css", "polygon-face-css", import.meta.url);

    orientFace(base, pts);
    cutPolygon(base, pts);

    const api = Object.create(base);
    api.setPoints = (newPts) => {
        if (!newPts || newPts.length < 3) return;
        const c = centroidOfPoints(newPts);
        base.setPosition(c);
        orientFace(base, newPts);
        cutPolygon(base, newPts);
    };

    return api;
};

/**
 * @param {Object3DType} base
 * @param {Vec3[]} pts
 */
const orientFace = (base, pts) => {
    const p1 = pts[0];
    const p2 = pts[1];
    const p3 = pts[2];

    const center = base.getPosition();

    const u = sub(p2, p1);
    const v = sub(p3, p1);
    const n = cross(u, v);
    const nUnit = normalize(n);

    const target = add(center, nUnit);
    base.lookAt(target, { forwardAxis: "z" });
};

/**
 * @param {Object3DType} base
 * @param {Vec3[]} ptsWorld
 */
const cutPolygon = (base, ptsWorld) => {
    const {xAxis, yAxis, zAxis} = axisFromMatCols(base.getRotationMat());

    const toFace2D = (pWorld) => {
        const l = sub(pWorld, base.getPosition());
        return {
            x: dot(l, xAxis),
            y: dot(l, yAxis),
            z: dot(l, zAxis),
        };
    };

    const pts = ptsWorld.map(toFace2D);

    let maxX = 0;
    let maxY = 0;
    for (const p of pts) {
        maxX = Math.max(maxX, Math.abs(p.x));
        maxY = Math.max(maxY, Math.abs(p.y));
    }

    const w = maxX * 2;
    const h = maxY * 2;
    if (w < 1e-9 || h < 1e-9) return;

    base.element.style.width = `calc(${w} * var(--display-unit))`;
    base.element.style.height = `calc(${h} * var(--display-unit))`;

    const toSvgPoint = (p) => {
        const x01 = (p.x + maxX) / w;
        const y01 = (p.y + maxY) / h;
        return `${x01 * 100},${y01 * 100}`;
    };

    const svgPoints = pts.map(toSvgPoint).join(" ");

    const poly = base._poly;
    if (poly) poly.setAttribute("points", svgPoints);
};

/**
 * @param {Vec3[]} pts
 */
const centroidOfPoints = (pts) => {
    let x = 0, y = 0, z = 0;
    for (const p of pts) { x += p.x; y += p.y; z += p.z; }
    const n = pts.length || 1;
    return { x: x / n, y: y / n, z: z / n };
};
