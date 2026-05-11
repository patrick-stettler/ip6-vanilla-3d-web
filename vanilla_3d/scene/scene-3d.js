import {
    applyDirection,
    buildLookRotation,
    buildRotationMatrix,
    mat4ToCssMatrix3d,
    mat4ToEulerDeg
} from "../utils/transf-mat.js";
import {mat4Mul} from "../utils/mat4.js";
import {clamp} from "../utils/clamp.js";
import {Observable} from "../../kolibri-dist-0.9.10/kolibri/observable.js";
import {sub} from "../utils/vector.js";
import {loadCss} from "../utils/load-css.js";
import {DISPLAY_UNIT} from "../types/logical-unit.js";
import {bindControls} from "./functions/bind-controls.js";
import {createAxisHelper} from "../objects/axis-helper/axis-helper.js";

export {
    createScene3D
}

/**
 * @typedef {
 * IDomBound
 * & IPositionable
 * & IRotatable
 * & IChildContainer
 * & IAxisHelper
 * } IDefault3DProperties
 */

/**
 * Public API of a 3D scene: 2D translation (screen space), 3D rotation, zoom and basic controls.
 * @typedef {
 * IDefault3DProperties
 * & IPositionable2D
 * & IControllable
 * } Scene3DType
 */

/**
 * Configuration for the scene.
 * @typedef SceneConfigType
 * @property {Partial<Vec3>}    [position]      Initial position (Default: {x:0,y:0,z:0}).
 * @property {Partial<Vec3>}    [rotation]      Initial rotation in degree (Default: {x:0,y:0,z:0}).
 * @property {Number}           [zoom]          Initial zoom (Default: 1).
 */

/**
 * Create and initialize a 3D scene.
 * @param {HTMLElement} scene
 * @param {SceneConfigType} [config]
 * @returns {Scene3DType}
 */
const createScene3D = (scene, config = {}) => {

    loadCss('./scene-3d.css', '3d-scene', import.meta.url);
    scene.classList.add("scene-3d", "noSelection");


    /** @type {IObservable<Vec2>} */
    const originObs = Observable({
        x: 0,
        y: 0
    });

    /** @type {IObservable<Vec3>} */
    const coordsObs = Observable({
        x: config.position?.x ?? 0,
        y: config.position?.y ?? 0,
        z: config.position?.z ?? 0,
    });

    /** @type {IObservable<Mat4>} */
    const rotationMatObs = Observable(
        buildRotationMatrix({
            x: 0, y: 0, z: 0, ...config.rotation
        }));

    /** @type {IObservable<Number>} */
    const zoomObs = Observable(config.zoom ?? 1);

    const zoomBoundaries = {
        minZoom: 0.001,
        maxZoom: 1_000_000,
    };


    /**
     * origin
     *
     * This element represents the screen space origin of the 3D world.
     * It is positioned relative to the center of the scene and moved by
     * state.origin.x / state.origin.y (for example while panning).
     * In CSS it also holds the rotateX(90deg) to align the world space.
     */
    const origin = document.createElement("div");
    origin.className = "origin";
    scene.appendChild(origin);


    /**
     * coords
     *
     * This is the world root node. All world transforms are applied here:
     *  - translation (state.position)
     *  - rotation (state.rotation)
     *  - zoom/scale (state.zoom)
     *
     * All 3D objects are added as children of coords and therefore inherit
     * these transforms.
     */
    const coords = document.createElement("div");
    coords.className = "coords";
    coords.style.setProperty('--display-unit', `calc(${DISPLAY_UNIT})`);
    origin.appendChild(coords);


    let rect = scene.getBoundingClientRect();


    originObs.onChange(pos => {
        origin.style.setProperty('--origin-x', `${pos.x}px`);
        origin.style.setProperty('--origin-y', `${pos.y}px`);
    });

    coordsObs.onChange(pos => {
        coords.style.setProperty('--coords-x', `calc(${pos.x} * var(--display-unit))`);
        coords.style.setProperty('--coords-y', `calc(${pos.y} * var(--display-unit))`);
        coords.style.setProperty('--coords-z', `calc(${pos.z} * var(--display-unit))`);
    });

    rotationMatObs.onChange(rotMat => coords.style.setProperty("--coords-rot", mat4ToCssMatrix3d(rotMat)));

    zoomObs.onChange(zoom => coords.style.setProperty('--coords-scale', String(zoom)));


    return {
        element: scene,

        getPosition: () => ({...coordsObs.getValue()}),
        getRotation: () => mat4ToEulerDeg(rotationMatObs.getValue()),
        getRotationMat: () => [...rotationMatObs.getValue()],
        getZoom: zoomObs.getValue,

        getPosition2D: () => ({...originObs.getValue()}),
        onPositionChange: coordsObs.onChange,
        setPosition: newPos => coordsObs.setValue({...coordsObs.getValue(), ...newPos}),
        translateBy: dp => {
            const dWorld = applyDirection(rotationMatObs.getValue(), dp);

            const oldPos = coordsObs.getValue();

            coordsObs.setValue({
                x: oldPos.x + dWorld.x,
                y: oldPos.y + dWorld.y,
                z: oldPos.z + dWorld.z,
            });
        },

        onOriginPosChange: originObs.onChange,
        setOrigin: newOrigin => originObs.setValue({...originObs.getValue(), ...newOrigin}),
        translateOriginBy: dp => {

            const oldPos = originObs.getValue();

            originObs.setValue({
                x: oldPos.x + dp.x,
                y: oldPos.y + dp.y
            });
        },

        onRotationChange: rotationMatObs.onChange,
        setRotation: newRot => rotationMatObs.setValue(buildRotationMatrix(newRot)),
        setRotationMat: m => rotationMatObs.setValue(m),
        lookAt: (p, opt) => {
            const currentPos = coordsObs.getValue();

            const dir = {
                x: p.x - currentPos.x,
                y: p.y - currentPos.y,
                z: p.z - currentPos.z
            };

            rotationMatObs.setValue(buildLookRotation(dir, opt));
        },
        lookAwayFrom: (p, opt) => {
            const currentPos = coordsObs.getValue();

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

        onZoomChange: zoomObs.onChange,
        setZoom: (next, opts) => {
            const prevZoom = zoomObs.getValue();
            next = clamp(next, zoomBoundaries.minZoom, zoomBoundaries.maxZoom);

            if (next === prevZoom) return;

            if (opts?.anchor) {
                rect = scene.getBoundingClientRect();

                const k = next / prevZoom;

                const centerX = rect.left + rect.width / 2;
                const centerY = rect.top + rect.height / 2;

                const ax = opts.anchor.x - centerX;
                const ay = opts.anchor.y - centerY;

                originObs.setValue({
                    x: ax - (ax - originObs.getValue().x) * k,
                    y: ay - (ay - originObs.getValue().y) * k
                })
            }

            zoomObs.setValue(next);
        },

        addObject: o => coords.appendChild(o.element),

        removeObject: o => coords.removeChild(o.element),

        showAxisHelper(config) {
            const axisHelper = createAxisHelper(this, config);
            this.addObject(axisHelper);
        },

        addControls(opts = {}) {
            if (this._unbindControls) return;
            zoomBoundaries.minZoom = opts.minZoom ?? zoomBoundaries.minZoom;
            zoomBoundaries.maxZoom = opts.maxZoom ?? zoomBoundaries.maxZoom;
            this._unbindControls = bindControls(this, opts);
        },

        removeControls() {
            this._unbindControls?.();
            this._unbindControls = undefined;
        },
    }
};