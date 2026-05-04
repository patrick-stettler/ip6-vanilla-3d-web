/**
 * Unique identification for renderable objects.
 * Useful for keys, lookups, logging.
 * @typedef IIdentifiable
 * @property {String} id   Unique object ID, for example a UUID.
 * @property {String} type Object type name, for example "box".
 */

/**
 * Rotation capability, absolute and relative.
 * Angles are degrees, axes follow your Vec3 convention.
 * @typedef IRotatable
 * @property {() => Vec3} getRotation Current rotation in degrees, axes follow CSS 3D.
 * @property {() => Mat4} getRotationMat Current rotation matrix
 * @property {(rot: Partial<Vec3>) => void} setRotation Sets absolute rotation, only provided components are changed.
 * @property {(rot: Mat4) => void} setRotationMat Sets absolute rotation.
 * @property {(p: Vec3, opt?: ILookRotationOptions) => void} lookAt
 * @property {(p: Vec3, opt?: ILookRotationOptions) => void} lookAwayFrom
 * @property {(dr: Partial<Vec3>) => void} rotateBy Rotates relative to the current rotation.
 * @property {(dr: Partial<Vec3>) => void} rotateByWorld Rotates relative to the current rotation.
 * @property {(cb: ValueChangeCallback<Mat4>) => void} onRotationChange
 * @example
 * obj.setRotation({ x: 0, y: 45 });
 * obj.rotateBy({ y: 15 });
 */

/**
 * @typedef {"x" | "y" | "z"} ForwardAxis
 */

/**
 * Options for building a look-at rotation matrix.
 *
 * @typedef ILookRotationOptions
 * @property {ForwardAxis} [forwardAxis="y"]
 *   Local axis that should point towards the target direction.
 *   Use "y" if the object looks forward along +Y,
 *   or "z" if the object looks forward along +Z, etc.
 *
 * @property {Vec3} [up={x:0,y:0,z:1}]
 *   World up vector. In your system this is typically Z-up.
 */

/**
 * 3D positioning capability.
 * Position uses your Vec3 convention, x right, y toward the viewer, z up.
 * @typedef IScalable
 * @property {() => Vec3} getScale Current scale in logical units.
 * @property {(scale: LogicalUnit | Partial<Vec3>) => void} setScale Sets scale, only provided components are changed.
 * @property {(cb: ValueChangeCallback<Vec3>) => void} onScaleChange
 * @example
 * obj.setScale(2);
 * obj.setScale({ x: 2, y: 2, z: 2 });
 */

/**
 * 2D positioning capability.
 * Useful for purely planar objects, UI overlays, or top view layers.
 * @typedef IPositionable2D
 * @property {() => Vec2} getPosition2D Current 2D position in logical units.
 * @property {(pos: Partial<Vec2>) => void} setOrigin Set absolute 2D position.
 * @property {(dp: Partial<Vec2>) => void} translateOriginBy Move relative to the current 2D position.
 * @property {(cb: ValueChangeCallback<Vec2>) => void} onOriginPosChange
 * @example
 * scene.setOrigin({ x: 100 });
 * scene.translateOriginBy({ y: 24 });
 */

/**
 * 3D positioning capability.
 * Position uses your Vec3 convention, x right, y toward the viewer, z up.
 * @typedef IPositionable
 * @property {() => Vec3} getPosition Current position in logical units.
 * @property {(pos: Partial<Vec3>) => void} setPosition Sets absolute position.
 * @property {(dp: Partial<Vec3>) => void} translateBy Moves relative to the current position.
 * @property {(cb: ValueChangeCallback<Vec3>) => void} onPositionChange
 * @example
 * obj.setPosition({ x: 10, z: -5 });
 * obj.translateBy({ y: 1 });
 */

