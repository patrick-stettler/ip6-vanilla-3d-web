import {loadCss} from "../../utils/load-css.js";
import {Observable} from "../../../kolibri-dist-0.9.10/kolibri/observable.js";
import {createObject3d} from "../object-3d/object-3d.js";

export {
    createPlane
}

/**
 * @typedef {Object3DType
 * & IDimensionable<Dim2>
 * & IThrowShadow
 * & {
 *   type: 'plane',
 * }} PlaneType
 */


/** @typedef { Object3DConfigType & {
 *   dimensions?: Partial<Dim2>
 * }} PlaneConfigType
 */


/**
 * Create a plane.
 * @param {PlaneConfigType} [config]
 * @returns {PlaneType}
 */
const createPlane = (config = {}) => {

    /** @type {IObservable<Dim2>} */
    const dimensionObs = Observable({
        width: config.dimensions?.width ?? 1,
        depth: config.dimensions?.depth ?? 1,
    });

    const base = createObject3d(config);
    const {element} = base;
    element.classList.add('plane');

    loadCss('./plane.css', 'plane-css', import.meta.url);


    dimensionObs.onChange(dim => {
        element.style.setProperty("--width", String(dim.width));
        element.style.setProperty("--depth", String(dim.depth));
    });


    const plane = Object.create(base);

    Object.defineProperties(plane, {
        type: {
            value: "plane",
            writable: false,
            enumerable: true,
        },
    });

    plane.getDimensions = () => ({...dimensionObs.getValue()});
    plane.setDimensions = newDimensions =>
        dimensionObs.setValue({...dimensionObs.getValue(), ...newDimensions});
    plane.onDimensionsChange = dimensionObs.onChange;

    plane.getShadowCorners = () => {
        const dims = dimensionObs.getValue();
        const hx = (dims.width ?? 1) / 2;
        const hy = (dims.depth ?? 1) / 2;

        return [
            {x: -hx, y: -hy, z: 0},
            {x: hx, y: -hy, z: 0},
            {x: hx, y: hy, z: 0},
            {x: -hx, y: hy, z: 0},
        ];
    };

    return plane;
};