import {loadCss} from "../../utils/load-css.js";
import {Observable} from "../../../kolibri-dist-0.9.10/kolibri/observable.js";
import {createObject3d} from "../object-3d/object-3d.js";
import {createPlane} from "../plane/plane.js";

export {
    createTetrahedron
}

/** @typedef {'s1'|'s2'|'s3'|'bottom'} TetraFaceKey */


/** @typedef {Object3DType
 * & IDimensionable<TetraDimensions>
 * & {
 *   type: 'tetrahedron',
 *   faces: Record<TetraFaceKey, PlaneType>,
 * }} TetraType
 */


/** @typedef { Object3DConfigType & {
 *   dimensions?: Partial<TetraDimensions>
 * }} TetraConfigType
 */


/**
 * @param {TetraConfigType} [config]
 * @returns {TetraType}
 */
const createTetrahedron = (config = {}) => {

    /** @type {IObservable<TetraDimensions>} */
    const dimensionObs = Observable({
        a: config.dimensions?.a ?? 1
    });

    const base = createObject3d(config);
    const {element} = base;
    element.classList.add("tetrahedron");

    loadCss("./tetrahedron.css", "tetrahedron-css", import.meta.url);


    /**
     * @param {TetraDimensions} dimensions
     * @returns {Record<TetraFaceKey, {
     *  position: Vec3,
     *  lookAwayFrom: Vec3 & ILookRotationOptions,
     *  size: Dim2
     * }>}
     */
    const makeFaceSpecs = dimensions => {
        const a = dimensions.a;
        const h = Math.sqrt(3) / 2 * a; // Face height
        const H = Math.sqrt(2 / 3) * a; // Tedra height
        const beta = Math.atan(2 * Math.sqrt(2));

        const faceOffset = (1 / 3 * h) / 2;

        const lookTarget = {x: 0, y: 0, z: H - h / 2 / Math.sin(beta)};

        return {
            s1: {
                position: {x: 0, y: faceOffset, z: H / 2},
                lookAwayFrom: {...lookTarget, forwardAxis: 'z', up: {x: 0, y: 1, z: 0}},
                size: {width: a, depth: h},
            },
            s2: {
                position: {x: -Math.sqrt(3) / 2 * faceOffset, y: -faceOffset / 2, z: H / 2},
                lookAwayFrom: {...lookTarget, forwardAxis: 'z', up: {x: 0, y: 0, z: -1}},
                size: {width: a, depth: h},
            },
            s3: {
                position: {x: Math.sqrt(3) / 2 * faceOffset, y: -faceOffset / 2, z: H / 2},
                lookAwayFrom: {...lookTarget, forwardAxis: 'z', up: {x: 0, y: 0, z: -1}},
                size: {width: a, depth: h},
            },
            bottom: {
                position: {x: 0, y: -h / 2 + h / 3, z: 0},
                lookAwayFrom: {x: 0, y: -h / 2 + h / 3, z: 1, forwardAxis: 'z', up: {x: 0, y: 1, z: 0}},
                size: {width: a, depth: h},
            },
        }
    };

    /** @type {Record<TetraFaceKey, PlaneType>} */
    const faces = (() => {
        const specs = makeFaceSpecs(dimensionObs.getValue());

        /** @type {TetraFaceKey[]} */
        const FACE_KEYS = ["s1", "s2", "s3", "bottom"];

        /** @type {Record<TetraFaceKey, PlaneType>} */
        const out = /** @type {any} */ {};

        /** @returns {PlaneType} */
        const mk = (k, v) => {
            const f = createPlane({
                position: v.position,
                dimensions: v.size,
            });
            f.element.classList.add(k);
            f.element.classList.add("tetra-face");
            base.addObject(f);

            f.lookAwayFrom(v.lookAwayFrom, {
                forwardAxis: v.lookAwayFrom.forwardAxis,
                up: v.lookAwayFrom.up
            });

            return f;
        };

        for (const k of FACE_KEYS) {
            const v = specs[k];

            out[k] = mk(k, v);
        }

        return out;
    })();

    /**
     * @param {TetraDimensions} dimensions
     */
    const updateFaces = dimensions => {
        const specs = makeFaceSpecs(dimensions);

        const apply = (p, s) => {
            if (s.position != null) p.setPosition(s.position);
            if (s.size != null) p.setDimensions(s.size);
        };

        apply(faces.s1, specs.s1);
        apply(faces.s2, specs.s2);
        apply(faces.s3, specs.s3);
        apply(faces.bottom, specs.bottom);
    };


    dimensionObs.onChange(dim => {
        element.style.setProperty("--a", String(dim.a));

        updateFaces(dim);
    });


    const tetrahedron = Object.create(base);

    Object.defineProperties(tetrahedron, {
        type: {
            value: "tetrahedron",
            writable: false,
            enumerable: true,
        },
    });

    tetrahedron.faces = faces;
    tetrahedron.getDimensions = () => ({...dimensionObs.getValue()});
    tetrahedron.setDimensions = newDimensions =>
        dimensionObs.setValue({...dimensionObs.getValue(), ...newDimensions});
    tetrahedron.onDimensionsChange = dimensionObs.onChange;

    return tetrahedron;
};