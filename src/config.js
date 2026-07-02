/**
 * @module config
 * Central constants used to configure the dependency grade view.
 */

export {
    CUBE_SIZE,
    CUBE_GAP,
    PADDING,
    GROUP_GAP,
    GROUND_Z,
    BASE_PADDING,
    ROTATE_STEP,
    RED_ZONE_FLOOR_OFFSET,
    NOTE_MIN,
    NOTE_PASS,
    NOTE_MAX,
    SCALE_STEP,
    BELOW_GROUND_DEPTH,
    ABOVE_GROUND_HEIGHT,
    GRADE_GAP,
    LEVEL_HEIGHT,
    FRONTAL_PITCH,
    TOP_DOWN_VIEW,
    MIN_ZOOM,
    MAX_ZOOM,
    REPEAT_DELAY,
    REPEAT_INTERVAL,
    DIMMED_CLASS,
    HIGHLIGHTED_CLASS,
    INTERACTIVE_CLASS,
    HIDDEN_CLASS,
    VIEW_TRANSITION_CLASS,
    VIEW_TRANSITION_MS
};

/********************************************************************************************************************************/
/***** Würfel *******************************************************************************************************************/
/********************************************************************************************************************************/

/**
 * Edge length of one module cube in logical 3D units.
 * @type { number }
 */
const CUBE_SIZE = 2;

/**
 * Horizontal gap between neighbouring cubes in one group.
 * @type { number }
 */
const CUBE_GAP = 0.4;

/**
 * Inner padding around cubes on each group plane.
 * @type { number }
 */
const PADDING = 0.5;

/* Modulgruppen und Layout */

/**
 * Gap between neighbouring module groups.
 * @type { number }
 */
const GROUP_GAP = 1.0;

/**
 * Resting z center position for cubes standing on the base plane.
 * @type { number }
 */
const GROUND_Z = CUBE_SIZE / 2;

/**
 * Extra padding around the complete scene base plane.
 * @type { number }
 */
const BASE_PADDING = 1.5;

/********************************************************************************************************************************/
/***** Kamera und Steuerung *****************************************************************************************************/
/********************************************************************************************************************************/

/**
 * Rotation step in degrees per D-pad repeat event.
 * @type { number }
 */
const ROTATE_STEP = 6;

/**
 * Initial top-down camera view used in dependency mode.
 * @type {{ rotation: { x: number, z: number }, zoom: number }}
 */
const TOP_DOWN_VIEW = { rotation: { x: -90, z: 0 }, zoom: 0.35 };

/**
 * Minimum allowed scene zoom.
 * @type { number }
 */
const MIN_ZOOM = 0.05;

/**
 * Maximum allowed scene zoom.
 * @type { number }
 */
const MAX_ZOOM = 12;

/**
 * Delay before a held D-pad button starts repeating, in milliseconds.
 * @type { number }
 */
const REPEAT_DELAY = 350;

/**
 * Interval between repeated D-pad actions, in milliseconds.
 * @type { number }
 */
const REPEAT_INTERVAL = 50;


/********************************************************************************************************************************/
/***** Notenskala ***************************************************************************************************************/
/********************************************************************************************************************************/

/**
 * Lowest grade rendered on the grade scale.
 * @type { number }
 */
const NOTE_MIN = 1;

/**
 * Passing grade threshold.
 * @type { number }
 */
const NOTE_PASS = 4;

/**
 * Highest grade rendered on the grade scale.
 * @type { number }
 */
const NOTE_MAX = 6;

/**
 * Distance between grade scale tick labels.
 * @type { number }
 */
const SCALE_STEP = 0.5;

/**
 * Maximum depth below the base plane for failed grades.
 * @type { number }
 */
const BELOW_GROUND_DEPTH = 6;

/**
 * Maximum height above the base plane for good grades.
 * @type { number }
 */
const ABOVE_GROUND_HEIGHT = 12;

/**
 * Minimum visual clearance between graded cubes and the base plane.
 * @type { number }
 */
const GRADE_GAP = CUBE_SIZE + PADDING;

/**
 * Offset used to keep red zone floor outlines from z-fighting.
 * @type { number }
 */
const RED_ZONE_FLOOR_OFFSET = 0.01;


/********************************************************************************************************************************/
/***** Abhängigkeiten ***********************************************************************************************************/
/********************************************************************************************************************************/

/**
 * Vertical distance between dependency levels when modules are lifted.
 * @type { number }
 */
const LEVEL_HEIGHT = 4;

/* Ansichten */

/**
 * Camera pitch used in grade mode for a side/front view.
 * @type { number }
 */
const FRONTAL_PITCH = 0;

/**
 * CSS class applied to cube faces that are dimmed.
 * @type { string }
 */
const DIMMED_CLASS = "cube--dimmed";

/**
 * CSS class applied to cube faces that are highlighted.
 * @type { string }
 */
const HIGHLIGHTED_CLASS = "cube--highlighted";

/**
 * CSS class applied to cubes that can be clicked in the current mode.
 * @type { string }
 */
const INTERACTIVE_CLASS = "cube--interactive";

/**
 * CSS class used to hide grade-zone elements.
 * @type { string }
 */
const HIDDEN_CLASS = "grade-zone--hidden";

/**
 * CSS class applied to the scene while switching view mode.
 * @type { string }
 */
const VIEW_TRANSITION_CLASS = "view-transitioning";

/**
 * Duration of the view mode camera transition, in milliseconds.
 * @type { number }
 */
const VIEW_TRANSITION_MS = 700;
