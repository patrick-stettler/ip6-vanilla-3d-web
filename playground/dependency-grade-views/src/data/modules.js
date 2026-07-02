export { CUBE_SIZE, CUBE_GAP, PADDING, GROUP_GAP, GROUP_DEPTH, GROUND_Z, STATE_COLORS, groups, groupWidth };

/**
 * @typedef {Object} ModuleDataType
 * @property {!string}   id           - unique identifier. Mandatory.
 * @property {!string}   name         - display name. Mandatory.
 * @property {!string}   color        - state color (hex) from the shared STATE_COLORS palette. Mandatory.
 * @property {!string[]} vorbedingung - IDs of prerequisite modules (empty if none). Mandatory.
 * @property {?number}   note         - grade on the 1-6 scale, or null while ongoing/not started. Mandatory.
 */

/**
 * @typedef {Object} GroupDataType
 * @property {!string}           id      - unique identifier. Mandatory.
 * @property {!string}           name    - display label. Mandatory.
 * @property {!ModuleDataType[]} modules - modules belonging to this group. Mandatory.
 */

/** @type {number} */
const CUBE_SIZE = 2;

/** @type {number} */
const CUBE_GAP = 0.4;

/** @type {number} */
const PADDING = 0.5;

/** @type {number} */
const GROUP_GAP = 1.0;

/** @type {number} */
const GROUP_DEPTH = CUBE_SIZE + PADDING * 2;

/** @type {number} */
const GROUND_Z = CUBE_SIZE / 2;

/**
 * Returns the total ground-plane width for a group with the given module count.
 * @param  {!number} moduleCount - number of modules in the group. Mandatory.
 * @return {number}
 */
function groupWidth(moduleCount) {
  return moduleCount * CUBE_SIZE + (moduleCount - 1) * CUBE_GAP + PADDING * 2;
}

/**
 * State colors matching the topdown-demo palette exactly.
 * Color encodes module state, not group membership.
 * @type {{ dark: string, blue: string, orange: string, red: string, green: string }}
 */
const STATE_COLORS = {
  dark:   '#292929'
, blue:   '#2F50BF'
, orange: '#B38337'
, red:    '#A91E1E'
, green:  '#5BA35B'
};

const C = STATE_COLORS;

/** @type {GroupDataType[]} */
const groups = [
  { id: 'kontext'
  , name: 'Kontext'
  , modules: [
      { id: 'geo',   name: 'GEO',   color: C.green, vorbedingung: [],  note: 5.2 }
    , { id: 'wir',   name: 'WIR',   color: C.green, vorbedingung: [],  note: 4.8 }
    , { id: 'recht', name: 'Recht', color: C.blue,  vorbedingung: [],  note: null }
    ]
  }
, { id: 'design'
  , name: 'Design'
  , modules: [
      { id: 'iad', name: 'IAD', color: C.green, vorbedingung: [],      note: 5.5 }
    , { id: 'vd',  name: 'VD',  color: C.dark,  vorbedingung: ['iad'], note: null }
    ]
  }
, { id: 'praxis'
  , name: 'Praxis'
  , modules: [
      { id: 'projekt', name: 'Projekt', color: C.green, vorbedingung: [],          note: 4.6 }
    , { id: 'prakt',   name: 'Prakt.',  color: C.blue,  vorbedingung: ['projekt'], note: null }
    , { id: 'thesis',  name: 'Thesis',  color: C.green, vorbedingung: ['prakt'],   note: 4.2 }
    ]
  }
, { id: 'mathematik'
  , name: 'Mathematik'
  , modules: [
      { id: 'ana',    name: 'Analysis',  color: C.green,  vorbedingung: [],               note: 4.5 }
    , { id: 'linalg', name: 'Lin Alg',   color: C.green,  vorbedingung: ['ana'],           note: 4.4 }
    , { id: 'stat',   name: 'Statistik', color: C.blue,   vorbedingung: ['ana', 'linalg'], note: null }
    , { id: 'disk',   name: 'Diskrete',  color: C.orange, vorbedingung: ['ana'],           note: 3.2 }
    ]
  }
, { id: 'informatik'
  , name: 'Informatik'
  , modules: [
      { id: 'prog1', name: 'Prog 1', color: C.green, vorbedingung: [],               note: 5.8 }
    , { id: 'prog2', name: 'Prog 2', color: C.green, vorbedingung: ['prog1'],         note: 4.9 }
    , { id: 'db',    name: 'DB',     color: C.blue,  vorbedingung: ['prog1'],         note: null }
    , { id: 'netz',  name: 'Netz',   color: C.green, vorbedingung: [],               note: 4.6 }
    , { id: 'algo',  name: 'Algo',   color: C.green, vorbedingung: ['prog2', 'disk'], note: 5.3 }
    , { id: 'ml',    name: 'ML',     color: C.green, vorbedingung: ['algo'],          note: 6.0 }
    ]
  }
, { id: 'management'
  , name: 'Management'
  , modules: [
      { id: 'bwl',   name: 'BWL',      color: C.green, vorbedingung: [],      note: 4.7 }
    , { id: 'pm',    name: 'ProjMgmt', color: C.orange, vorbedingung: ['bwl'], note: 3.9 }
    , { id: 'qm',    name: 'QM',       color: C.red,    vorbedingung: ['pm'],  note: 3.3 }
    , { id: 'ethik', name: 'Ethik',    color: C.red,    vorbedingung: [],      note: 1.0 }
    ]
  }
];