/**
 * Dimension capability
 * @template _T_
 * @typedef IDimensionable
 * @property {() => _T_} getDimensions Logical dimensions that affect layout and rendering.
 * @property {(dimensions: Partial<_T_>) => void} setDimensions Sets dimensions, only provided fields are changed.
 * @property {(cb: ValueChangeCallback<_T_>) => void} onDimensionsChange
 */

/**
 * Container for child objects.
 * Children must implement Base3DObject or a compatible subset with an element.
 * @typedef IChildContainer
 * @property {(child: Object3DType) => void} addObject Appends a child to the container.
 * @property {(child: Object3DType) => void} removeObject Removes a child from the container.
 * @example
 * container.addObject(child);
 */

/**
 * Axis helper, can be toggled on.
 * @typedef IAxisHelper
 * @property {(config?: AxisHelperConfigType) => void} showAxisHelper Shows X, Y, Z axes, config is optional.
 */

/**
 * Binding to a DOM root element.
 * All styles and transforms are applied to this element.
 * @typedef IDomBound
 * @property {HTMLElement} element Root DOM element.
 */

/**
 * User controllable viewport, combines zoom and input handling.
 * @typedef IControllable
 * @property {() => Number} getZoom Current zoom factor, 1 means 100 percent.
 * @property {(next:Number, opts?: IZoomOptions) => void} setZoom Set zoom, optional anchor and clamping.
 * @property {(cb: ValueChangeCallback<Number>) => void} onZoomChange
 * @property {(opts?: IControlsOptions) => void} addControls Enable user controls for mouse and touch.
 * @property {() => void} removeControls Disable user controls and detach handlers.
 * @example
 * // enable default controls
 * scene.addControls({ zoomSpeed: 0.002, panSpeed: 1.2 });
 */

/**
 * Optional options for setZoom.
 *
 * clamp controls whether the zoom value is restricted to the given range.
 * When clamp is true, the resulting zoom is limited to [min, max].
 *
 * anchor defines the point to zoom toward,
 * for example the current pointer or touch position.
 *
 * @typedef IZoomOptions
 * @property {Vec2}    [anchor]  Point in screen or world space to zoom toward
 * @property {Number}  [min]     Minimum allowed zoom value
 * @property {Number}  [max]     Maximum allowed zoom value
 * @property {Boolean} [clamp]   Whether to clamp zoom to [min, max]
 */

/**
 * Options for enabling user controls.
 *
 * @typedef IControlsOptions
 * @property {Number}  [zoomSpeed=0.0015]  Multiplier applied to wheel or pinch delta
 * @property {Number}  [panSpeed=1]        Converts pointer delta to world units
 * @property {Boolean} [wheelToZoom=true]  Enable zooming via mouse wheel
 * @property {Boolean} [pinchToZoom=true]  Enable zooming via touch pinch
 * @property {Boolean} [dragToPan=true]    Enable panning via drag
 * @property {Number}  [minZoom=0.5]       Minimum allowed zoom
 * @property {Number}  [maxZoom=4]         Maximum allowed zoom
 */

/**
 * Optional configuration controlling visual helpers and lifecycle hooks.
 * @typedef IHandleDragOptions
 *
 * @property {Boolean} [showAxisDragHelper]
 * If enabled, displays a thin axis-aligned helper geometry indicating
 * the active drag direction.
 *
 * @property {Boolean} [showPlaneDragHelper]
 * If enabled, displays a helper plane representing the drag constraint.
 * The plane itself may be visually hidden and used only as a reference.
 *
 * @property {Dim2} [planeDragHelperSize]
 * Optional dimensions for the plane drag helper. Overrides the default
 * width and depth used for visualization.
 *
 * @property {(e: PointerEvent) => void} [onDragStart]
 * Optional callback invoked when the drag interaction begins.
 *
 * @property {(e: PointerEvent) => void} [onDragEnd]
 * Optional callback invoked when the drag interaction ends.
 */


/**
 * @typedef IThrowShadow
 * @property {() => Vec3[]}  getShadowCorners  Relevant points to throw a shadow
 */