export {
    clamp
}

/**
 * Clamps a numeric value to an inclusive range.
 *
 * @param {Number} v   - The value to clamp.
 * @param {Number} lo  - Lower bound of the range.
 * @param {Number} hi  - Upper bound of the range.
 * @returns {Number} The clamped value, guaranteed to be between lo and hi.
 *
 * @example
 * clamp(5, 0, 10);   // 5
 * clamp(-3, 0, 10);  // 0
 * clamp(42, 0, 10);  // 10
 */
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));