import {loadCss} from "../../utils/load-css.js";
import {createPlane} from "../plane/plane.js";
import {Observable} from "../../../kolibri-dist-0.9.10/kolibri/observable.js";
import {createObject3d} from "../object-3d/object-3d.js";

export {
    createBox
}

/** @typedef {'front'|'back'|'left'|'right'|'top'|'bottom'} BoxFaceKey */

/** @typedef { Object3DType
 * & IDimensionable<Dim3>
 * & IThrowShadow
 * & {
 *   type: 'box',
 *   faces: Record<BoxFaceKey, PlaneType>,
 * }} BoxType
 */


/**
 * @typedef { Object3DConfigType & {
 *   dimensions?: Partial<Dim3>
 * }} BoxConfigType
 */


/**
 * @param {BoxConfigType} [config]
 * @returns {BoxType}
 */
const createBox = (config = {}) => {

    /** @type {IObservable<Dim3>} */
    const dimensionObs = Observable({
        width: config.dimensions?.width ?? 1,
        depth: config.dimensions?.depth ?? 1,
        height: config.dimensions?.height ?? 1,
    });

    const base = createObject3d(config);
    const {element} = base;
    element.classList.add('box');

    loadCss('./box.css', 'box-css', import.meta.url);


    /**
     * @param {Dim3} dimensions
     * @returns {Record<BoxFaceKey, {
     *  position: Vec3,
     *  rotation: Vec3,
     *  size: Dim2
     * }>}
     */
    const makeFaceSpecs = dimensions => {
        const W = dimensions.width;
        const H = dimensions.height;
        const D = dimensions.depth;

        const hx = W / 2;
        const hy = D / 2;
        const hz = H / 2;

        return {
            front: {
                position: {x: 0, y: hy, z: 0},
                rotation: {x: -90, y: 0, z: 0},
                size: {width: W, depth: H},
            },
            back: {
                position: {x: 0, y: -hy, z: 0},
                rotation: {x: -90, y: 180, z: 0},
                size: {width: W, depth: H},
            },
            left: {
                position: {x: -hx, y: 0, z: 0},
                rotation: {x: -90, y: -90, z: 0},
                size: {width: D, depth: H},
            },
            right: {
                position: {x: hx, y: 0, z: 0},
                rotation: {x: -90, y: 90, z: 0},
                size: {width: D, depth: H},
            },
            top: {
                position: {x: 0, y: 0, z: hz},
                rotation: {x: 0, y: 0, z: 0},
                size: {width: W, depth: D},
            },
            bottom: {
                position: {x: 0, y: 0, z: -hz},
                rotation: {x: 180, y: 0, z: 0},
                size: {width: W, depth: D},
            },
        };
    };

    /** @type {Record<BoxFaceKey, PlaneType>} */
    const faces = (() => {
        const specs = makeFaceSpecs(dimensionObs.getValue());

        /** @type {BoxFaceKey[]} */
        const FACE_KEYS = ["front", "back", "left", "right", "top", "bottom"];

        /** @type {Record<BoxFaceKey, PlaneType>} */
        const out = /** @type {any} */ {};

        for (const k of FACE_KEYS) {
            const v = specs[k];
            const f = createPlane({
                position: v.position,
                rotation: v.rotation,
                dimensions: v.size,
            });

            f.element.classList.add(k);
            base.addObject(f);

            out[k] = f;
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
        apply(faces.top, specs.top);
        apply(faces.bottom, specs.bottom);
    };


    dimensionObs.onChange(dim => {
        element.style.setProperty("--width", String(dim.width));
        element.style.setProperty("--depth", String(dim.depth));
        element.style.setProperty("--height", String(dim.height));

        updateFaces(dim);
    });


    const box = Object.create(base);

    Object.defineProperties(box, {
        type: {
            value: "box",
            writable: false,
            enumerable: true,
        },
    });

    box.faces = faces;
    box.getDimensions = () => ({...dimensionObs.getValue()});
    box.setDimensions = newDimensions =>
        dimensionObs.setValue({...dimensionObs.getValue(), ...newDimensions});
    box.onDimensionsChange = dimensionObs.onChange;

    box.getShadowCorners = () => {
        const dims = dimensionObs.getValue();
        const hx = (dims.width ?? 1) / 2;
        const hy = (dims.depth ?? 1) / 2;
        const hz = (dims.height ?? 1) / 2;

        return [
            {x: -hx, y: -hy, z: -hz},
            {x: hx, y: -hy, z: -hz},
            {x: hx, y: hy, z: -hz},
            {x: -hx, y: hy, z: -hz},
            {x: -hx, y: -hy, z: hz},
            {x: hx, y: -hy, z: hz},
            {x: hx, y: hy, z: hz},
            {x: -hx, y: hy, z: hz},
        ];
    };

    return box;
};