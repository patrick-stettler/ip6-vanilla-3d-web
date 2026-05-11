import {loadCss} from "../../utils/load-css.js";
import {handleDrag, handleRoll} from "../../utils/handle-drag.js";
import {createObject3d} from "../object-3d/object-3d.js";
import {createBox} from "../box/box.js";
import {createCylinder} from "../cylinder/cylinder.js";
import {createPlane} from "../plane/plane.js";
import {createPyramid} from "../pyramid/pyramid.js";

export {
    createAxisHelper
}

/**
 * Axis helper object.
 * @typedef {Object3DType
 * & {
 *   type: 'axisHelper',
 * }} AxisHelperType
 */


/**
 * Axis helper config (extends Object3DConfig).
 * @typedef {Object3DConfigType & {
 *   dimensions?: Partial<Dim3>
 *   showPlanes?: Boolean
 *   thickness?: LogicalUnit
 *   arrowDimensions?: Dimensions,
 * }} AxisHelperConfigType
 */


/**
 * Create a visual axis helper (X/Y/Z axes with arrows and labels).
 * @param {Scene3DType | Object3DType} owner
 * @param {AxisHelperConfigType} [config]
 * @returns {AxisHelperType}
 */
const createAxisHelper = (owner, config = {}) => {

    const showPlanes = config.showPlanes ?? false;
    const thickness = config.thickness ?? 0.05;

    const dimensions = { width: 1, depth: 1, height: 1, ...(config.dimensions ?? {}) };
    const arrowDimensions = { width: 0.1, height: 0.3, depth: 0.1, ...(config.arrowDimensions ?? {}) };


    const base = createObject3d(config);
    const {element} = base;
    element.classList.add('axis-helper');

    loadCss('./axis-helper.css', 'axis-helper', import.meta.url);

    const xAxis = createBox({
        dimensions: {width: dimensions.width - arrowDimensions.height, depth: thickness, height: thickness},
        position: {x: (dimensions.width - arrowDimensions.height) / 2, y: 0, z: 0},
    });
    xAxis.element.classList.add(`x-axis`);
    base.addObject(xAxis);

    const xArrow = createPyramid({
        dimensions: {width: arrowDimensions.width, depth: arrowDimensions.depth, height: arrowDimensions.height},
        position: {x: dimensions.width - arrowDimensions.height / 2, y: 0, z: 0},
        rotation: {x: 0, y: 90, z: 0},
    });
    xArrow.element.classList.add('x-axis');
    base.addObject(xArrow);

    handleDrag(
        xArrow,
        {x: 1, y: 0, z: 0},
        {x: 0, y: 1, z: 0},
        dWorld => owner.translateBy({x: dWorld.x}),
        {
            showAxisDragHelper: true
        }
    );

    const xRoll = createCylinder({
        dimensions: {radius: thickness, height: dimensions.width / 4},
        position: {x: (dimensions.width - arrowDimensions.height) / 2},
        rotation: {z: 90}
    });
    xRoll.element.classList.add(`x-axis`);
    base.addObject(xRoll);

    handleRoll(
        xRoll,
        {x: 0, y: 1, z: 0},
        {x: 0, y: 0, z: 1},
        deltaDeg => owner.rotateBy({x: deltaDeg})
    );

    const xText = createPlane({
        dimensions: {width: 0.5, depth: 0.5},
        position: {x: dimensions.width - 0.05, y: 0, z: 0.2},
        rotation: {x: -90, y: 0, z: 0},
    });
    xText.element.classList.add('x-axis', 'text');
    xText.element.textContent = "x";
    base.addObject(xText);


    const yAxis = createBox({
        dimensions: {width: thickness, depth: dimensions.depth - arrowDimensions.height, height: thickness},
        position: {x: 0, y: (dimensions.depth - arrowDimensions.height) / 2, z: 0},
    });
    yAxis.element.classList.add(`y-axis`);
    base.addObject(yAxis);

    const yArrow = createPyramid({
        dimensions: {width: arrowDimensions.width, depth: arrowDimensions.depth, height: arrowDimensions.height},
        position: {x: 0, y: dimensions.depth - arrowDimensions.height / 2, z: 0},
        rotation: {x: -90, y: 0, z: 0},
    });
    yArrow.element.classList.add('y-axis');
    base.addObject(yArrow);

    handleDrag(
        yArrow,
        {x: 0, y: 1, z: 0},
        {x: 1, y: 0, z: 0},
        dWorld => owner.translateBy({y: dWorld.y}),
        {
            showAxisDragHelper: true
        }
    );

    const yRoll = createCylinder({
        dimensions: {radius: thickness, height: dimensions.depth / 4},
        position: {y: (dimensions.depth - arrowDimensions.height) / 2},
    });
    yRoll.element.classList.add(`y-axis`);
    base.addObject(yRoll);

    handleRoll(
        yRoll,
        {x: 0, y: 0, z: 1},
        {x: 1, y: 0, z: 0},
        deltaDeg => owner.rotateBy({y: deltaDeg})
    );

    const yText = createPlane({
        dimensions: {width: 0.5, depth: 0.5},
        position: {x: 0, y: dimensions.depth - 0.05, z: 0.2},
        rotation: {x: -90, y: 90, z: 0},
    });
    yText.element.classList.add('y-axis', 'text');
    yText.element.textContent = "y";
    base.addObject(yText);


    const zAxis = createBox({
        dimensions: {width: thickness, depth: thickness, height: dimensions.height - arrowDimensions.height},
        position: {x: 0, y: 0, z: (dimensions.height - arrowDimensions.height) / 2},
    });
    zAxis.element.classList.add(`z-axis`);
    base.addObject(zAxis);

    const zArrow = createPyramid({
        dimensions: {width: arrowDimensions.width, depth: arrowDimensions.depth, height: arrowDimensions.height},
        position: {x: 0, y: 0, z: dimensions.height - arrowDimensions.height / 2},
        rotation: {x: 0, y: 0, z: 0},
    });
    zArrow.element.classList.add('z-axis');
    base.addObject(zArrow);

    handleDrag(
        zArrow,
        {x: 0, y: 0, z: 1},
        {x: 1, y: 0, z: 0},
        dWorld => owner.translateBy({z: dWorld.z}),
        {
            showAxisDragHelper: true
        }
    );

    const zRoll = createCylinder({
        dimensions: {radius: thickness, height: dimensions.height / 4},
        position: {z: (dimensions.height - arrowDimensions.height) / 2},
        rotation: {x: 90}
    });
    zRoll.element.classList.add(`z-axis`);
    base.addObject(zRoll);

    handleRoll(
        zRoll,
        {x: 0, y: 1, z: 0},
        {x: 1, y: 0, z: 0},
        deltaDeg => owner.rotateBy({z: deltaDeg})
    );

    const zText = createPlane({
        dimensions: {width: 0.5, depth: 0.5},
        position: {x: 0.2, y: 0, z: dimensions.height - 0.05},
        rotation: {x: 90, y: 180, z: 0},
    });
    zText.element.classList.add('z-axis', 'text');
    zText.element.textContent = "z";
    base.addObject(zText);

    if (showPlanes) {
        const xyPlane = createPlane({
            dimensions: {width: dimensions.width, depth: dimensions.depth},
            position: {x: dimensions.width / 2, y: dimensions.depth / 2, z: 0}
        });
        xyPlane.element.classList.add('helper-plane');

        const xzPlane = createPlane({
            dimensions: {width: dimensions.width, depth: dimensions.height},
            position: {x: dimensions.width / 2, y: 0, z: dimensions.height / 2},
            rotation: {x: 90, y: 0, z: 0}
        });
        xzPlane.element.classList.add('helper-plane');

        const yzPlane = createPlane({
            dimensions: {width: dimensions.height, depth: dimensions.depth},
            position: {x: 0, y: dimensions.depth / 2, z: dimensions.height / 2},
            rotation: {x: 0, y: 90, z: 0}
        });
        yzPlane.element.classList.add('helper-plane');

        base.addObject(xyPlane);
        base.addObject(xzPlane);
        base.addObject(yzPlane);
    }

    const axisHelper = Object.create(base);

    Object.defineProperties(axisHelper, {
        type: {
            value: "axisHelper",
            writable: false,
            enumerable: true,
        },
    });
    return axisHelper;
};