import {loadCss} from "../../utils/load-css.js";
import {Observable} from "../../../kolibri-dist-0.9.10/kolibri/observable.js";
import {eulerFromNormalDeg} from "../../utils/euler-from-normal-deg.js";
import {createObject3d} from "../object-3d/object-3d.js";
import {createPlane} from "../plane/plane.js";

export {
    createCylinder
}

/** @typedef {Object3DType
 * & IDimensionable<CylinderDimensions>
 * & {
 *   type: 'cylinder',
 *   faces: {
 *     top: PlaneType,
 *     bottom: PlaneType,
 *     sides: PlaneType[]
 *   }
 * }} CylinderType
 */


/** @typedef { Object3DConfigType & {
 *   dimensions?: Partial<CylinderDimensions>,
 *   radialSegments?: number
 * }} CylinderConfigType
 */


/**
 * @param {CylinderConfigType} [config]
 * @returns {CylinderType}
 */
const createCylinder = (config = {}) => {

    /** @type {IObservable<CylinderDimensions>} */
    const dimensionObs = Observable({
        radius: config.dimensions?.radius ?? 0.5,
        height: config.dimensions?.height ?? 1,
    });

    const radialSegments = Math.max(3, Math.floor(config.radialSegments ?? 64));

    const base = createObject3d(config);
    const {element} = base;
    element.classList.add("cylinder");

    loadCss("./cylinder.css", "cylinder-css", import.meta.url);

    /** @type {PlaneType[] | null} */
    let sideStrips = null;
    /** @type {PlaneType | null} */
    let topCap = null;
    /** @type {PlaneType | null} */
    let bottomCap = null;

    /**
     * @param {CylinderDimensions} dimensions
     * @returns {{
     *   sides: { position: Vec3, rotation: Vec3, size: Dim2 }[],
     *   top: { position: Vec3, rotation: Vec3, size: Dim2 },
     *   bottom: { position: Vec3, rotation: Vec3, size: Dim2 },
     * }}
     */
    const makeFaceSpecs = dimensions => {
        const {radius, height} = dimensions;

        const arcLen = 2 * Math.PI * radius;
        const stripWidth = (arcLen / radialSegments) * 1.02;

        const sides = Array.from({length: radialSegments}, (_, i) => {
            const theta = (i / radialSegments) * 2 * Math.PI;
            const cosT = Math.cos(theta);
            const sinT = Math.sin(theta);

            return {
                position: {x: radius * cosT, y: 0, z: radius * sinT},
                rotation: eulerFromNormalDeg(cosT, 0, sinT),
                size: {width: stripWidth, depth: height},
            };
        });

        return {
            sides,
            top: {
                position: {x: 0, y: height / 2, z: 0},
                rotation: eulerFromNormalDeg(0, 1, 0),
                size: {width: radius * 2, depth: radius * 2},
            },
            bottom: {
                position: {x: 0, y: -height / 2, z: 0},
                rotation: eulerFromNormalDeg(0, -1, 0),
                size: {width: radius * 2, depth: radius * 2},
            },
        };
    };

    /**
     * Creates all faces once and returns stable references.
     * @param {CylinderDimensions} dimensions
     * @returns {{ top: PlaneType, bottom: PlaneType, sides: PlaneType[] }}
     */
    const ensureFaces = dimensions => {
        if (sideStrips && topCap && bottomCap) {
            return {top: topCap, bottom: bottomCap, sides: sideStrips};
        }

        const specs = makeFaceSpecs(dimensions);

        sideStrips = specs.sides.map(s => {
            const strip = createPlane({
                position: s.position,
                rotation: s.rotation,
                dimensions: s.size,
            });
            strip.element.classList.add("cylinder-side");
            base.addObject(strip);
            return strip;
        });

        topCap = createPlane({
            position: specs.top.position,
            rotation: specs.top.rotation,
            dimensions: specs.top.size,
        });
        topCap.element.classList.add("cylinder-cap");
        base.addObject(topCap);

        bottomCap = createPlane({
            position: specs.bottom.position,
            rotation: specs.bottom.rotation,
            dimensions: specs.bottom.size,
        });
        bottomCap.element.classList.add("cylinder-cap");
        base.addObject(bottomCap);

        return {top: topCap, bottom: bottomCap, sides: sideStrips};
    };

    /**
     * Updates face transforms and sizes without recreating elements.
     * @param {CylinderDimensions} dimensions
     */
    const updateFaces = dimensions => {
        const specs = makeFaceSpecs(dimensions);
        const f = ensureFaces(dimensions);

        for (let i = 0; i < f.sides.length; i++) {
            const p = f.sides[i];
            const s = specs.sides[i];

            p.setPosition(s.position);
            p.setRotation(s.rotation);
            p.setDimensions(s.size);
        }

        f.top.setPosition(specs.top.position);
        f.top.setRotation(specs.top.rotation);
        f.top.setDimensions(specs.top.size);

        f.bottom.setPosition(specs.bottom.position);
        f.bottom.setRotation(specs.bottom.rotation);
        f.bottom.setDimensions(specs.bottom.size);
    };


    dimensionObs.onChange(dim => {
        element.style.setProperty("--radius", String(dim.radius));
        element.style.setProperty("--height", String(dim.height));

        updateFaces(dim);
    });


    const cylinder = Object.create(base);

    Object.defineProperties(cylinder, {
        type: {
            value: "cylinder",
            writable: false,
            enumerable: true,
        },
    });

    cylinder.faces = ensureFaces(dimensionObs.getValue());
    cylinder.getDimensions = () => ({...dimensionObs.getValue()});
    cylinder.setDimensions = newDimensions =>
        dimensionObs.setValue({...dimensionObs.getValue(), ...newDimensions});
    cylinder.onDimensionsChange = dimensionObs.onChange;

    return cylinder;
};