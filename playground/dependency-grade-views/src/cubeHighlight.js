export { DIMMED_CLASS, HIGHLIGHTED_CLASS, setCubeClass };

/** @type {string} */
const DIMMED_CLASS = 'cube--dimmed';

/** @type {string} */
const HIGHLIGHTED_CLASS = 'cube--highlighted';

/**
 * Toggles a CSS class on every face of a cube.
 * Applying opacity/filter to the box root would flatten its
 * preserve-3d faces, so the class is set on each face plane instead.
 * Shared by the DependencyController and the GradeScaleController, so both
 * views dim/highlight cubes the exact same way.
 * @param  {!BoxType} box       - the cube to style. Mandatory.
 * @param  {!string}  className - the CSS class to toggle. Mandatory.
 * @param  {!boolean} enabled   - whether the class should be present. Mandatory.
 */
function setCubeClass(box, className, enabled) {
  Object.values(box.faces).forEach(function(face) {
    face.element.classList.toggle(className, enabled);
  });
}
