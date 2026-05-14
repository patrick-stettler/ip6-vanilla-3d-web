export { CUBE_SIZE, CUBE_GAP, cubes };

/**
 * @typedef  { Object } CubeData
 * @property { !string } id    - unique identifier. Mandatory.
 * @property { !string } name  - display name. Mandatory.
 * @property { !string } color - hex color string, e.g. '#e05252'. Mandatory.
 */

/** @type { number } */
const CUBE_SIZE = 2;

/** @type { number } */
const CUBE_GAP = 0.4;

/** @type { CubeData[] } */
const cubes = [
  { id: 'a', name: 'Alpha',   color: '#373737' },
  { id: 'b', name: 'Beta',    color: '#3E6BFF' },
  { id: 'c', name: 'Gamma',   color: '#EFAF49' },
  { id: 'd', name: 'Delta',   color: '#E12828' },
  { id: 'e', name: 'Epsilon', color: '#79D979' },
];
