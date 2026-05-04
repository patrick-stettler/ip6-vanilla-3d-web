import {loadCss} from "../../utils/load-css.js";
import {Observable} from "../../../kolibri-dist-0.9.10/kolibri/observable.js";
import {createObject3d} from "../object-3d/object-3d.js";

export {
    createSphere
}

/** @typedef {Object3DType
 * & IDimensionable<SphereDimensions>
 * & {
 * type: 'sphere',
 * faces: HTMLElement[]
 * }} SphereType
 */


/** @typedef { Object3DConfigType & {
 * dimensions?: SphereDimensions,
 * slices?: Number,
 * stacks?: Number,
 * }} SphereConfigType
 */


/**
 * @param {SphereConfigType} [config]
 * @returns {SphereType}
 */
const createSphere = (config = {}) => {

    /** @type {IObservable<SphereDimensions>} */
    const dimensionObs = Observable({
        radius: config.dimensions?.radius ?? 0.5,
    });

    const slices = config.slices ?? 20;
    const stacks = config.stacks ?? 10;

    const base = createObject3d(config);
    const {element} = base;
    element.classList.add('sphere');

    loadCss('./sphere.css', 'sphere-css', import.meta.url);

    const beta = 360 / slices;
    const dphi = 180 / stacks;

    const betaRad = beta * Math.PI / 180;
    const dphiRad = dphi * Math.PI / 180;

    const faces = [];

    const clear = () => {
        for (const p of faces) element.removeChild(p);
        faces.length = 0;
    };

    /**
     * @param {SphereDimensions} dimensions
     */
    const draw = dimensions => {
        clear();
        for (let i = 0; i < slices; i++) {
            for (let j = 0; j < stacks; j++) {

                const phiTopDeg = -90 + j * dphi;
                const phiBotDeg = -90 + (j + 1) * dphi;
                const phiMidDeg = (phiTopDeg + phiBotDeg) / 2;

                const phiTop = phiTopDeg * Math.PI / 180;
                const phiMid = phiMidDeg * Math.PI / 180;
                const phiBot = phiBotDeg * Math.PI / 180;

                const wTop = 2 * dimensions.radius * Math.sin(betaRad / 2) * Math.max(0, Math.cos(phiTop));
                const wMid = 2 * dimensions.radius * Math.sin(betaRad / 2) * Math.max(0, Math.cos(phiMid));
                const wBot = 2 * dimensions.radius * Math.sin(betaRad / 2) * Math.max(0, Math.cos(phiBot));

                const W = Math.max(wTop, wMid, wBot);
                const H = dimensions.radius * dphiRad;

                const tTop = W === 0 ? 0 : wTop / W;
                const tBot = W === 0 ? 0 : wBot / W;

                const xTopL = 50 * (1 - tTop);
                const xTopR = 100 - xTopL;
                const xBotL = 50 * (1 - tBot);
                const xBotR = 100 - xBotL;

                const spherePoint = document.createElement('div');
                spherePoint.classList.add('sphere-face');
                spherePoint.style.width = `calc(${W} * var(--display-unit))`;
                spherePoint.style.height = `calc(${H} * var(--display-unit))`;

                spherePoint.style.transform =
                    `rotateY(${i * beta}deg) ` +
                    `rotateX(${phiMidDeg}deg) ` +
                    `translateZ(calc(${dimensions.radius} * var(--display-unit)))`;

                spherePoint.style.clipPath = `polygon(${xBotL}% 0%, ${xBotR}% 0%, ${xTopR}% 100%, ${xTopL}% 100%)`;

                faces.push(spherePoint);
                base.element.appendChild(spherePoint);
            }
        }
    };


    dimensionObs.onChange(dim => {
        element.style.setProperty('--radius', String(dim.radius));

        draw(dim);
    });


    const sphere = Object.create(base);

    Object.defineProperties(sphere, {
        type: {
            value: "sphere",
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