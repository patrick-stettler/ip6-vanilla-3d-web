import {loadCss} from "../../utils/load-css.js";
import {
    applyDirection,
    buildLookRotation,
    buildRotationMatrix,
    mat4ToCssMatrix3d,
    mat4ToEulerDeg
} from "../../utils/transf-mat.js";
import {mat4Mul} from "../../utils/mat4.js";
import {Observable} from "../../../kolibri-dist-0.9.10/kolibri/observable.js";
import {sub} from "../../utils/vector.js";
import {createAxisHelper} from "../axis-helper/axis-helper.js";

export {
    createObject3d
}

/**
 * 3D object composed of multiple interfaces.
 * @typedef {
 * IDefault3DProperties
 * & IIdentifiable
 * & IScalable
 * } Object3DType
 */


/**
 * Configuration for Object3D.
 * @typedef Object3DConfigType
 * @property {Partial<Vec3>}            [position={x:0,y:0,z:0}]      Initial position.
 * @property {Partial<Vec3>}            [rotation={x:0,y:0,z:0}]      Initial rotation in degree.
 * @property {Partial<Vec3> | Number}   [scale={x:1,y:1,z:1}]         Initial scale.
 * @property {Element}                  [baseElement]
 */


/**
 * Create the 3D object.
 * @param {Object3DConfigType} [config]
 * @returns {Object3DType}
 */
const createObject3d = (config = {}) => {

    loadCss('./object-3d.css', 'object-3d-css', import.meta.url);

    const element = config.baseElement ?? document.createElement('div');
    element.classList.add('object-3d');

    const id = crypto.randomUUID();

    /** @type {IObservable<Vec3>} */
    const positionObs = Observable({
        x: config.position?.x ?? 0,
        y: config.position?.y ?? 0,
        z: config.position?.z ?? 0,
    });

    /** @type {IObservable<Mat4>} */
    const rotationMatObs = Observable(
        buildRotationMatrix({
            x: 0, y: 0, z: 0, ...config.rotation
        }));

    /** @type {IObservable<Vec3>} */
    const scaleObs = Observable(
        typeof config.scale === 'number'
            ? {x: config.scale, y: config.scale, z: config.scale}
            : {x: 1, y: 1, z: 1, ...config.scale}
    );


    positionObs.onChange(pos => {
        element.style.setProperty('--x', `calc(${pos.x} * var(--display-unit))`);
        element.style.setProperty('--y', `calc(${pos.y} * var(--display-unit))`);
        element.style.setProperty('--z', `calc(${pos.z} * var(--display-unit))`);
    });

    rotationMatObs.onChange(rotMat =>
        element.style.setProperty("--rot", mat4ToCssMatrix3d(rotMat))
    );

    scaleObs.onChange(scale => {
        element.style.setProperty('--sx', String(scale.x));
        element.style.setProperty('--sy', String(scale.y));
        element.style.setProperty('--sz', String(scale.z));
    });


    return {
        id,
        type: 'base3DObject',
        element,

        getPosition: () => ({...positionObs.getValue()}),
        getRotation: () => mat4ToEulerDeg(rotationMatObs.getValue()),
        getRotationMat: () => [...rotationMatObs.getValue()],
        getScale: () => ({...scaleObs.getValue()}),

        onPositionChange: positionObs.onChange,
        setPosition: newPos => positionObs.setValue({...positionObs.getValue(), ...newPos}),
        translateBy: dp => {
            const dWorld = applyDirection(rotationMatObs.getValue(), dp);

            const oldPos = positionObs.getValue();

            positionObs.setValue({
                x: oldPos.x + dWorld.x,
                y: oldPos.y + dWorld.y,
                z: oldPos.z + dWorld.z,
            })
        },

        onRotationChange: rotationMatObs.onChange,
        setRotation: newRot => rotationMatObs.setValue(buildRotationMatrix(newRot)),
        setRotationMat: m => rotationMatObs.setValue(m),
        lookAt: (p, opt) => {
            const currentPos = positionObs.getValue();

            const dir = sub(p, currentPos);

            rotationMatObs.setValue(buildLookRotation(dir, opt));
        },
        lookAwayFrom: (p, opt) => {
            const currentPos = positionObs.getValue();

            const dir = sub(currentPos, p);

            rotationMatObs.setValue(buildLookRotation(dir, opt));
        },
        rotateBy: drDeg => {
            const dR = buildRotationMatrix(drDeg);

            rotationMatObs.setValue(mat4Mul(dR, rotationMatObs.getValue()));
        },
        rotateByWorld: drDeg => {
            const dR = buildRotationMatrix(drDeg);

            rotationMatObs.setValue(mat4Mul(rotationMatObs.getValue(), dR));
        },

        onScaleChange: scaleObs.onChange,
        setScale: newScale => {
            const scale = typeof newScale === 'number'
                ? {x: newScale, y: newScale, z: newScale}
                : {...scaleObs.getValue(), ...newScale};

            scaleObs.setValue(scale);
        },

        addObject: o => element.appendChild(o.element),

        removeObject: o => element.removeChild(o.element),

        showAxisHelper(config) {
            const axisHelper = createAxisHelper(this, config);
            this.addObject(axisHelper);
        }
    }
};