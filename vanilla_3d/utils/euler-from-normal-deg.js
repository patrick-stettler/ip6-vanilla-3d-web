export {
    radToDeg,
    degToRad,
    eulerFromNormalDeg
}

/**
 * Converts radians to degrees.
 *
 * @param {Number} r - Angle in radians
 * @returns {Number} Angle in degrees
 */
const radToDeg = r => r * 180 / Math.PI;

/**
 * Converts degrees to radians.
 *
 * @param {Number} d - Angle in degrees
 * @returns {Number} Angle in radians
 */
const degToRad = d => d * Math.PI / 180;

/**
 * Builds a 4x4 rotation matrix from an axis angle representation.
 * Output is Mat4 in column major order.
 *
 * Uses Rodrigues rotation formula for the upper left 3x3,
 * remaining parts form an identity transform.
 *
 * @param {Number} ax X component of rotation axis
 * @param {Number} ay Y component of rotation axis
 * @param {Number} az Z component of rotation axis
 * @param {Number} angleRad Rotation angle in radians
 * @returns {Mat4} 4x4 rotation matrix (column major)
 */
const axisAngleToMat4 = (ax, ay, az, angleRad) => {
    const n = Math.hypot(ax, ay, az) || 1;
    const x = ax / n;
    const y = ay / n;
    const z = az / n;

    const c = Math.cos(angleRad);
    const s = Math.sin(angleRad);
    const t = 1 - c;

    const r00 = t * x * x + c;
    const r01 = t * x * y - s * z;
    const r02 = t * x * z + s * y;

    const r10 = t * x * y + s * z;
    const r11 = t * y * y + c;
    const r12 = t * y * z - s * x;

    const r20 = t * x * z - s * y;
    const r21 = t * y * z + s * x;
    const r22 = t * z * z + c;

    /** @type {Mat4} */
    return [
        r00, r10, r20, 0,
        r01, r11, r21, 0,
        r02, r12, r22, 0,
        0,   0,   0,   1
    ];
};


/**
 * Extracts Euler angles (degrees) from a column major Mat4,
 * using a convention compatible with CSS rotateX, rotateY, rotateZ.
 *
 * Rotation order:
 * rotateX, then rotateY, then rotateZ
 *
 * @param {Mat4} M 4x4 rotation matrix (column major)
 * @returns {Vec3} Euler angles in degrees
 */
const eulerFromMat4CSS = M => {
    const r00 = M[0];
    const r10 = M[1];
    const r20 = M[2];

    const r21 = M[6];
    const r22 = M[10];

    const ry = Math.atan2(-r20, Math.hypot(r00, r10));
    const rx = Math.atan2(r21, r22);
    const rz = Math.atan2(r10, r00);

    return { x: radToDeg(rx), y: radToDeg(ry), z: radToDeg(rz) };
};

/**
 * Computes Euler rotation angles (degrees) from a surface normal vector.
 *
 * Aligns local +Z with the given normal, angles intended for CSS transforms.
 *
 * @param {Number} nx X component of the normal
 * @param {Number} ny Y component of the normal
 * @param {Number} nz Z component of the normal
 * @returns {Vec3} Euler angles in degrees
 */
const eulerFromNormalDeg = (nx, ny, nz) => {
    // Rotation axis = normal × (0,0,1)
    let ax = -ny;
    let ay = nx;
    let az = 0;

    const axisLen = Math.hypot(ax, ay, az);
    if (axisLen < 1e-8) {
        // Normal is parallel to Z, choose a stable fallback axis
        ax = 1;
        ay = 0;
        az = 0;
    }

    // Clamp nz to avoid NaN from acos
    const nzClamped = Math.max(-1, Math.min(1, nz));
    const angle = Math.acos(nzClamped);

    const R = axisAngleToMat4(ax, ay, az, angle);
    return eulerFromMat4CSS(R);
};