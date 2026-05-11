export {
    normalize,
    cross,
    dot,
    sub,
    add,
    mul,
    scale,
    len,
    centroid3,
    centroidN,
    inverse
}

/**
 * Normalizes a 3D vector to unit length.
 *
 * If the vector has zero length, the zero vector is returned unchanged
 * to avoid division by zero.
 *
 * @param {Vec3} v - Input vector
 * @returns {Vec3} Normalized vector with length 1, or {0,0,0} for zero input
 */
const normalize = v => {
    const l = Math.hypot(v.x, v.y, v.z) || 1;
    return {x: v.x / l, y: v.y / l, z: v.z / l};
};

/**
 * Computes the cross product of two 3D vectors.
 *
 * The resulting vector is orthogonal to both input vectors
 * and follows the right-hand rule.
 *
 * @param {Vec3} a - First vector
 * @param {Vec3} b - Second vector
 * @returns {Vec3} Cross product vector (a × b)
 */
const cross = (a, b) => ({
    x: a.y * b.z - a.z * b.y,
    y: a.z * b.x - a.x * b.z,
    z: a.x * b.y - a.y * b.x
});

/**
 * Computes the dot (scalar) product of two 3D vectors.
 *
 * Common uses are angle computation, projection,
 * and testing orthogonality (dot === 0).
 *
 * @param {Vec3} a - First vector
 * @param {Vec3} b - Second vector
 * @returns {number} Scalar dot product
 */
const dot = (a, b) => a.x * b.x + a.y * b.y + a.z * b.z;

/**
 * Subtracts one 3D vector from another.
 *
 * Computes the vector difference (a − b).
 *
 * @param {Vec3} a
 * Minuend vector.
 *
 * @param {Vec3} b
 * Subtrahend vector.
 *
 * @returns {Vec3}
 * Resulting vector representing a − b.
 */
const sub = (a, b) => ({x: a.x - b.x, y: a.y - b.y, z: a.z - b.z});

/**
 * Adds two 3D vectors.
 *
 * @param {Vec3} a
 * First vector.
 *
 * @param {Vec3} b
 * Second vector.
 *
 * @returns {Vec3}
 * Resulting vector representing a + b.
 */
const add = (a, b) => ({x: a.x + b.x, y: a.y + b.y, z: a.z + b.z});

/**
 * Multiplies a 3D vector by a scalar.
 *
 * This scales the vector uniformly in all directions.
 *
 * @param {Vec3} a
 * Input vector.
 *
 * @param {number} s
 * Scalar multiplier.
 *
 * @returns {Vec3}
 * Scaled vector.
 */
const mul = (a, s) => ({x: a.x * s, y: a.y * s, z: a.z * s});

/**
 * Multiplies a 3D vector by a scalar.
 *
 * This scales the vector uniformly in all directions.
 *
 * @param {Vec3} v
 * Input vector.
 *
 * @param {number} s
 * Scalar multiplier.
 *
 * @returns {Vec3}
 * Scaled vector.
 */
const scale = (v, s) => ({x: v.x * s, y: v.y * s, z: v.z * s});

/**
 * Computes the Euclidean length (magnitude) of a 3D vector.
 *
 * @param {Vec3} v
 * Input vector.
 *
 * @returns {number}
 * Vector length.
 */
const len = v => Math.sqrt(dot(v, v));

/**
 * Computes the centroid of three 3D points.
 *
 * The centroid is the arithmetic mean of the points
 * and represents the geometric center of the triangle.
 *
 * @param {Vec3} p0
 * First point.
 *
 * @param {Vec3} p1
 * Second point.
 *
 * @param {Vec3} p2
 * Third point.
 *
 * @returns {Vec3}
 * Centroid of the triangle.
 */
const centroid3 = (p0, p1, p2) => scale(add(add(p0, p1), p2), 1 / 3);

/**
 * Computes the centroid (arithmetic mean) of N 3D points.
 *
 * @param {Vec3[]} pts
 * @returns {Vec3}
 */
const centroidN = (pts) => {
    if (!pts || pts.length === 0) {
        return {x: 0, y: 0, z: 0};
    }

    let x = 0;
    let y = 0;
    let z = 0;

    for (const p of pts) {
        x += p.x;
        y += p.y;
        z += p.z;
    }

    const n = pts.length;

    return {
        x: x / n,
        y: y / n,
        z: z / n,
    };
};


/**
 * Computes the inverse (negated) vector.
 *
 * This reverses the direction of the vector.
 * It is equivalent to multiplying the vector by -1.
 *
 * Common use cases include flipping normals,
 * reversing directions, or inverting offsets.
 *
 * @param {Vec3} v
 * Input vector.
 *
 * @returns {Vec3}
 * Inverted vector (-v).
 */
const inverse = v => ({
    x: -v.x,
    y: -v.y,
    z: -v.z
});