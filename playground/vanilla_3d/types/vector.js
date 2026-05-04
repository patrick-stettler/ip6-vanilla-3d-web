/**
 * 2D vector in a screen-like coordinate system.
 * @typedef Vec2
 * @property {LogicalUnit} x X coordinate.
 * @property {LogicalUnit} y Y coordinate.
 */

/**
 * 3D vector in your scene coordinate system:
 * X to the right, Y toward the viewer, Z up.
 * @typedef Vec3
 * @property {LogicalUnit} x X axis, right is positive.
 * @property {LogicalUnit} y Y axis, toward the viewer is positive.
 * @property {LogicalUnit} z Z axis, up is positive.
 * @example
 * // origin:
 * const o = ({ x: 0, y: 0, z: 0 });
 *
 * // 1 unit up:
 * const up = ({ x: 0, y: 0, z: 1 });
 *
 * // 2 units toward the viewer
 * const forward = ({ x: 0, y: 2, z: 0 });
 *
 * // 3 units right
 * const right = ({ x: 3, y: 0, z: 0 });
 */