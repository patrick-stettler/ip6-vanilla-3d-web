/**
 * 2D dimensions, lengths not positions.
 * Width maps to the X axis, depth maps to the Y axis in your system
 * where Y points toward the viewer. Values should be non-negative.
 * @typedef Dim2
 * @property {LogicalUnit} width  Extent along X.
 * @property {LogicalUnit} depth  Extent along Y, toward the viewer.
 * @example
 * // a rectangle 10 by 6
 * const d2 = ({ width: 10, depth: 6 });
 */

/**
 * 3D dimensions, lengths not positions.
 * Width maps to X, depth maps to Y toward the viewer, height maps to Z up.
 * Values should be non-negative.
 * @typedef Dim3
 * @property {LogicalUnit} width   Extent along X.
 * @property {LogicalUnit} depth   Extent along Y, toward the viewer.
 * @property {LogicalUnit} height  Extent along Z, up.
 * @example
 * // box 2 by 3 by 1
 * const d3 = ({ width: 2, depth: 3, height: 1 });
 */

/**
 * Dimensions of a sphere
 * Value should be non-negative.
 * @typedef SphereDimensions
 * @property {LogicalUnit} radius   Radius of the sphere.
 * @example
 * // sphere with radius 2
 * const s = ({ radius: 2 });
 */

/**
 * Dimensions of a cylinder.
 * Values should be non-negative.
 * @typedef CylinderDimensions
 * @property {LogicalUnit} radius  Radius of the cylinder.
 * @property {LogicalUnit} height  Height along Z (up).
 * @example
 * // cylinder: r=0.5, h=1.2
 * const c = ({ radius: 0.5, height: 1.2 });
 */

/**
 * Dimensions of a tetrahedron.
 * Values should be non-negative.
 * @typedef TetraDimensions
 * @property {LogicalUnit} a
 * @example
 * TBD
 */