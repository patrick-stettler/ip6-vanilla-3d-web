import {loadCss} from "../../utils/load-css.js";
import {Observable} from "../../../kolibri-dist-0.9.10/kolibri/observable.js";
import {radToDeg} from "../../utils/euler-from-normal-deg.js";
import {createObject3d} from "../object-3d/object-3d.js";
import {createPlane} from "../plane/plane.js";

export {
    createPyramid
}

/** @typedef {'front'|'back'|'left'|'right'|'bottom'} PyramidFaceKey */


/** @typedef {Object3DType
 * & IDimensionable<Dim3>
 * & IThrowShadow
 * & {
 *   type: 'pyramid',
 *   faces: Record<PyramidFaceKey, PlaneType>,
 *  }} PyramidType
 */


/**
 * @typedef {Object3DConfigType & {
 *   dimensions?: Partial<Dim3>
 * }} PyramidConfigType
 */


/**
 * Create a pyramid from planes (4 tilted sides + bottom).
 * @param {PyramidConfigType} [config]
 * @returns {PyramidType}
 */
const createPyramid = (config = {}) => {

    /** @type {IObservable<Dim3>} */
    const dimensionObs = Observable({
        width: config.dimensions?.width ?? 1,
        depth: config.dimensions?.depth ?? 1,
        height: config.dimensions?.height ?? 1,
    });

    const base = createObject3d(config);
    const {element} = base;
    element.classList.add('pyramid');

    loadCss('./pyramid.css', 'pyramid-css', import.meta.url);


    /**
     * @param {Dim3} dimensions
     * @returns {Record<PyramidFaceKey, {
     *  position: Vec3,
     *  rotation: Vec3,
     *  size: Dim2
     * }>}
     */
    const makeFaceSpecs = dimensions => {
        const W = dimensions.width;
        const H = dimensions.height;
        const D = dimensions.depth;

        const hz = H / 2;

        const sFrontBack = Math.hypot(H, D / 2);
        const sLeftRight = Math.hypot(H, W / 2);
        const tiltFront = radToDeg(Math.atan2(H, D / 2));
        const tiltSide = radToDeg(Math.atan2(H, W / 2));

        return {
            front: {
                position: {x: 0, y: D / 4, z: 0},
                rotation: {x: -tiltFront, y: 0, z: 0},
                size: {width: W, depth: sFrontBack},
            },
            back: {
                position: {x: 0, y: -D / 4, z: 0},
                rotation: {x: tiltFront, y: 0, z: 180},
                size: {width: W, depth: sFrontBack},
            },
            left: {
                position: {x: -W / 4, y: 0, z: 0},
                rotation: {x: 0, y: -tiltSide, z: 90},
                size: {width: D, depth: sLeftRight},
            },
            right: {
                position: {x: W / 4, y: 0, z: 0},
                rotation: {x: 0, y: tiltSide, z: -90},
                size: {width: D, depth: sLeftRight},
            },
            bottom: {
                position: {x: 0, y: 0, z: -hz},
                rotation: {x: 180, y: 0, z: 0},
                size: {width: W, depth: D},
            },
        };
    };

    /** @type {Record<PyramidFaceKey, PlaneType>} */
    const faces = (() => {
        const specs = makeFaceSpecs(dimensionObs.getValue());

        /** @type {PyramidFaceKey[]} */
        const FACE_KEYS = ["front", "back", "left", "right", "bottom"];

        /** @type {Record<PyramidFaceKey, PlaneType>} */
        const out = /** @type {any} */ {};

        /** @returns {PlaneType} */
        const mk = (k, v, isTri) => {
            const f = createPlane({
                position: v.position,
                rotation: v.rotation,
                dimensions: v.size,
            });
            f.element.classList.add(k);
            if (isTri) f.element.classList.add("tri-face");
            base.addObject(f);
            return f;
        };

        for (const k of FACE_KEYS) {
            const v = specs[k];

            out[k] = mk(k, v, k !== 'bottom');
        }

        return out;
    })();

    /**
     * @param {Dim3} dimensions
     */
    const updateFaces = dimensions => {
        const specs = makeFaceSpecs(dimensions);

        const apply = (p, s) => {
            p.setPosition(s.position);
            p.setRotation(s.rotation);
            p.setDimensions(s.size);
        };

        apply(faces.front, specs.front);
        apply(faces.back, specs.back);
        apply(faces.left, specs.left);
        apply(faces.right, specs.right);
        apply(faces.bottom, specs.bottom);
    };


    dimensionObs.onChange(dim => {
        element.style.setProperty("--width", String(dim.width));
        element.style.setProperty("--depth", String(dim.depth));
        element.style.setProperty("--height", String(dim.height));

        updateFaces(dim);
    });


    const pyramid = Object.create(base);

    Object.defineProperties(pyramid, {
        type: {
            value: "pyramid",
            writable: false,
            enumerable: true,
        }
    });

    pyramid.faces = faces;
    pyramid.getDimensions = () => ({...dimensionObs.getValue()});
    pyramid.setDimensions = newDimensions =>
        dimensionObs.setValue({...dimensionObs.getValue(), ...newDimensions});
    pyramid.onDimensionsChange = dimensionObs.onChange;

    pyramid.getShadowCorners = () => {
        const dims = dimensionObs.getValue();
        const hx = (dims.width ?? 1) / 2;
        const hy = (dims.depth ?? 1) / 2;
        const hz = (dims.height ?? 1) / 2;

        return [
            {x: -hx, y: -hy, z: 0},
            {x: hx, y: -hy, z: 0},
            {x: hx, y: hy, z: 0},
            {x: -hx, y: hy, z: 0},
            {x: 0, y: 0, z: hz},
        ];
    };

    return pyramid;
};