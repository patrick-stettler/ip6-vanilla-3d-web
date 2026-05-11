import {add, normalize, scale} from "../../utils/vector.js";
import {Observable} from "../../../kolibri-dist-0.9.10/kolibri/observable.js";
import {createObject3d} from "../object-3d/object-3d.js";
import {createTriangleFace} from "../triangle-face/triangle-face.js";

export {
    createIcoSphere
}

/**
 * Projects a point onto a sphere of radius r.
 * @param {Vec3} p
 * @param {Number} r
 * @returns {Vec3}
 */
const normalizeToRadius = (p, r) => scale(normalize(p), r);

const midpointKey = (a, b) => a < b ? `${a}|${b}` : `${b}|${a}`;

/**
 * Subdivides each triangle face into 4 smaller triangles.
 * Midpoints are projected onto the sphere immediately.
 *
 * @param {Vec3[]} verts
 * @param {Number[][]} faces  array of [a,b,c] indices
 * @param {Number} radius
 * @returns {Number[][]}
 */
const subdivide = (verts, faces, radius) => {
    const midCache = new Map();

    const getMid = (i1, i2) => {
        const key = midpointKey(i1, i2);
        const cached = midCache.get(key);
        if (cached != null) return cached;

        const m = scale(add(verts[i1], verts[i2]), 0.5);
        const mOnSphere = normalizeToRadius(m, radius);

        verts.push(mOnSphere);
        const idx = verts.length - 1;
        midCache.set(key, idx);
        return idx;
    };

    const newFaces = [];
    for (const [a, b, c] of faces) {
        const ab = getMid(a, b);
        const bc = getMid(b, c);
        const ca = getMid(c, a);

        newFaces.push([a, ab, ca]);
        newFaces.push([b, bc, ab]);
        newFaces.push([c, ca, bc]);
        newFaces.push([ab, bc, ca]);
    }

    return newFaces;
};

/**
 * Builds a unit icosahedron (then scaled to radius).
 * 12 vertices, 20 faces.
 *
 * @param {Number} radius
 * @returns {{ verts: Vec3[], faces: Number[][] }}
 */
const buildIcosahedron = (radius = 1) => {
    const t = (1 + Math.sqrt(5)) / 2;

    // Start with raw verts, then project to sphere radius
    let verts = [
        {x: -1, y: t, z: 0},
        {x: 1, y: t, z: 0},
        {x: -1, y: -t, z: 0},
        {x: 1, y: -t, z: 0},

        {x: 0, y: -1, z: t},
        {x: 0, y: 1, z: t},
        {x: 0, y: -1, z: -t},
        {x: 0, y: 1, z: -t},

        {x: t, y: 0, z: -1},
        {x: t, y: 0, z: 1},
        {x: -t, y: 0, z: -1},
        {x: -t, y: 0, z: 1},
    ];

    verts = verts.map(v => normalizeToRadius(v, radius));

    // Faces (indices)
    const faces = [
        [0, 11, 5],
        [0, 5, 1],
        [0, 1, 7],
        [0, 7, 10],
        [0, 10, 11],

        [1, 5, 9],
        [5, 11, 4],
        [11, 10, 2],
        [10, 7, 6],
        [7, 1, 8],

        [3, 9, 4],
        [3, 4, 2],
        [3, 2, 6],
        [3, 6, 8],
        [3, 8, 9],

        [4, 9, 5],
        [2, 4, 11],
        [6, 2, 10],
        [8, 6, 7],
        [9, 8, 1],
    ];

    return {verts, faces};
};

/** @typedef {Object3DType
 * & IDimensionable<SphereDimensions>
 * & {
 * type: 'ico-sphere',
 * faces: TriangleFaceType[]
 * }} IcoSphereType
 */


/**
 * @typedef { Object3DConfigType & {
 *   dimensions?: Partial<SphereDimensions>,
 *   subdivisions?: Number
 * }} IcoSphereConfigType
 */


/**
 * Creates an icosphere from triangle faces.
 *
 * Ikosaeder: 20 Faces
 * Subdivide 1x: 80 Faces
 * 2x: 320 Faces
 * 3x: 1280 Faces
 * 4x: 5120 Faces
 *
 * @param {IcoSphereConfigType} [config]
 * @returns IcoSphereType
 */
const createIcoSphere = (config = {}) => {
    const {subdivisions= 2} = config;

    /** @type {IObservable<SphereDimensions>} */
    const dimensionObs = Observable({
        radius: config.dimensions?.radius ?? 0.5,
    });

    const base = createObject3d(config);
    const {element} = base;
    element.classList.add('ico-sphere');

    /** @type {TriangleFaceType[]} */
    const faces = [];

    const clear = () => {
        for (const p of faces) base.removeObject(p);
        faces.length = 0;
    };

    const draw = radius => {
        clear();
        const {verts, faces: icoFaces} = buildIcosahedron(radius);


        let f = icoFaces;
        for (let i = 0; i < subdivisions; i++) {
            f = subdivide(verts, f, radius);
        }

        for (const [a, b, c] of f) {
            const face = createTriangleFace({p1: verts[a], p2: verts[b], p3: verts[c]});
            faces.push(face);
            base.addObject(face);
        }
    };

    dimensionObs.onChange(dim => draw(dim.radius));

    const sphere = Object.create(base);

    Object.defineProperties(sphere, {
        type: {
            value: "ico-sphere",
            writable: false,
            enumerable: true,
        },
    });

    sphere.faces = faces;
    sphere.getDimensions = () => ({...dimensionObs.getValue()});
    sphere.setDimensions = newDimensions =>
        dimensionObs.setValue({...dimensionObs.getValue(), ...newDimensions});
    sphere.onDimensionsChange = dimensionObs.onChange;

    return sphere;
};