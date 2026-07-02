import { CUBE_SIZE, CUBE_GAP, GROUP_GAP, GROUP_DEPTH, groupWidth } from '../data/modules.js';

export { layoutGroups };

/**
 * @typedef {Object} CubePlacementType
 * @property {!ModuleDataType} module - the module placed at this position. Mandatory.
 * @property {!number}         x      - world x center position. Mandatory.
 * @property {!number}         y      - world y center position. Mandatory.
 */

/**
 * @typedef {Object} GroupPlacementType
 * @property {!GroupDataType}       group - the group placed at this position. Mandatory.
 * @property {!number}              x     - world x center position. Mandatory.
 * @property {!number}              y     - world y center position. Mandatory.
 * @property {!CubePlacementType[]} cubes - cube placements belonging to this group. Mandatory.
 */

/**
 * @typedef {Object} LayoutType
 * @property {{ width: number, depth: number }} baseSize        - dimensions for the ground plane.
 * @property {!GroupPlacementType[]}            groupPlacements - placement of every group and its cubes.
 */

/**
 * Arranges groups into rows and computes world positions for every group plane
 * and cube. Uses a greedy pairing (sort by size descending, then pair the widest
 * remaining group with the narrowest) to minimise the maximum row width, producing
 * the most square ground area.
 * @param  {{ groups: !GroupDataType[], basePadding: !number }} config - groups to lay out and padding around the ground plane. Mandatory.
 * @return {LayoutType}
 * @example
 *     const layout = layoutGroups({ groups, basePadding: 1.5 });
 *     scene.add(createBasePlane(layout.baseSize));
 */
function layoutGroups({ groups, basePadding }) {
  const sorted = [...groups].sort(function(a, b) {
    return b.modules.length - a.modules.length;
  });

  /** @type {GroupDataType[][]} */
  const rows = [];
  for (let i = 0; i < Math.ceil(sorted.length / 2); i++) {
    const pair   = [sorted[i]];
    const mirror = sorted[sorted.length - 1 - i];
    if (mirror !== sorted[i]) pair.push(mirror);
    rows.push(pair);
  }

  /** @type {number[]} */
  const rowWidths = rows.map(function(row) {
    return row.reduce(function(sum, g) {
      return sum + groupWidth(g.modules.length);
    }, 0) + (row.length - 1) * GROUP_GAP;
  });

  /** @type {number} */
  const maxRowWidth = Math.max(...rowWidths);

  /** @type {number} */
  const totalLayoutY = rows.length * GROUP_DEPTH + (rows.length - 1) * GROUP_GAP;

  /** @type {number} */
  const step = CUBE_SIZE + CUBE_GAP;

  /** @type {GroupPlacementType[]} */
  const groupPlacements = [];

  /** @type {number} */
  let rowY = (totalLayoutY - GROUP_DEPTH) / 2;

  for (let r = 0; r < rows.length; r++) {
    const row      = rows[r];
    const rowWidth = rowWidths[r];

    /** @type {number} */
    let colX = -(rowWidth / 2);

    for (let c = 0; c < row.length; c++) {
      const group        = row[c];
      const gw           = groupWidth(group.modules.length);
      const groupCenterX = colX + gw / 2;
      const groupCenterY = rowY;
      const startCubeX   = groupCenterX - ((group.modules.length - 1) * step) / 2;

      groupPlacements.push({
        group: group
      , x:     groupCenterX
      , y:     groupCenterY
      , cubes: group.modules.map(function(mod, i) {
          return { module: mod, x: startCubeX + i * step, y: groupCenterY };
        })
      });

      colX += gw + GROUP_GAP;
    }

    rowY -= GROUP_DEPTH + GROUP_GAP;
  }

  return {
    baseSize: {
      width: maxRowWidth + basePadding * 2
    , depth: totalLayoutY + basePadding * 2
    }
  , groupPlacements: groupPlacements
  };
}
