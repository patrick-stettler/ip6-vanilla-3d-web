import { CUBE_SIZE } from './data/modules.js';

export { createDependencyController };

/**
 * @typedef {Object} CubeEntryType
 * @property {BoxType}        box  - the 3D box object.
 * @property {ModuleDataType} data - the associated module data.
 */

/**
 * @typedef {Object} DependencyControllerType
 * @property {function(!string): void} handleClick - activate or deactivate a module by id.
 * @property {function(): void}        reset       - lower all cubes and remove all lines.
 */

/** @type {number} */
const LEVEL_HEIGHT = 4;

/** @type {number} */
const GROUND_Z = CUBE_SIZE / 2;

/** @type {string} */
const DIMMED_CLASS = 'cube--dimmed';

/** @type {string} */
const HIGHLIGHTED_CLASS = 'cube--highlighted';

/**
 * Toggles a CSS class on every face of a cube.
 * Applying opacity/filter to the box root would flatten its
 * preserve-3d faces, so the class is set on each face plane instead.
 * @param  {!BoxType} box       - the cube to style. Mandatory.
 * @param  {!string}  className - the CSS class to toggle. Mandatory.
 * @param  {!boolean} enabled   - whether the class should be present. Mandatory.
 */
function setCubeClass(box, className, enabled) {
  Object.values(box.faces).forEach(function(face) {
    face.element.classList.toggle(className, enabled);
  });
}

/**
 * Manages the dependency visualisation: recursive level computation, cube lifting,
 * and SVG bezier connector lines.
 * @param  {{ cubeMap: Map<string, CubeEntryType>, svgOverlay: SVGElement, scene3d: Scene3DType }} config
 * @return {DependencyControllerType}
 */
function createDependencyController({ cubeMap, svgOverlay, scene3d }) {

  /** @type {string|null} */
  let activeId = null;

  /** @type {SVGPathElement[]} */
  let activePaths = [];

  /** @type {Array<{fromId: string, toId: string}>} */
  let activeEdges = [];

  /** @type {boolean} */
  let rafPending = false;

  /**
   * Recursively computes the topological level of every module reachable via
   * vorbedingung from startId.
   * @param  {!string} startId
   * @return {Map<string, number>}
   */
  function computeLevels(startId) {
    /** @type {Map<string, number>} */
    const memo = new Map();

    /** @type {Set<string>} */
    const visiting = new Set();

    /**
     * @param  {!string} id
     * @return {number}
     */
    function getLevel(id) {
      if (memo.has(id))     return memo.get(id);
      if (visiting.has(id)) return 0;

      const entry = cubeMap.get(id);
      if (!entry || entry.data.vorbedingung.length === 0) {
        memo.set(id, 0);
        return 0;
      }

      visiting.add(id);

      const maxPrereqLevel = entry.data.vorbedingung.reduce(function(max, pid) {
        return Math.max(max, getLevel(pid));
      }, -1);

      visiting.delete(id);

      const level = maxPrereqLevel + 1;
      memo.set(id, level);
      return level;
    }

    getLevel(startId);
    return memo;
  }

  /**
   * Returns the screen-space center of a DOM element.
   * @param  {!Element} el
   * @return {{ x: number, y: number }}
   */
  function screenCenter(el) {
    const r = el.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
  }

  /**
   * Updates all active path `d` attributes in-place.
   * Reads all rects first (batch), then writes all attributes (batch)
   * to avoid interleaved read/write layout reflows.
   */
  function redrawLines() {
    if (activeEdges.length === 0) return;

    // Batch-read all screen positions first to minimise forced reflows.
    // Anchor on each cube's own center so the connector passes through the cube.
    /** @type {Array<{ a: {x:number,y:number}, b: {x:number,y:number} }>} */
    const positions = activeEdges.map(function(e) {
      return {
        a: screenCenter(cubeMap.get(e.fromId).box.element)
      , b: screenCenter(cubeMap.get(e.toId).box.element)
      };
    });

    // Batch-write: only setAttribute, no DOM insertions or removals.
    for (let i = 0; i < positions.length; i++) {
      const a  = positions[i].a;
      const b  = positions[i].b;
      const dx = (b.x - a.x) * 0.5;
      activePaths[i].setAttribute('d',
        `M ${a.x} ${a.y} C ${a.x + dx} ${a.y}, ${b.x - dx} ${b.y}, ${b.x} ${b.y}`
      );
    }
  }

  /**
   * Schedules a single redraw per animation frame regardless of how many
   * observable events fire between frames.
   */
  function scheduleRedraw() {
    if (rafPending || activeEdges.length === 0) return;
    rafPending = true;
    requestAnimationFrame(function() {
      rafPending = false;
      redrawLines();
    });
  }

  /**
   * Lowers all cubes to ground level and removes all SVG connector lines.
   */
  function reset() {
    cubeMap.forEach(function(entry) {
      entry.box.setPosition({ z: GROUND_Z });
      setCubeClass(entry.box, DIMMED_CLASS, false);
      setCubeClass(entry.box, HIGHLIGHTED_CLASS, false);
    });

    activePaths.forEach(function(p) { svgOverlay.removeChild(p); });
    activePaths = [];
    activeEdges = [];
    activeId    = null;
    rafPending  = false;
  }

  /**
   * Activates the dependency view: lifts cubes and creates SVG paths once.
   * The camera rotation is left untouched so the user's chosen perspective persists.
   * @param {!string} moduleId
   */
  function activate(moduleId) {
    reset();
    activeId = moduleId;

    const levels = computeLevels(moduleId);

    levels.forEach(function(level, id) {
      const entry = cubeMap.get(id);
      if (!entry) return;
      entry.box.setPosition({ z: GROUND_Z + (level + 1) * LEVEL_HEIGHT });
    });

    // Highlight the active module and its prerequisites, dim everything else.
    cubeMap.forEach(function(entry, id) {
      const isRelated = levels.has(id);
      setCubeClass(entry.box, HIGHLIGHTED_CLASS, isRelated);
      setCubeClass(entry.box, DIMMED_CLASS, !isRelated);
    });

    activeEdges = [];
    levels.forEach(function(_, id) {
      const entry = cubeMap.get(id);
      if (!entry) return;
      entry.data.vorbedingung.forEach(function(prereqId) {
        if (levels.has(prereqId)) {
          activeEdges.push({ fromId: prereqId, toId: id });
        }
      });
    });

    // Create path elements once — redraws only update their `d` attribute.
    activePaths = activeEdges.map(function() {
      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.classList.add('connector-path');
      svgOverlay.appendChild(path);
      return path;
    });

    requestAnimationFrame(redrawLines);
  }

  /**
   * @param {!string} moduleId
   */
  function handleClick(moduleId) {
    if (moduleId === activeId) reset();
    else activate(moduleId);
  }

  // Use scheduleRedraw so at most one redraw fires per animation frame.
  scene3d.onPositionChange(scheduleRedraw);
  scene3d.onZoomChange(scheduleRedraw);
  scene3d.onRotationChange(scheduleRedraw);

  return {
    handleClick: handleClick
  , reset:       reset
  };
}
