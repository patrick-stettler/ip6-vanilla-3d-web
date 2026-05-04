import {loadCss} from "../../utils/load-css.js";
import {cross, sub, add, centroid3, normalize, dot} from "../../utils/vector.js";
import {axisFromMatCols} from "../../utils/transf-mat.js";
import {createObject3d} from "../object-3d/object-3d.js";

export {
    createTriangleFace
}

/**
 * A single triangular face rendered as an Object3D.
 * The face is oriented using its geometric normal and
 * visually clipped to the triangle shape via CSS.
 *
 * @typedef {Object3DType
 * & {
 * }} TriangleFaceType
 */

/**
 * Configuration object describing a triangle in world space.
 *
 * @typedef {{
 *   p1: Vec3,
 *   p2: Vec3,
 *   p3: Vec3,
 * }} TriangleFaceConfigType
 */

/**
 * Creates a visual triangle face from three 3D points.
 *
 * The triangle is:
 * - centered at its centroid
 * - oriented using its face normal
 * - clipped to its triangular shape in local space
 *
 * @param {TriangleFaceConfigType} points  World-space triangle vertices
 * @returns {TriangleFaceType}             Renderable triangle face object
 */
const createTriangleFace = points => {

    const {p1, p2, p3} = points;

    const center = centroid3(p1, p2, p3);

    const base = createObject3d({
        position: center,
        baseElement: document.createElementNS("http://www.w3.org/2000/svg", "svg")
    });
    const {element} = base;

    element.classList.add('triangle-face__svg');
    element.setAttribute("viewBox", "0 0 100 100");
    element.setAttribute("preserveAspectRatio", "none");
    element.setAttribute("aria-hidden", "true");

    const p = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
    p.classList.add('triangle-face__poly');
    element.appendChild(p);

    base._poly = p;

    loadCss("./triangle-face.css", "triangle-face-css", import.meta.url);

    const u = sub(p2, p1);
    const v = sub(p3, p1);

    const n = cross(u, v);

    const nUnit = normalize(n);
    const target = add(center, nUnit);

    base.lookAt(target, {
        forwardAxis: 'z'
    });

    cutTriangle(base, points);


    return Object.create(base);
};


/**
 * Computes a 2D projection of the triangle in the local face plane
 * and applies a CSS clip-path that matches the triangle shape.
 *
 * @param {Object3DType} base               Oriented triangle object
 * @param {TriangleFaceConfigType} points   Triangle vertices in world space
 */
const cutTriangle = (base, points) => {

    const {xAxis, yAxis, zAxis} = axisFromMatCols(base.getRotationMat());

    const toFace2D = pWorld => {
        const l = sub(pWorld, base.getPosition());
        return {
            x: dot(l, xAxis),
            y: dot(l, yAxis),
            z: dot(l, zAxis),
        };
    };

    const pts = Object.values(points).map(toFace2D);

    let maxX = 0;
    let maxY = 0;

    pts.forEach(p => {
        maxX = Math.max(maxX, Math.abs(p.x));
        maxY = Math.max(maxY, Math.abs(p.y));
    });

    const w = maxX * 2;
    const h = maxY * 2;

    if (w < 1e-9 || h < 1e-9) return;

    base.element.style.width = `calc(${w} * var(--display-unit))`;
    base.element.style.height = `calc(${h} * var(--display-unit))`;


    const toSvgPoint = p => {
        const x01 = (p.x + maxX) / w;
        const y01 = (p.y + maxY) / h;

        const x = x01 * 100;
        const y = y01 * 100;

        return `${x},${y}`;
    };

    const svgPoints = pts.map(toSvgPoint).join(" ");

    const poly = base._poly;
    if (poly) poly.setAttribute("points", svgPoints);
};