import {mat4Identity, mat4Mul, mat4RotateX, mat4RotateY, mat4RotateZ} from "./mat4.js";
import {degToRad, radToDeg} from "./euler-from-normal-deg.js";
import {add, cross, dot, mul, normalize} from "./vector.js";
import {clamp} from "./clamp.js";

export {
    applyDirection,
    buildRotationMatrix,
    mat4ToCssMatrix3d,
    mat4ToEulerDeg,
    buildLookRotation,
    axisFromMatCols,
    normalFromObject,
    pointChildToParentLocal
}

/**
 * Applies a 4x4 matrix to a direction vector.
 * Only the rotation part of the matrix is used (translation is ignored).
 *
 * Used for converting directional offsets between local and world space.
 *
 * @param {Mat4} m
 *        A 4x4 matrix in column-major order.
 * @param {Vec3} v
 *        Direction vector to transform.
 * @returns {Vec3}
 *          The rotated direction vector.
 */
const applyDirection = (m, v) => {
    const x = v.x ?? 0;
    const y = v.y ?? 0;
    const z = v.z ?? 0;

    return {
        x: m[0] * x + m[4] * y + m[8] * z,
        y: m[1] * x + m[5] * y + m[9] * z,
        z: m[2] * x + m[6] * y + m[10] * z,
    };
};

/**
 * Builds a 4x4 rotation matrix from Euler angles (in degrees).
 *
 * Rotation order matches CSS transform order:
 *   1. rotateZ
 *   2. rotateY
 *   3. rotateX
 *
 * @param {Vec3} rotationDeg
 *        Rotation angles in degrees.
 * @returns {Mat4}
 *          A 4x4 matrix in column-major order.
 */
const buildRotationMatrix = rotationDeg => {
    const rx = degToRad(rotationDeg.x ?? 0);
    const ry = degToRad(rotationDeg.y ?? 0);
    const rz = degToRad(rotationDeg.z ?? 0);

    let m = mat4Identity();

    // match CSS rotation order: Rz * Ry * Rx
    m = mat4Mul(m, mat4RotateZ(rz));
    m = mat4Mul(m, mat4RotateY(ry));
    m = mat4Mul(m, mat4RotateX(rx));

    return m;
};

/**
 * Convert a column-major 4x4 matrix to a CSS matrix3d(...) string.
 * @param {Mat4} m
 * @returns {String}
 */
const mat4ToCssMatrix3d = m => `matrix3d(${m.join(",")})`;

/**
 * Convert a 4x4 rotation matrix into Euler angles (degrees).
 *
 * Assumptions:
 * - m is column-major (CSS matrix3d style), length 16
 * - rotation only (no scale/shear)
 * - order "XYZ" means R = Rx * Ry * Rz
 *   This matches CSS: rotateX(...) rotateY(...) rotateZ(...)
 *   because CSS applies transforms right-to-left.
 *
 * @param {Mat4} m 4x4 matrix (column-major)
 * @returns {Vec3} Euler angles in degrees
 */
const mat4ToEulerDeg = m => {
    // 3x3 rotation part (column-major)
    const m11 = m[0], m12 = m[4], m13 = m[8];
    const m21 = m[1], m22 = m[5], m23 = m[9];
    const m31 = m[2], m32 = m[6], m33 = m[10];


    // Order "XYZ" (R = Rx * Ry * Rz)
    // y from m13
    const y = Math.asin(clamp(m13, -1, 1));

    let x, z;
    const EPS = 1e-6;

    if (Math.abs(m13) < 1 - EPS) {
        x = Math.atan2(-m23, m33);
        z = Math.atan2(-m12, m11);
    } else {
        // Gimbal lock
        x = Math.atan2(m32, m22);
        z = 0;
    }

    return {
        x: radToDeg(x),
        y: radToDeg(y),
        z: radToDeg(z),
    };
};


/**
 * Builds a rotation matrix that aligns a chosen local forward axis
 * with the given direction vector.
 *
 * Conventions:
 * - World is Z-up by default
 * - The returned matrix is row-major
 * - Local basis vectors are stored as rows
 *
 * The function guarantees that:
 *   applyDirection(mat, localForwardVector) ≈ normalize(dir)
 *
 * @param {Vec3} dir
 *   Target direction in world space.
 *
 * @param {ILookRotationOptions} [opt]
 *   Configuration for forward axis and up vector.
 *
 * @returns {Mat4}
 *   4x4 rotation matrix in column-major order.
 */
const buildLookRotation = (
    dir,
    {
        forwardAxis = "y",
        up = {x: 0, y: 0, z: 1}
    } = {}
) => {
    // Normalize target direction
    const f = normalize(dir);

    // Normalize world up vector
    let upN = normalize(up);

    // Handle degenerate case where direction is almost parallel to up
    if (Math.abs(dot(f, upN)) > 0.999) {
        upN = {x: 1, y: 0, z: 0};
    }

    // Build orthonormal basis
    const r = normalize(cross(upN, f)); // right
    const u = cross(f, r);              // true up

    // Default mapping:
    // local +Y = forward
    // local +Z = up
    let xAxis = r;
    let yAxis = f;
    let zAxis = u;

    // Remap basis depending on chosen forward axis
    if (forwardAxis === "x") {
        xAxis = f;
        yAxis = u;
        zAxis = r;
    }

    if (forwardAxis === "z") {
        xAxis = r;
        yAxis = u;
        zAxis = f;
    }

    return [
        xAxis.x, xAxis.y, xAxis.z, 0,
        yAxis.x, yAxis.y, yAxis.z, 0,
        zAxis.x, zAxis.y, zAxis.z, 0,
        0, 0, 0, 1
    ];
};


/**
 * Extracts local axis vectors from a column-major rotation matrix.
 *
 * Result:
 * - xAxis: local +X in world space
 * - yAxis: local +Y in world space
 * - zAxis: local +Z in world space
 *
 * Useful for:
 * - Projecting world points into local space
 * - world → local conversions via dot products
 *
 * @param {Mat4} m
 *        4x4 rotation matrix (column-major)
 */
const axisFromMatCols = m => ({
    xAxis: {x: m[0], y: m[1], z: m[2]},
    yAxis: {x: m[4], y: m[5], z: m[6]},
    zAxis: {x: m[8], y: m[9], z: m[10]},
});


/**
 * @param {Object3DType} planeObj
 * @returns {Vec3}
 */
const normalFromObject = (planeObj) => {
    const {zAxis} = axisFromMatCols(planeObj.getRotationMat());
    return normalize(zAxis);
};

/**
 * transforms a point from child local into parent local space
 * using child's TRS (relative to parent)
 *
 * @param {Vec3} pLocal
 * @param {Object3DType} child
 * @returns {Vec3}
 */
const pointChildToParentLocal = (pLocal, child) => {
    const pos = child.getPosition();
    const {xAxis, yAxis, zAxis} = axisFromMatCols(child.getRotationMat());

    const s = child.getScale ? child.getScale() : {x: 1, y: 1, z: 1};

    const px = pLocal.x * s.x;
    const py = pLocal.y * s.y;
    const pz = pLocal.z * s.z;

    return add(
        pos,
        add(
            add(mul(xAxis, px), mul(yAxis, py)),
            mul(zAxis, pz)
        )
    );
};