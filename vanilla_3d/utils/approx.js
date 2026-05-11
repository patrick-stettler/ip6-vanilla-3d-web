export {
    approx,
    vecApprox
}

/**
 * Default epsilon used for approximate floating point comparisons.
 * Chosen small enough for typical 3D math (matrices, trig, transforms).
 *
 * @type {Number}
 */
const EPS = 1e-10;

/**
 * Checks whether two numbers are approximately equal.
 *
 * Useful for floating point comparisons where exact equality
 * is unreliable due to rounding errors.
 *
 * @param {Number} a - First value.
 * @param {Number} b - Second value.
 * @returns {Boolean} True if |a - b| <= EPS.
 *
 * @example
 * approx(0.1 + 0.2, 0.3); // true
 */
const approx = (a, b) => Math.abs(a - b) <= EPS;

/**
 * Checks whether two Vec3-like objects are approximately equal.
 *
 * Each component is compared using an absolute epsilon.
 *
 * @param {Vec3} a - First vector.
 * @param {Vec3} b - Second vector.
 * @param {Number} [eps=EPS] - Allowed absolute error per component.
 * @returns {Boolean} True if all components differ by less than eps.
 *
 * @example
 * vecApprox({x:1,y:2,z:3}, {x:1.0000000001,y:2,z:3});
 */
const vecApprox = (a, b, eps = EPS) =>
    Math.abs(a.x - b.x) < eps &&
    Math.abs(a.y - b.y) < eps &&
    Math.abs(a.z - b.z) < eps;