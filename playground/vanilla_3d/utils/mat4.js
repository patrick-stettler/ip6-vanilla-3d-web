export {
    mat4Identity,
    mat4Mul,
    mat4Translate,
    mat4Scale,
    mat4RotateX,
    mat4RotateY,
    mat4RotateZ,
    mat4Invert,
    applyMat4
}

/**
 * Creates a 4x4 identity matrix.
 *
 * @returns {Mat4} Identity matrix
 */
const mat4Identity = () => [
    1, 0, 0, 0,
    0, 1, 0, 0,
    0, 0, 1, 0,
    0, 0, 0, 1
];


/**
 * Multiplies two 4x4 matrices.
 *
 * The multiplication follows standard linear algebra rules:
 * result = a · b
 *
 * @param {Mat4} a - Left-hand matrix
 * @param {Mat4} b - Right-hand matrix
 * @returns {Mat4} Resulting matrix
 */
const mat4Mul = (a, b) => {
    const o = new Array(16).fill(0);
    for (let r = 0; r < 4; r++) {
        for (let c = 0; c < 4; c++) {
            for (let k = 0; k < 4; k++) {
                o[r * 4 + c] += a[r * 4 + k] * b[k * 4 + c];
            }
        }
    }
    return o;
};

/**
 * Creates a translation matrix.
 *
 * @param {Number} tx - Translation in x direction
 * @param {Number} ty - Translation in y direction
 * @param {Number} tz - Translation in z direction
 * @returns {Mat4} Translation matrix
 */
const mat4Translate = (tx, ty, tz) => [
    1, 0, 0, 0,
    0, 1, 0, 0,
    0, 0, 1, 0,
    tx, ty, tz, 1,
];

/**
 * Creates a scaling matrix.
 *
 * @param {Number} sx - Scale factor in x direction
 * @param {Number} sy - Scale factor in y direction
 * @param {Number} sz - Scale factor in z direction
 * @returns {Mat4} Scaling matrix
 */
const mat4Scale = (sx, sy, sz) => [
    sx, 0, 0, 0,
    0, sy, 0, 0,
    0, 0, sz, 0,
    0, 0, 0, 1,
];

/**
 * Creates a rotation matrix around the X axis.
 *
 * @param {Number} rad - Rotation angle in radians
 * @returns {Mat4} Rotation matrix
 */
const mat4RotateX = rad => {
    const c = Math.cos(rad), s = Math.sin(rad);
    return [
        1, 0, 0, 0,
        0, c, s, 0,
        0, -s, c, 0,
        0, 0, 0, 1,
    ];
};

/**
 * Creates a rotation matrix around the Y axis.
 *
 * @param {Number} rad - Rotation angle in radians
 * @returns {Mat4} Rotation matrix
 */
const mat4RotateY = rad => {
    const c = Math.cos(rad), s = Math.sin(rad);
    return [
        c, 0, -s, 0,
        0, 1, 0, 0,
        s, 0, c, 0,
        0, 0, 0, 1,
    ];
};

/**
 * Creates a rotation matrix around the Z axis.
 *
 * @param {Number} rad - Rotation angle in radians
 * @returns {Mat4} Rotation matrix
 */
const mat4RotateZ = rad => {
    const c = Math.cos(rad), s = Math.sin(rad);
    return [
        c, s, 0, 0,
        -s, c, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1,
    ];
};

/**
 * Inverts a 4x4 matrix using Gauss-Jordan elimination.
 *
 * If the matrix is singular, null is returned.
 *
 * @param {Mat4} m - Matrix to invert
 * @returns {Mat4 | null} Inverted matrix or null if not invertible
 */
const mat4Invert = m => {
    const a = m.slice();
    const inv = [
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1
    ];

    const n = 4;

    for (let i = 0; i < n; i++) {
        let pivotRow = i;
        let max = Math.abs(a[i * 4 + i]);
        for (let r = i + 1; r < n; r++) {
            const v = Math.abs(a[r * 4 + i]);
            if (v > max) {
                max = v;
                pivotRow = r;
            }
        }

        if (max < 1e-12) {
            return null;
        }

        if (pivotRow !== i) {
            for (let c = 0; c < n; c++) {
                const idx1 = i * 4 + c;
                const idx2 = pivotRow * 4 + c;
                const tmpA = a[idx1];
                a[idx1] = a[idx2];
                a[idx2] = tmpA;

                const tmpInv = inv[idx1];
                inv[idx1] = inv[idx2];
                inv[idx2] = tmpInv;
            }
        }

        const pivot = a[i * 4 + i];
        const invPivot = 1 / pivot;

        for (let c = 0; c < n; c++) {
            a[i * 4 + c] *= invPivot;
            inv[i * 4 + c] *= invPivot;
        }

        for (let r = 0; r < n; r++) {
            if (r === i) continue;
            const factor = a[r * 4 + i];
            if (factor === 0) continue;

            for (let c = 0; c < n; c++) {
                a[r * 4 + c] -= factor * a[i * 4 + c];
                inv[r * 4 + c] -= factor * inv[i * 4 + c];
            }
        }
    }

    return inv;
};

/**
 * Applies a 4x4 matrix to a 3D vector using homogeneous coordinates.
 *
 * The input vector is treated as (x, y, z, 1).
 *
 * @param {Mat4} m - Transformation matrix
 * @param {Vec3} v - Vector to transform
 * @returns {{x:number, y:number, z:number, w:number}} Transformed vector
 */
const applyMat4 = (m, v) => {
    const x = v.x, y = v.y, z = v.z, w = 1;
    return {
        x: m[0] * x + m[4] * y + m[8] * z + m[12] * w,
        y: m[1] * x + m[5] * y + m[9] * z + m[13] * w,
        z: m[2] * x + m[6] * y + m[10] * z + m[14] * w,
        w: m[3] * x + m[7] * y + m[11] * z + m[15] * w,
    };
};